// server/routes/tagRoutes.js - (已修复) 处理标签管理的路由模块

const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// --- 数据库连接配置 ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '198386', // 你的密码
    database: 'gallery_db'
};

// 1. 获取所有标签和别名 (GET /api/tags)
router.get('/tags', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [tags] = await connection.execute('SELECT * FROM tags ORDER BY primary_name_en ASC');
        const [aliases] = await connection.execute('SELECT * FROM tag_aliases');

        const tagMap = {};
        tags.forEach(tag => {
            tagMap[tag.id] = { ...tag, aliases: [] };
        });
        aliases.forEach(alias => {
            if (tagMap[alias.tag_id]) {
                tagMap[alias.tag_id].aliases.push(alias);
            }
        });

        res.json(Object.values(tagMap));
    } catch (error) {
        console.error('获取标签失败:', error);
        res.status(500).json({ message: '服务器内部错误' });
    } finally {
        if (connection) await connection.end();
    }
});

// 2. 添加一个新的标签概念 (POST /api/tags) - [重要更新]
router.post('/tags', async (req, res) => {
    // 接收一个主英文名和一个别名数组
    const { primary_name_en, aliases } = req.body;
    if (!primary_name_en || !aliases || !Array.isArray(aliases) || aliases.length === 0) {
        return res.status(400).json({ message: '缺少必要字段或别名数组为空' });
    }

    // 使用别名数组中的第一个名字作为主表中的'name'字段
    const primaryDisplayName = aliases[0].name;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        // 步骤 1: 插入主标签概念
        const [tagResult] = await connection.execute(
            'INSERT INTO tags (name, primary_name_en) VALUES (?, ?)',
            [primaryDisplayName, primary_name_en]
        );
        const tagId = tagResult.insertId;

        // 步骤 2: 遍历别名数组，并将每一条插入到 tag_aliases 表中
        for (const alias of aliases) {
            if (alias.name && alias.lang) { // 确保别名对象是有效的
                await connection.execute(
                    'INSERT INTO tag_aliases (tag_id, name, lang) VALUES (?, ?, ?)',
                    [tagId, alias.name, alias.lang]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ success: true, message: '标签及所有别名创建成功' });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error('添加标签失败:', error);
        res.status(500).json({ message: '添加失败，可能是主英文名重复' });
    } finally {
        if (connection) await connection.end();
    }
});


// 3. 为已存在的标签添加一个新别名 (POST /api/aliases)
router.post('/aliases', async (req, res) => {
    const { tag_id, name, lang } = req.body;
    if (!tag_id || !name || !lang) {
        return res.status(400).json({ message: '缺少必要字段' });
    }
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO tag_aliases (tag_id, name, lang) VALUES (?, ?, ?)',
            [tag_id, name, lang]
        );
        res.status(201).json({ success: true, message: '别名添加成功' });
    } catch (error) {
        console.error('添加别名失败:', error);
        res.status(500).json({ message: '添加别名失败' });
    } finally {
        if (connection) await connection.end();
    }
});

// 4. 更新一个别名 (PUT /api/aliases/:id)
router.put('/aliases/:id', async (req, res) => {
    const { id } = req.params;
    const { name, lang } = req.body;
    if (!name || !lang) {
        return res.status(400).json({ message: '缺少必要字段' });
    }
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'UPDATE tag_aliases SET name = ?, lang = ? WHERE id = ?',
            [name, lang, id]
        );
        res.json({ success: true, message: '别名更新成功' });
    } catch (error) {
        console.error('更新别名失败:', error);
        res.status(500).json({ message: '更新别名失败' });
    } finally {
        if (connection) await connection.end();
    }
});

// 5. 删除一个别名 (DELETE /api/aliases/:id)
router.delete('/aliases/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM tag_aliases WHERE id = ?', [id]);
        res.json({ success: true, message: '别名删除成功' });
    } catch (error) {
        console.error('删除别名失败:', error);
        res.status(500).json({ message: '删除别名失败' });
    } finally {
        if (connection) await connection.end();
    }
});

// 6. 删除一个标签概念 (及其所有别名) (DELETE /api/tags/:id)
router.delete('/tags/:id', async (req, res) => {
    const { id } = req.params;
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM tags WHERE id = ?', [id]);
        res.json({ success: true, message: '标签概念删除成功' });
    } catch (error) {
        console.error('删除标签失败:', error);
        res.status(500).json({ message: '删除标签失败' });
    } finally {
        if (connection) await connection.end();
    }
});

module.exports = router;