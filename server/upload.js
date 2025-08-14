// server/upload.js - (升级版) 处理图片上传，增加哈希校验防止重复

const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto'); // 引入Node.js内置的加密模块
const fs = require('fs').promises; // 引入文件系统模块的Promise版本

const app = express();
const port = 3000;

// --- 数据库连接配置 (请根据您的实际情况修改) ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '198386', // 请确保这里是你的正确密码
    database: 'gallery_db'
};

// --- 中间件配置 ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 文件存储配置：改为先存入内存，方便计算哈希 ---
const storage = multer.memoryStorage(); // 将文件暂存到内存中
const upload = multer({ storage: storage });

// --- API 路由: 处理图片上传 ---
app.post('/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: '没有接收到图片文件' });
    }

    // 从内存中获取文件内容 (Buffer)
    const fileBuffer = req.file.buffer;

    // 1. 计算文件的 SHA256 哈希值
    const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);

        // 2. 检查数据库中是否已存在该哈希值
        const [existingImages] = await connection.execute(
            'SELECT * FROM images WHERE file_hash = ?',
            [hash]
        );

        // 如果找到了具有相同哈希值的图片，说明文件已存在
        if (existingImages.length > 0) {
            return res.status(200).json({ // 使用200状态码，但告知客户端是重复文件
                success: true, // 操作本身是成功的
                duplicate: true, // 标记为重复
                message: '文件已存在，无需重复上传。',
                image: existingImages[0] // 返回已存在的图片信息
            });
        }

        // --- 如果文件是新的，则继续保存流程 ---

        // 3. 生成唯一文件名并确定保存路径
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const newFilename = uniqueSuffix + path.extname(req.file.originalname);
        const uploadPath = path.join(__dirname, '../images/');
        const filepath = path.join(uploadPath, newFilename);

        // 确保images文件夹存在
        await fs.mkdir(uploadPath, { recursive: true });

        // 4. 将文件从内存写入磁盘
        await fs.writeFile(filepath, fileBuffer);

        // 5. 将新图片信息存入数据库
        const { tags, source } = req.body;
        const { size } = req.file;

        const [imageResult] = await connection.execute(
            'INSERT INTO images (filename, filepath, filesize, source_url, file_hash) VALUES (?, ?, ?, ?, ?)',
            [newFilename, filepath, size, source || '', hash] // 存入哈希值
        );
        const imageId = imageResult.insertId;

        // 6. 处理标签 (逻辑不变)
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

        res.status(201).json({ // 使用201 Created状态码表示新资源已创建
            success: true,
            duplicate: false,
            message: '图片上传成功！',
            file: { ...req.file, destination: uploadPath, path: filepath }
        });

    } catch (error) {
        console.error('上传处理失败:', error);
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