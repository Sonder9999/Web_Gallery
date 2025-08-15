// server/upload.js - (最终版) 增加哈希校验和覆盖更新功能

const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs').promises;
const { imageSize: sizeOf } = require('image-size');

const app = express();
const port = 3000;

// --- 数据库连接配置 (请根据您的实际情况修改) ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '198386', // 这里是你的密码
    database: 'gallery_db'
};

// --- 中间件配置 ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 文件存储配置 ---
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * 封装的数据库事务处理函数，用于更新图片信息
 */
async function updateImageInfo(connection, imageId, tags, source) {
    await connection.execute('DELETE FROM image_tags WHERE image_id = ?', [imageId]);
    await connection.execute('UPDATE images SET source_url = ? WHERE id = ?', [source || '', imageId]);
    if (tags && tags.length > 0) {
        const tagList = JSON.parse(tags);
        for (const tagName of tagList) {
            let [rows] = await connection.execute('SELECT id FROM tags WHERE name = ?', [tagName]);
            let tagId;
            if (rows.length > 0) {
                tagId = rows[0].id;
            } else {
                const [tagResult] = await connection.execute('INSERT INTO tags (name) VALUES (?)', [tagName]);
                tagId = tagResult.insertId;
            }
            await connection.execute('INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?)', [imageId, tagId]);
        }
    }
}


// --- API 路由: 处理【新】图片上传 ---
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '没有接收到图片文件' });
    }

    const fileBuffer = req.file.buffer;
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const dimensions = sizeOf(fileBuffer);

    // --- [新增] 计算宽高比 ---
    // 防止高度为0导致除法错误
    const aspectRatio = dimensions.height > 0 ? dimensions.width / dimensions.height : 0;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [existingImages] = await connection.execute('SELECT * FROM images WHERE file_hash = ?', [hash]);

        if (existingImages.length > 0) {
            return res.status(200).json({
                success: true,
                duplicate: true,
                message: '文件已存在，无需重复上传。',
                image: existingImages[0]
            });
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFilename = uniqueSuffix + path.extname(req.file.originalname);
        const uploadPath = path.join(__dirname, '../images/');
        const filepath = path.join(uploadPath, newFilename);

        await fs.mkdir(uploadPath, { recursive: true });
        await fs.writeFile(filepath, fileBuffer);

        const { tags, source } = req.body;
        const { size } = req.file;

        await connection.beginTransaction();

        // --- [修改] INSERT 语句，增加 aspect_ratio ---
        const [imageResult] = await connection.execute(
            'INSERT INTO images (filename, filepath, filesize, width, height, aspect_ratio, source_url, file_hash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [newFilename, `images/${newFilename}`, size, dimensions.width, dimensions.height, aspectRatio, source || '', hash]
        );
        const imageId = imageResult.insertId;

        await updateImageInfo(connection, imageId, tags, source);
        await connection.commit();

        res.status(201).json({
            success: true,
            duplicate: false,
            message: '图片上传成功！',
            file: { ...req.file, destination: uploadPath, path: filepath }
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('上传处理失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});



// --- API 路由: 处理【覆盖更新】 ---
app.post('/overwrite', upload.single('image'), async (req, res) => {
    // ... (这部分逻辑基本不变，因为覆盖只是更新标签和来源，文件的尺寸是不会变的) ...
    if (!req.file) {
        return res.status(400).json({ success: false, message: '没有接收到图片文件' });
    }

    const fileBuffer = req.file.buffer;
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const { tags, source } = req.body;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [existingImages] = await connection.execute('SELECT id FROM images WHERE file_hash = ?', [hash]);

        if (existingImages.length === 0) {
            return res.status(404).json({ success: false, message: '未找到要覆盖的原始图片记录。' });
        }

        const imageId = existingImages[0].id;

        await connection.beginTransaction();
        await updateImageInfo(connection, imageId, tags, source);
        await connection.commit();

        res.status(200).json({ success: true, message: '图片信息覆盖更新成功！' });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error('覆盖更新失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
});


// --- 启动服务器 ---
app.listen(port, () => {
    console.log(`后端服务已启动，正在监听 http://localhost:${port}`);
});