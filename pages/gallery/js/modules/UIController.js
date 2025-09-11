/**
 * UI控制器模块
 * 负责UI交互、事件绑定和界面更新
 */
export class UIController {
    constructor(imageLoader, displayController, modalManager) {
        this.imageLoader = imageLoader;
        this.displayController = displayController;
        this.modalManager = modalManager;
    }

    /**
     * 绑定基础事件
     */
    bindEvents() {
        this.bindControlButtons();
        this.bindScrollEvents();
        this.bindCountUpdateEvents();
    }

    /**
     * 绑定控制按钮事件
     */
    bindControlButtons() {
        const shuffleBtn = document.getElementById('shuffle-btn');
        const loadMoreBtn = document.getElementById('load-more-btn');

        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.handleShuffle());
        }

        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.handleLoadMore());
        }
    }

    /**
     * 绑定滚动事件
     */
    bindScrollEvents() {
        window.addEventListener('scroll', () => this.handleScroll());
    }

    /**
     * 绑定计数更新事件
     */
    bindCountUpdateEvents() {
        document.addEventListener('galleryCountUpdate', (e) => {
            this.updateLoadedCount();
            this.updateLoadMoreButton();
        });
    }

    /**
     * 处理打乱操作
     */
    handleShuffle() {
        this.imageLoader.shuffleCurrentImages();
        this.clearGalleryGrid();
        this.handleLoadMore();
    }

    /**
     * 处理加载更多
     */
    async handleLoadMore() {
        if (this.imageLoader.loadingState || !this.imageLoader.hasMoreImages) {
            this.updateLoadMoreButton();
            return;
        }

        this.imageLoader.loadingState = true;
        this.showLoading(true);

        const batch = this.imageLoader.getNextBatch();
        await this.renderImageBatch(batch);

        this.updateLoadedCount();
        this.updateLoadMoreButton();
        this.imageLoader.loadingState = false;
        this.showLoading(false);
    }

    /**
     * 处理滚动事件
     */
    handleScroll() {
        if (this.imageLoader.loadingState) return;
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            this.handleLoadMore();
        }
    }

    /**
     * 渲染图片批次
     */
    async renderImageBatch(imageBatch) {
        const container = document.getElementById('gallery-grid');
        const fragment = document.createDocumentFragment();

        imageBatch.forEach(imageObject => {
            const item = this.createGalleryItem(imageObject);
            fragment.appendChild(item);
        });

        container.appendChild(fragment);
        this.imageLoader.addDisplayedImages(imageBatch);
    }

    /**
     * 创建画廊项目
     */
    createGalleryItem(image) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.style.animationDelay = `${Math.random() * 0.5}s`;

        const imagePath = image.filepath;
        const relativeImagePath = `../../public/${imagePath}`;
        const fileName = image.filename;
        const folderPath = imagePath.substring(0, imagePath.lastIndexOf('/'));
        const ratio = this.imageLoader.calculateAspectRatio(image.width, image.height);
        const dimensions = `${image.width} × ${image.height}`;

        // 构建信息显示HTML
        const infoHTML = this.displayController.generateImageInfoHTML(fileName, folderPath, dimensions, ratio);

        item.innerHTML = `
            <img src="${relativeImagePath}" alt="${fileName}" loading="lazy">
            ${infoHTML}
        `;

        // 如果启用了标签显示，异步加载标签
        if (this.displayController.gallerySettings.tags) {
            this.loadImageTags(image.id, item.querySelector('.info-tags'));
        }

        // 绑定点击事件
        item.addEventListener('click', () => {
            this.modalManager.openImageModal(relativeImagePath, fileName, folderPath, image);
        });

        return item;
    }

    /**
     * 加载图片标签
     */
    async loadImageTags(imageId, container) {
        try {
            const tags = await this.imageLoader.loadImageTags(imageId);
            await this.displayController.renderTags(tags, container);
        } catch (error) {
            console.error('加载图片标签失败:', error);
        }
    }

    /**
     * 清空画廊网格
     */
    clearGalleryGrid() {
        const container = document.getElementById('gallery-grid');
        if (container) {
            container.innerHTML = '';
        }
    }

    /**
     * 更新加载计数
     */
    updateLoadedCount() {
        const countElement = document.getElementById('loaded-count');
        if (countElement) {
            countElement.textContent = this.imageLoader.displayedCount;
        }
    }

    /**
     * 更新加载更多按钮
     */
    updateLoadMoreButton() {
        const btn = document.getElementById('load-more-btn');
        if (!btn) return;

        const hasMore = this.imageLoader.hasMoreImages;
        btn.disabled = !hasMore;
        btn.innerHTML = hasMore
            ? '<i class="fa-solid fa-plus"></i> 加载更多'
            : '<i class="fa-solid fa-check"></i> 已加载全部';
    }

    /**
     * 显示/隐藏加载指示器
     */
    showLoading(show) {
        const indicator = document.getElementById('loading-indicator');
        if (indicator) {
            indicator.style.display = show ? 'flex' : 'none';
        }
    }

    /**
     * 显示错误消息
     */
    showError(message) {
        const container = document.getElementById('gallery-grid');
        if (container) {
            container.innerHTML = `<p class="error-message">${message}</p>`;
        }
    }

    /**
     * 更新画廊内容
     */
    updateGalleryContent(newImageList, newSource = null) {
        this.imageLoader.updateImageList(newImageList, newSource);
        this.clearGalleryGrid();
        this.handleLoadMore();
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            displayed: this.imageLoader.displayedCount,
            total: this.imageLoader.totalCount,
            hasMore: this.imageLoader.hasMoreImages,
            isLoading: this.imageLoader.loadingState
        };
    }

    /**
     * 重置画廊状态
     */
    resetGallery() {
        this.clearGalleryGrid();
        this.imageLoader.displayedImages = [];
        this.imageLoader.currentPage = 0;
        this.updateLoadedCount();
        this.updateLoadMoreButton();
    }
}
