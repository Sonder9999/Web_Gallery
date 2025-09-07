// server/routes/tagRoutes.js - 支持层级结构和高级搜索的标签路由
const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// --- 数据库连接配置 ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '198386',
    database: 'gallery_db'
};

// --- [新增] 高级搜索查询解析器 ---
function parseSearchQuery(query) {
    const forced = []; // +word
    const excluded = []; // -word
    const orGroups = []; // word1|word2 word3

    // 预处理，将空格和 | 都视作 OR 分隔符
    const terms = query.replace(/\|/g, ' ').split(/\s+/).filter(Boolean);

    let currentOrGroup = [];

    terms.forEach(term => {
        if (term.startsWith('+')) {
            forced.push(term.substring(1));
        } else if (term.startsWith('-')) {
            excluded.push(term.substring(1));
        } else {
            currentOrGroup.push(term);
        }
    });

    if (currentOrGroup.length > 0) {
        orGroups.push(currentOrGroup);
    }

    return { forced, excluded, orGroups };
}


// --- [核心修改] 更新搜索路由以支持高级搜索 ---
router.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        // 如果查询为空，返回所有图片
        return res.redirect('/api/images');
    }

    const { forced, excluded, orGroups } = parseSearchQuery(query);

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        let sql = `
            SELECT DISTINCT i.id, i.filename, i.filepath, i.width, i.height, i.aspect_ratio, i.uploaded_at
            FROM images i
            LEFT JOIN image_tags it ON i.id = it.image_id
            LEFT JOIN tag_aliases ta ON it.tag_id = ta.tag_id
            WHERE 1=1
        `;
        const params = [];

        // 1. 处理强制包含 (+)
        if (forced.length > 0) {
            forced.forEach(term => {
                sql += ` AND (i.filename LIKE ? OR ta.name LIKE ?)`;
                params.push(`%${term}%`, `%${term}%`);
            });
        }

        // 2. 处理排除 (-)
        if (excluded.length > 0) {
            excluded.forEach(term => {
                sql += ` AND i.id NOT IN (
                    SELECT i2.id FROM images i2
                    LEFT JOIN image_tags it2 ON i2.id = it2.image_id
                    LEFT JOIN tag_aliases ta2 ON it2.tag_id = ta2.tag_id
                    WHERE i2.filename LIKE ? OR ta2.name LIKE ?
                )`;
                params.push(`%${term}%`, `%${term}%`);
            });
        }

        // 3. 处理 OR 逻辑
        if (orGroups.length > 0 && orGroups[0].length > 0) {
            const orConditions = orGroups[0].map(() => `(i.filename LIKE ? OR ta.name LIKE ?)`).join(' OR ');
            sql += ` AND (${orConditions})`;
            orGroups[0].forEach(term => {
                params.push(`%${term}%`, `%${term}%`);
            });
        }

        sql += ` ORDER BY i.uploaded_at DESC;`;

        const [results] = await connection.execute(sql, params);
        res.json(results);

    } catch (error) {
        console.error('高级搜索失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    } finally {
        if (connection) await connection.end();
    }
});


// ... (文件的其余部分保持不变, 从这里开始复制)
// 构建树形结构的辅助函数
function buildTree(flatData) {
    const map = {};
    const roots = [];
    flatData.forEach(item => { map[item.id] = { ...item, children: [] }; });
    flatData.forEach(item => {
        if (item.parent_id && map[item.parent_id]) {
            map[item.parent_id].children.push(map[item.id]);
        } else {
            roots.push(map[item.id]);
        }
    });
    return roots;
}
// 1. 获取所有标签（树形结构）(GET /api/tags)
router.get('/tags', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [tags] = await connection.execute(`
            SELECT id, name, primary_name_en, parent_id FROM tags ORDER BY parent_id, primary_name_en ASC
        `);
        const [aliases] = await connection.execute('SELECT * FROM tag_aliases');
        const tagMap = {};
        tags.forEach(tag => { tagMap[tag.id] = { ...tag, aliases: [] }; });
        aliases.forEach(alias => {
            if (tagMap[alias.tag_id]) {
                tagMap[alias.tag_id].aliases.push({ id: alias.id, name: alias.name, lang: alias.lang });
            }
        });
        const treeData = buildTree(Object.values(tagMap));
        res.json(treeData);
    } catch (error) {
        console.error('获取标签失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    } finally {
        if (connection) await connection.end();
    }
});
// 2. 添加新标签（支持层级）(POST /api/tags)
router.post('/tags', async (req, res) => {
    const { primary_name_en, aliases, parent_id } = req.body;
    if (!primary_name_en || !aliases || !Array.isArray(aliases) || aliases.length === 0) {
        return res.status(400).json({ message: '缺少必要字段或别名数组为空' });
    }
    const zhAlias = aliases.find(a => a.lang === 'zh');
    const primaryDisplayName = zhAlias ? zhAlias.name : aliases[0].name;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();
        const [tagResult] = await connection.execute(
            'INSERT INTO tags (name, primary_name_en, parent_id) VALUES (?, ?, ?)',
            [primaryDisplayName, primary_name_en, parent_id || null]
        );
        const tagId = tagResult.insertId;
        for (const alias of aliases) {
            if (alias.name && alias.lang) {
                await connection.execute(
                    'INSERT INTO tag_aliases (tag_id, name, lang) VALUES (?, ?, ?)',
                    [tagId, alias.name, alias.lang]
                );
            }
        }
        await connection.commit();
        res.status(201).json({ success: true, message: '标签创建成功', id: tagId });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('添加标签失败:', error);
        res.status(500).json({ message: '添加失败: ' + error.message });
    } finally {
        if (connection) await connection.end();
    }
});
// 3. 更新标签（支持层级）(PUT /api/tags/:id)
router.put('/tags/:id', async (req, res) => {
    const { id } = req.params;
    const { primary_name_en, aliases, parent_id } = req.body;
    if (!primary_name_en || !aliases || !Array.isArray(aliases)) {
        return res.status(400).json({ message: '缺少必要字段' });
    }
    const zhAlias = aliases.find(a => a.lang === 'zh');
    const primaryDisplayName = zhAlias ? zhAlias.name : aliases[0].name;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();
        await connection.execute(
            'UPDATE tags SET name = ?, primary_name_en = ?, parent_id = ? WHERE id = ?',
            [primaryDisplayName, primary_name_en, parent_id || null, id]
        );
        await connection.execute('DELETE FROM tag_aliases WHERE tag_id = ?', [id]);
        for (const alias of aliases) {
            if (alias.name && alias.lang) {
                await connection.execute(
                    'INSERT INTO tag_aliases (tag_id, name, lang) VALUES (?, ?, ?)',
                    [id, alias.name, alias.lang]
                );
            }
        }
        await connection.commit();
        res.json({ success: true, message: '标签更新成功' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('更新标签失败:', error);
        res.status(500).json({ message: '更新失败: ' + error.message });
    } finally {
        if (connection) await connection.end();
    }
});
// 4. 删除标签（处理子标签）(DELETE /api/tags/:id)
router.delete('/tags/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();
        const [children] = await connection.execute('SELECT id FROM tags WHERE parent_id = ?', [id]);
        if (children.length > 0) {
            await connection.execute('UPDATE tags SET parent_id = NULL WHERE parent_id = ?', [id]);
        }
        await connection.execute('DELETE FROM tags WHERE id = ?', [id]);
        await connection.commit();
        res.json({ success: true, message: `标签删除成功${children.length > 0 ? `，${children.length} 个子标签已变为顶级标签` : ''}` });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('删除标签失败:', error);
        res.status(500).json({ message: '删除失败: ' + error.message });
    } finally {
        if (connection) await connection.end();
    }
});
// 5. 获取标签路径（面包屑导航用）(GET /api/tags/:id/path)
router.get('/tags/:id/path', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const path = [];
        let currentId = id;
        while (currentId) {
            const [rows] = await connection.execute('SELECT id, name, parent_id FROM tags WHERE id = ?', [currentId]);
            if (rows.length === 0) break;
            path.unshift(rows[0]);
            currentId = rows[0].parent_id;
        }
        res.json(path);
    } catch (error) {
        console.error('获取标签路径失败:', error);
        res.status(500).json({ message: '获取路径失败' });
    } finally {
        if (connection) await connection.end();
    }
});
// [MODIFIED] 获取所有图片 (GET /api/images) - 现在只返回 is_hidden = 0 的图片
router.get('/images', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [images] = await connection.execute(`
            SELECT id, filename, filepath, filesize, width, height, aspect_ratio, uploaded_at, is_hidden
            FROM images
            WHERE is_hidden = 0
            ORDER BY uploaded_at DESC
        `);
        res.json(images);
    } catch (error) {
        console.error('获取图片列表失败:', error);
        res.status(500).json({ message: '获取图片列表失败' });
    } finally {
        if (connection) await connection.end();
    }
});

// [NEW] 更新单个图片的显示状态 (PUT /api/images/:id/visibility)
router.put('/images/:id/visibility', async (req, res) => {
    const { id } = req.params;
    const { is_hidden } = req.body;

    if (typeof is_hidden !== 'boolean') {
        return res.status(400).json({ message: 'is_hidden 必须是一个布尔值' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE images SET is_hidden = ? WHERE id = ?',
            [is_hidden ? 1 : 0, id]
        );
        res.json({ success: true, message: '图片可见性更新成功' });
    } catch (error) {
        console.error('更新图片可见性失败:', error);
        res.status(500).json({ message: '服务器错误: ' + error.message });
    } finally {
        if (connection) await connection.end();
    }
});


// 获取单个图片的标签 (GET /api/images/:id/tags)
router.get('/images/:id/tags', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const imageId = req.params.id;
        const [tags] = await connection.execute(`
            SELECT t.id, t.name, t.primary_name_en FROM tags t
            INNER JOIN image_tags it ON t.id = it.tag_id
            WHERE it.image_id = ? ORDER BY t.name
        `, [imageId]);
        res.json(tags);
    } catch (error) {
        console.error('获取图片标签失败:', error);
        res.status(500).json({ message: '获取图片标签失败' });
    } finally {
        if (connection) await connection.end();
    }
});

// [新增] 获取特定标签下的所有图片 (GET /api/tags/:id/images)
router.get('/tags/:id/images', async (req, res) => {
    const tagId = req.params.id;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [images] = await connection.execute(`
            SELECT i.id, i.filename, i.filepath, i.width, i.height
            FROM images i
            INNER JOIN image_tags it ON i.id = it.image_id
            WHERE it.tag_id = ?
        `, [tagId]);

        res.json(images);
    } catch (error) {
        console.error(`获取标签 ${tagId} 的图片失败:`, error);
        res.status(500).json({ message: '服务器内部错误' });
    } finally {
        if (connection) await connection.end();
    }
});

module.exports = router;