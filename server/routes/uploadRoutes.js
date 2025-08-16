// server/routes/uploadRoutes.js - 处理图片上传的路由模块

const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs').promises;
const { imageSize: sizeOf } = require('image-size');

const router = express.Router();

// --- [新增] 文件名语言配置开关 ---
// 在这里修改你希望生成文件名的语言。可选值: 'en', 'zh', 'ja', 'pinyin' 等
const FILENAME_LANGUAGE = 'en';

// --- 数据库连接配置 ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '198386', // 这里是你的密码
    database: 'gallery_db'
};

// --- 文件存储配置 ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * 封装的数据库事务处理函数，用于更新图片信息
 */
async function updateImageInfo(connection, imageId, tagNames, source) {
    // 1. 删除旧的标签关联
    await connection.execute('DELETE FROM image_tags WHERE image_id = ?', [imageId]);

    // 2. 更新来源
    await connection.execute('UPDATE images SET source_url = ? WHERE id = ?', [source || '', imageId]);

    // 3. 插入新的标签关联
    if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
            const [aliasRows] = await connection.execute('SELECT tag_id FROM tag_aliases WHERE name = ?', [tagName]);
            let tagId;

            if (aliasRows.length > 0) {
                tagId = aliasRows[0].tag_id;
            } else {
                const [tagResult] = await connection.execute('INSERT INTO tags (name, primary_name_en) VALUES (?, ?)', [tagName, tagName.toLowerCase().replace(/\s+/g, '_')]);
                tagId = tagResult.insertId;
                await connection.execute('INSERT INTO tag_aliases (tag_id, name, lang) VALUES (?, ?, ?)', [tagId, tagName, 'zh']);
            }
            await connection.execute('INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?)', [imageId, tagId]);
        }
    }
}

/**
 * 根据标签生成文件名的函数
 */
async function generateFilenameFromTags(connection, tagNames, originalExtension) {
    let nameParts = [];
    if (tagNames && tagNames.length > 0) {
        for (const tagName of tagNames) {
            const [aliasRows] = await connection.execute('SELECT tag_id FROM tag_aliases WHERE name = ?', [tagName]);

            if (aliasRows.length > 0) {
                const tagId = aliasRows[0].tag_id;
                const [translateRows] = await connection.execute(
                    'SELECT name FROM tag_aliases WHERE tag_id = ? AND lang = ?',
                    [tagId, FILENAME_LANGUAGE]
                );

                if (translateRows.length > 0) {
                    nameParts.push(translateRows[0].name);
                } else {
                    // 如果没有英文别名，使用原始标签名
                    nameParts.push(tagName.toLowerCase().replace(/\s+/g, '_'));
                }
            } else {
                // 如果标签不存在于数据库中，直接使用原始名称
                nameParts.push(tagName.toLowerCase().replace(/\s+/g, '_'));
            }
        }
    }

    // 按 a-z 排序
    // nameParts.sort((a, b) => a.localeCompare(b));

    let baseName = nameParts.map(part => part.toLowerCase().replace(/\s+/g, '_')).join('_');
    if (!baseName) {
        baseName = `image_${Date.now()}`;
    }
    const shortId = crypto.randomBytes(3).toString('hex');
    return `${baseName}_${shortId}${originalExtension}`;
}


// --- API 路由: 处理【新】图片上传 ---
router.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '没有接收到图片文件' });
    }
    const { tags, source } = req.body;
    const tagList = (tags && tags.length > 0) ? JSON.parse(tags) : [];

    const fileBuffer = req.file.buffer;
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const dimensions = sizeOf(fileBuffer);
    const aspectRatio = dimensions.height > 0 ? dimensions.width / dimensions.height : 0;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [existingImages] = await connection.execute('SELECT * FROM images WHERE file_hash = ?', [hash]);

        if (existingImages.length > 0) {
            return res.status(200).json({
                success: true, duplicate: true, message: '文件已存在，无需重复上传。', image: existingImages[0]
            });
        }

        const newFilename = await generateFilenameFromTags(connection, tagList, path.extname(req.file.originalname));
        const uploadPath = path.join(__dirname, '../../images/'); // 路径调整
        const filepath = path.join(uploadPath, newFilename);

        await fs.mkdir(uploadPath, { recursive: true });
        await fs.writeFile(filepath, fileBuffer);

        await connection.beginTransaction();
        const [imageResult] = await connection.execute(
            'INSERT INTO images (filename, filepath, filesize, width, height, aspect_ratio, source_url, file_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newFilename, `images/${newFilename}`, req.file.size, dimensions.width, dimensions.height, aspectRatio, source || '', hash]
        );
        const imageId = imageResult.insertId;

        await updateImageInfo(connection, imageId, tagList, source);
        await connection.commit();

        res.status(201).json({
            success: true, duplicate: false, message: '图片上传成功！', file: { ...req.file, destination: uploadPath, path: filepath }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('上传处理失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    } finally {
        if (connection) await connection.end();
    }
});



// --- API 路由: 处理【覆盖更新】 ---
router.post('/overwrite', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '没有接收到图片文件' });
    }

    const { tags, source } = req.body;
    const tagList = (tags && tags.length > 0) ? JSON.parse(tags) : [];
    const fileBuffer = req.file.buffer;
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [existingImages] = await connection.execute('SELECT id FROM images WHERE file_hash = ?', [hash]);
        if (existingImages.length === 0) {
            return res.status(404).json({ success: false, message: '未找到要覆盖的原始图片记录。' });
        }
        const imageId = existingImages[0].id;

        await connection.beginTransaction();
        await updateImageInfo(connection, imageId, tagList, source);
        await connection.commit();

        res.status(200).json({ success: true, message: '图片信息覆盖更新成功！' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('覆盖更新失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    } finally {
        if (connection) await connection.end();
    }
});

// --- [新增] API 路由: 获取所有图片信息用于主页展示 ---
router.get('/api/images', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // 从数据库查询所有图片，并选择需要的字段
        // 按ID降序排序，让最新上传的图片显示在最前面
        const [images] = await connection.execute(
            'SELECT id, filename, filepath, width, height FROM images ORDER BY id DESC'
        );

        res.status(200).json(images);
    } catch (error) {
        console.error('获取图片列表失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});

module.exports = router;