// scripts/search.js - (已更新)

class SearchManager {
    constructor(galleryInstance) {
        this.gallery = galleryInstance;
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.searchInput = document.querySelector('.search-input');
        this.searchBtn = document.querySelector('.search-btn');

        this.bindEvents();
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

    async executeSearch() {
        const query = this.searchInput.value.trim();

        // 如果查询为空，恢复显示所有图片
        if (!query) {
            // [修改] 恢复使用原始数据源
            this.gallery.currentSourceImages = [...this.gallery.originalImages];
            // 触发筛选器重新应用在所有图片上
            window.filterManager.applyFilters();
            return;
        }

        console.log(`正在执行高级搜索: ${query}`);
        this.gallery.showLoading(true);

        try {
            const response = await fetch(`${this.API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error(`网络请求错误: ${response.status}`);
            const searchResults = await response.json();

            // [核心修改] 将搜索结果设置为新的数据源，并触发筛选器重新应用
            this.gallery.currentSourceImages = searchResults;
            window.filterManager.applyFilters(); // 这会使用新的数据源进行筛选并更新UI

            if (searchResults.length === 0) {
                this.gallery.updateWithNewImages([]); // 清空画廊
                const container = document.getElementById('gallery-grid');
                container.innerHTML = `<p class="error-message">未能找到与 "${query}" 相关的结果。</p>`;
            }

        } catch (error) {
            console.error('搜索失败:', error);
            const container = document.getElementById('gallery-grid');
            container.innerHTML = `<p class="error-message">搜索时发生错误。</p>`;
        } finally {
            this.gallery.showLoading(false);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const checkGalleryReady = setInterval(() => {
        if (window.gallery) {
            clearInterval(checkGalleryReady);
            window.searchManager = new SearchManager(window.gallery);
            console.log('搜索管理器已初始化。');
        }
    }, 100);
});