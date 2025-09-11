// server.js (主服务入口文件)

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3000;

// --- 中间件配置 ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 静态文件服务 ---
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/pages', express.static(path.join(__dirname, 'pages')));

// --- 数据库路径兼容性配置 ---
// 数据库中存储的路径格式：images/文件夹名/文件名.jpg
// 将 /images 映射到 public/images，保持数据库路径兼容
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/media', express.static(path.join(__dirname, 'public/media')));

// --- 根目录静态文件服务（向后兼容） ---
app.use(express.static(path.join(__dirname)));

// --- 路由重定向 (兼容旧链接) ---
app.get('/index.html', (req, res) => {
    res.redirect(301, '/pages/gallery/gallery.html');
});

app.get('/gallery.html', (req, res) => {
    res.redirect(301, '/pages/gallery/gallery.html');
});

app.get('/tags.html', (req, res) => {
    res.redirect(301, '/pages/tags-upload/tags-upload.html');
});

app.get('/tags-upload.html', (req, res) => {
    res.redirect(301, '/pages/tags-upload/tags-upload.html');
});

app.get('/upload.html', (req, res) => {
    res.redirect(301, '/pages/gallery-upload/gallery-upload.html');
});

app.get('/gallery-upload.html', (req, res) => {
    res.redirect(301, '/pages/gallery-upload/gallery-upload.html');
});

app.get('/tags-gallery.html', (req, res) => {
    res.redirect(301, '/pages/tags-gallery/tags-gallery.html');
});

// --- 默认首页重定向 ---
app.get('/', (req, res) => {
    res.redirect('/pages/gallery/gallery.html');
});

// --- 1. 引入你的路由模块 ---
const uploadRoutes = require('./server/routes/uploadRoutes.js'); // 引入上传路由
const tagRoutes = require('./server/routes/tagRoutes.js');      // 引入标签管理路由


// --- 2. 挂载路由 ---
// 所有以 /api 开头的请求，都交给 tagRoutes 模块来处理
app.use('/api', tagRoutes);

// 所有根路径下的请求 (如 /upload, /overwrite)，都交给 uploadRoutes 模块来处理
app.use('/', uploadRoutes);


// --- 3. 启动服务器 ---
app.listen(port, () => {
    console.log(`主服务已启动，正在监听 http://localhost:${port}`);
    console.log('-> 图片上传模块已加载。');
    console.log('-> 标签管理API已加载在 /api 路径下。');
    console.log('-> 文件重命名重定向已配置：');
    console.log('   • /index.html → /pages/gallery/gallery.html');
    console.log('   • /gallery.html → /pages/gallery/gallery.html');
    console.log('   • /tags.html → /pages/tags-upload/tags-upload.html');
    console.log('   • /tags-upload.html → /pages/tags-upload/tags-upload.html');
    console.log('   • /upload.html → /pages/gallery-upload/gallery-upload.html');
    console.log('   • /gallery-upload.html → /pages/gallery-upload/gallery-upload.html');
    console.log('   • /tags-gallery.html → /pages/tags-gallery/tags-gallery.html');
});