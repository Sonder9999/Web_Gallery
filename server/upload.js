// server/upload.js - 处理图片上传和数据库存储的后端服务

const express = require('express');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000; // 后端服务运行的端口

// --- 数据库连接配置 (请根据您的实际情况修改) ---
const dbConfig = {
    host: 'localhost',      // 数据库主机名
    user: 'root',           // 数据库用户名
    password: '198386', // 您的数据库密码
    database: 'gallery_db'    // 数据库名称
};

// --- 中间件配置 ---
app.use(cors()); // 允许跨域请求 (因为前端和后端在不同端口)
app.use(express.json()); // 解析JSON格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体

// --- 文件存储配置 (使用 multer) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // 将文件存储在项目根目录下的 'images/' 文件夹中
        cb(null, path.join(__dirname, '../images/'));
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名: 时间戳-随机数.扩展名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// --- API 路由: 处理图片上传 ---
app.post('/upload', upload.single('image'), async (req, res) => {
    // 'image' 必须与前端 FormData 中的字段名一致
    if (!req.file) {
        return res.status(400).json({ success: false, message: '没有接收到图片文件' });
    }

    // 从请求中获取数据
    const { tags, source } = req.body;
    const { filename, path: filepath, size } = req.file;

    let connection;
    try {
        // 1. 连接数据库
        connection = await mysql.createConnection(dbConfig);

        // 2. 将图片信息插入 'images' 表
        const [imageResult] = await connection.execute(
            'INSERT INTO images (filename, filepath, filesize, source_url) VALUES (?, ?, ?, ?)',
            [filename, filepath, size, source || '']
        );
        const imageId = imageResult.insertId;

        // 3. 处理标签
        if (tags && tags.length > 0) {
            const tagList = JSON.parse(tags); // 前端发送的是JSON字符串
            for (const tagName of tagList) {
                // 查找或创建标签
                let [rows] = await connection.execute('SELECT id FROM tags WHERE name = ?', [tagName]);
                let tagId;

                if (rows.length > 0) {
                    tagId = rows[0].id; // 标签已存在
                } else {
                    // 插入新标签
                    const [tagResult] = await connection.execute('INSERT INTO tags (name) VALUES (?)', [tagName]);
                    tagId = tagResult.insertId;
                }

                // 4. 在 'image_tags' 表中创建关联
                await connection.execute('INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?)', [imageId, tagId]);
            }
        }

        res.status(200).json({ success: true, message: '图片上传并保存成功！', file: req.file });

    } catch (error) {
        console.error('上传处理失败:', error);
        res.status(500).json({ success: false, message: '服务器内部错误' });
    } finally {
        if (connection) {
            await connection.end(); // 关闭数据库连接
        }
    }
});

// --- 启动服务器 ---
app.listen(port, () => {
    console.log(`后端服务已启动，正在监听 http://localhost:${port}`);
    // 确保 'images' 文件夹存在
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '../images/');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }
});