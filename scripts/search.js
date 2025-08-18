// scripts/search.js - 处理顶部导航栏的搜索功能

class SearchManager {
    constructor(galleryInstance) {
        // 接收一个 Gallery 类的实例，以便直接调用其方法
        this.gallery = galleryInstance;
        this.API_BASE_URL = 'http://localhost:3000/api';

        // 从DOM中获取搜索相关的元素
        this.searchInput = document.querySelector('.search-input');
        this.searchBtn = document.querySelector('.search-btn');
        this.searchClearBtn = document.querySelector('.nav-search-clean');

        this.bindEvents();
    }

    /**
     * 绑定所有必要的事件监听器
     */
    bindEvents() {
        // 确保元素存在再绑定事件
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

        // 清除按钮的事件已在 nav.js 中处理，这里无需重复绑定
    }

    /**
     * 执行搜索的核心函数
     */
    async executeSearch() {
        const query = this.searchInput.value.trim();

        // 如果没有输入，则重新加载所有图片，回到初始状态
        if (!query) {
            console.log('搜索框为空，重新加载所有图片...');
            this.gallery.loadImagesFromAPI(); // 调用 gallery 的方法加载全部图片
            return;
        }

        console.log(`正在搜索: ${query}`);
        this.gallery.showLoading(true); // 显示加载动画

        try {
            // 使用 encodeURIComponent 来确保特殊字符（如#、&）能被正确处理
            const response = await fetch(`${this.API_BASE_URL}/search?q=${encodeURIComponent(query)}`);

            if (!response.ok) {
                throw new Error(`网络请求错误，状态码: ${response.status}`);
            }

            const searchResults = await response.json();

            // 将搜索结果交给 gallery 实例来渲染
            this.gallery.updateWithNewImages(searchResults);

            if (searchResults.length === 0) {
                // 如果没有结果，可以给用户一个提示
                const container = document.getElementById('gallery-grid');
                container.innerHTML = `<p class="error-message">未能找到与 "${query}" 相关的结果。</p>`;
            }

        } catch (error) {
            console.error('搜索失败:', error);
            const container = document.getElementById('gallery-grid');
            container.innerHTML = `<p class="error-message">搜索时发生错误，请稍后重试。</p>`;
        } finally {
            this.gallery.showLoading(false); // 搜索结束后隐藏加载动画
        }
    }
}


// 等待DOM加载完毕，并确保 gallery 实例已创建
document.addEventListener('DOMContentLoaded', () => {
    // 检查 window.gallery 是否存在，并延迟初始化 SearchManager
    const checkGalleryReady = setInterval(() => {
        if (window.gallery) {
            clearInterval(checkGalleryReady);
            // 将 gallery 实例传递给 SearchManager
            new SearchManager(window.gallery);
            console.log('搜索管理器已初始化。');
        }
    }, 100);
});