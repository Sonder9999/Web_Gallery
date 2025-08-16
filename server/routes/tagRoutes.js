// server/routes/tagRoutes.js - 支持层级结构的标签路由
// filepath: f:\Study\ComputerScience\OtherClass\web\Gallery\server\routes\tagRoutes.js
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

// 构建树形结构的辅助函数
function buildTree(flatData) {
    const map = {};
    const roots = [];

    // 先创建映射
    flatData.forEach(item => {
        map[item.id] = { ...item, children: [] };
    });

    // 构建树形结构
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

        // 获取所有标签（包含 parent_id）
        const [tags] = await connection.execute(`
            SELECT id, name, primary_name_en, parent_id
            FROM tags
            ORDER BY parent_id, primary_name_en ASC
        `);

        // 获取所有别名
        const [aliases] = await connection.execute('SELECT * FROM tag_aliases');

        // 组装数据
        const tagMap = {};
        tags.forEach(tag => {
            tagMap[tag.id] = { ...tag, aliases: [] };
        });

        aliases.forEach(alias => {
            if (tagMap[alias.tag_id]) {
                tagMap[alias.tag_id].aliases.push({
                    id: alias.id,
                    name: alias.name,
                    lang: alias.lang
                });
            }
        });

        // 转换为树形结构
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

    // 使用中文别名作为主显示名称
    const zhAlias = aliases.find(a => a.lang === 'zh');
    const primaryDisplayName = zhAlias ? zhAlias.name : aliases[0].name;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        // 插入主标签（包含 parent_id）
        const [tagResult] = await connection.execute(
            'INSERT INTO tags (name, primary_name_en, parent_id) VALUES (?, ?, ?)',
            [primaryDisplayName, primary_name_en, parent_id || null]
        );
        const tagId = tagResult.insertId;

        // 插入所有别名
        for (const alias of aliases) {
            if (alias.name && alias.lang) {
                await connection.execute(
                    'INSERT INTO tag_aliases (tag_id, name, lang) VALUES (?, ?, ?)',
                    [tagId, alias.name, alias.lang]
                );
            }
        }

        await connection.commit();
        res.status(201).json({
            success: true,
            message: '标签创建成功',
            id: tagId
        });
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

        // 更新主标签
        await connection.execute(
            'UPDATE tags SET name = ?, primary_name_en = ?, parent_id = ? WHERE id = ?',
            [primaryDisplayName, primary_name_en, parent_id || null, id]
        );

        // 删除旧的别名
        await connection.execute('DELETE FROM tag_aliases WHERE tag_id = ?', [id]);

        // 插入新的别名
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

        // 检查是否有子标签
        const [children] = await connection.execute(
            'SELECT id FROM tags WHERE parent_id = ?', [id]
        );

        // 将子标签的 parent_id 设为 NULL（变为顶级标签）
        if (children.length > 0) {
            await connection.execute(
                'UPDATE tags SET parent_id = NULL WHERE parent_id = ?', [id]
            );
        }

        // 删除标签（外键约束会自动删除相关别名）
        await connection.execute('DELETE FROM tags WHERE id = ?', [id]);

        await connection.commit();
        res.json({
            success: true,
            message: `标签删除成功${children.length > 0 ? `，${children.length} 个子标签已变为顶级标签` : ''}`
        });
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
            const [rows] = await connection.execute(
                'SELECT id, name, parent_id FROM tags WHERE id = ?', [currentId]
            );

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

module.exports = router;