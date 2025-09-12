// public/shared/js/config.js - 前端环境配置加载器

class ConfigManager {
    constructor() {
        this.config = null;
        this.loaded = false;
        this.loadPromise = null;
    }

    // 异步加载配置
    async loadConfig() {
        if (this.loaded) {
            return this.config;
        }

        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this._fetchConfig();
        return this.loadPromise;
    }

    async _fetchConfig() {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.config = await response.json();
            this.loaded = true;
            console.log('环境配置加载成功:', this.config);
            return this.config;
        } catch (error) {
            console.error('加载环境配置失败，使用默认配置:', error);
            // 降级到默认配置（本地开发环境配置）
            this.config = {
                apiBaseUrl: 'http://localhost:3000/api',
                domain: 'http://localhost:3000',
                environment: 'development',
                paths: {
                    publicPath: '/public',
                    imagesPath: '/images',
                    mediaPath: '/media'
                }
            };
            this.loaded = true;
            return this.config;
        }
    }

    // 获取API基础URL
    getApiBaseUrl() {
        if (!this.loaded) {
            console.warn('配置尚未加载，返回默认API URL');
            return 'http://localhost:3000/api';
        }
        return this.config.apiBaseUrl;
    }

    // 获取完整域名
    getDomain() {
        if (!this.loaded) {
            console.warn('配置尚未加载，返回默认域名');
            return 'http://localhost:3000';
        }
        return this.config.domain;
    }

    // 获取环境类型
    getEnvironment() {
        if (!this.loaded) {
            return 'development';
        }
        return this.config.environment;
    }

    // 是否为生产环境
    isProduction() {
        return this.getEnvironment() === 'production';
    }

    // 是否为开发环境
    isDevelopment() {
        return this.getEnvironment() === 'development';
    }
}

// 创建全局实例
window.configManager = new ConfigManager();

// 提供便捷函数
window.getApiBaseUrl = async () => {
    await window.configManager.loadConfig();
    return window.configManager.getApiBaseUrl();
};

window.getDomain = async () => {
    await window.configManager.loadConfig();
    return window.configManager.getDomain();
};

// 自动初始化配置（可选）
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await window.configManager.loadConfig();
        console.log('页面配置初始化完成');
    } catch (error) {
        console.error('页面配置初始化失败:', error);
    }
});