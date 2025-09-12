// scripts/search.js - (已更新，增加页面加载时自动搜索功能)

class SearchManager {
    constructor(galleryInstance) {
        this.gallery = galleryInstance;
        this.API_BASE_URL = null; // 将通过配置动态设置
        this.searchInput = document.querySelector('.search-input');
        this.searchBtn = document.querySelector('.search-btn');

        this.init();
    }

    async init() {
        // 加载配置
        await this.loadConfig();
        this.bindEvents();
        // [新增] 初始化时检查URL参数
        this.checkURLForSearchQuery();
    }

    async loadConfig() {
        try {
            this.API_BASE_URL = await getApiBaseUrl();
        } catch (error) {
            console.error('加载API配置失败，使用默认值:', error);
            this.API_BASE_URL = 'http://localhost:3000/api';
        }
    }

    bindEvents() {
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.executeSearch());
        }
        if (this.searchInput) {
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.executeSearch();
                }
            });
        }
    }

    /**
     * [新增] 检查页面URL中是否包含 'search' 参数，如果包含则自动执行搜索。
     */
    checkURLForSearchQuery() {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');

        if (searchQuery) {
            console.log(`从URL检测到搜索词: "${searchQuery}"`);
            // 将搜索词填入输入框
            this.searchInput.value = decodeURIComponent(searchQuery);
            // 自动执行搜索
            this.executeSearch();
        }
    }

    async executeSearch() {
        const query = this.searchInput.value.trim();

        if (!query) {
            // 重置到原始图片列表
            const originalImages = this.gallery.originalImages;
            this.gallery.imageLoader.currentSourceImages = [...originalImages];

            // 如果清空了搜索框，也需要让筛选器在所有图片上重新应用
            if (window.filterManager) {
                window.filterManager.applyFilters();
            } else {
                this.gallery.updateWithNewImages(originalImages);
            }
            return;
        }

        // [新增] 更新URL，但不重新加载页面，方便用户分享和刷新
        const newUrl = `${window.location.pathname}?search=${encodeURIComponent(query)}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        console.log(`正在执行高级搜索: ${query}`);
        this.gallery.uiController.showLoading(true);

        try {
            const response = await fetch(`${this.API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`网络请求错误: ${response.status}`);
            const searchResults = await response.json();

            // 更新数据源
            this.gallery.imageLoader.currentSourceImages = searchResults;

            // 让筛选器在新的搜索结果上应用筛选
            if (window.filterManager) {
                window.filterManager.applyFilters();
            } else {
                this.gallery.updateWithNewImages(searchResults);
            }

            if (searchResults.length === 0) {
                this.gallery.updateWithNewImages([]);
                const container = document.getElementById('gallery-grid');
                container.innerHTML = `<p class="error-message">未能找到与 "${query}" 相关的结果。</p>`;
            }

        } catch (error) {
            console.error('搜索失败:', error);
            const container = document.getElementById('gallery-grid');
            container.innerHTML = `<p class="error-message">搜索时发生错误。</p>`;
        } finally {
            this.gallery.uiController.showLoading(false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 监听gallery准备就绪事件
    document.addEventListener('galleryReady', (event) => {
        const gallery = event.detail;
        window.searchManager = new SearchManager(gallery);
        console.log('搜索管理器已初始化。');
    });

    // 备用方案：如果gallery已经存在（兼容性）
    const checkGalleryReady = setInterval(() => {
        if (window.gallery) {
            clearInterval(checkGalleryReady);
            if (!window.searchManager) {
                window.searchManager = new SearchManager(window.gallery);
                console.log('搜索管理器已初始化（备用方案）。');
            }
        }
    }, 100);
});