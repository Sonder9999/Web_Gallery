// server.js (主服务入口文件)

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// --- 中间件配置 ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- 1. 引入你的路由模块 ---
const uploadRoutes = require('./server/routes/uploadRoutes.js'); // 引入上传路由
const tagRoutes = require('./server/routes/tagRoutes.js');      // 引入标签管理路由
const searchRoutes = require('./server/routes/searchRoutes.js'); // 引入搜索路由


// --- 2. 挂载路由 ---
// 所有以 /api 开头的请求，都交给 tagRoutes 模块来处理
app.use('/api', tagRoutes);

// 搜索相关API路由
app.use('/api', searchRoutes);

// 所有根路径下的请求 (如 /upload, /overwrite)，都交给 uploadRoutes 模块来处理
app.use('/', uploadRoutes);


// --- 3. 启动服务器 ---
app.listen(port, () => {
    console.log(`主服务已启动，正在监听 http://localhost:${port}`);
    console.log('-> 图片上传模块已加载。');
    console.log('-> 标签管理API已加载在 /api 路径下。');
    console.log('-> 搜索功能API已加载在 /api 路径下。');
});