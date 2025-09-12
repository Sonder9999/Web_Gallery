// config/env.js - 环境配置文件

// 检测当前运行环境
function detectEnvironment() {
    // 优先检查环境变量
    if (process.env.NODE_ENV) {
        return process.env.NODE_ENV;
    }

    // 检查是否在宝塔面板环境中（通过检查特定目录或环境变量）
    if (process.env.BT_PANEL || process.env.SERVER_SOFTWARE) {
        return 'production';
    }

    // 检查常见的生产环境标识
    if (process.env.PM2_HOME || process.env.WEBSITE_HOSTNAME) {
        return 'production';
    }

    // 检查端口号，生产环境通常使用80或443
    const port = process.env.PORT;
    if (port && (port === '80' || port === '443' || port === '8080')) {
        return 'production';
    }

    // 默认为开发环境
    return 'development';
}

const environment = detectEnvironment();

const config = {
    // 当前环境
    NODE_ENV: environment,

    // 服务器配置
    server: {
        port: process.env.PORT || (environment === 'production' ? 80 : 3000),
        host: environment === 'production' ? '0.0.0.0' : 'localhost'
    },

    // 域名配置
    domain: {
        development: 'http://localhost:3000',
        production: 'https://gallery.kisara.xyz'
    },

    // 数据库配置
    database: {
        development: {
            host: 'localhost',
            user: 'root',
            password: '198386',
            database: 'gallery_db',
            waitForConnections: true,
            connectionLimit: 15,
            queueLimit: 0
        },
        production: {
            host: 'localhost', // 宝塔面板通常数据库在本地
            user: 'gallery_user', // 建议在生产环境使用专门的数据库用户
            password: process.env.DB_PASSWORD || '198386', // 建议使用环境变量
            database: 'gallery_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        }
    },

    // 文件上传配置
    upload: {
        development: {
            maxFileSize: 1000 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']
        },
        production: {
            maxFileSize: 1000 * 1024 * 1024,
            allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4']
        }
    },

    // 路径配置
    paths: {
        development: {
            publicPath: '/public',
            imagesPath: '/images',
            mediaPath: '/media'
        },
        production: {
            publicPath: '/public',
            imagesPath: '/images',
            mediaPath: '/media'
        }
    }
};

// 导出当前环境的配置
module.exports = {
    NODE_ENV: config.NODE_ENV,
    isDevelopment: environment === 'development',
    isProduction: environment === 'production',
    server: config.server,
    domain: config.domain[environment],
    database: config.database[environment],
    upload: config.upload[environment],
    paths: config.paths[environment],

    // 辅助函数
    getApiBaseUrl: () => config.domain[environment] + '/api',
    getFullUrl: (path) => config.domain[environment] + path
};