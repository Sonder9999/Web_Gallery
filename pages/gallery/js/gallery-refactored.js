/**
 * 主画廊类 (重构版本)
 * 协调各个模块，提供统一的接口
 */
import { GalleryConfig } from './modules/GalleryConfig.js';
import { ImageLoader } from './modules/ImageLoader.js';
import { DisplayController } from './modules/DisplayController.js';
import { MagnifierController } from './modules/MagnifierController.js';
import { ModalManager } from './modules/ModalManager.js';
import { UIController } from './modules/UIController.js';

class Gallery {
    constructor() {
        this.initializeModules();
        this.init();
    }

    /**
     * 初始化所有模块
     */
    initializeModules() {
        this.imageLoader = new ImageLoader();
        this.displayController = new DisplayController();
        this.magnifierController = new MagnifierController(this.displayController);
        this.modalManager = new ModalManager(this.imageLoader, this.displayController, this.magnifierController);
        this.uiController = new UIController(this.imageLoader, this.displayController, this.modalManager);
    }

    /**
     * 初始化画廊
     */
    async init() {
        try {
            // 初始化各个模块
            this.displayController.initSettingsPanelVisibility();
            this.magnifierController.initMagnifier();

            // 绑定事件
            this.bindEvents();

            // 加载图片数据
            await this.loadImages();

            console.log('画廊初始化完成');
        } catch (error) {
            console.error('画廊初始化失败:', error);
            this.uiController.showError('加载图片失败，请检查后端服务是否开启。');
        }
    }

    /**
     * 绑定所有事件
     */
    bindEvents() {
        this.uiController.bindEvents();
        this.modalManager.bindModalEvents();
        this.displayController.bindDisplaySettings();
        this.magnifierController.bindMagnifierSettings();
    }

    /**
     * 加载图片数据
     */
    async loadImages() {
        this.uiController.showLoading(true);

        try {
            const images = await this.imageLoader.loadImagesFromAPI();
            this.uiController.updateGalleryContent(images);
        } finally {
            this.uiController.showLoading(false);
        }
    }

    /**
     * 重新加载图片 (用于搜索等功能)
     */
    async reloadImages(searchResults = null, newSource = null) {
        this.uiController.showLoading(true);

        try {
            if (searchResults) {
                this.uiController.updateGalleryContent(searchResults, newSource);
            } else {
                const images = await this.imageLoader.loadImagesFromAPI();
                this.uiController.updateGalleryContent(images);
            }
        } finally {
            this.uiController.showLoading(false);
        }
    }

    /**
     * 搜索图片 (供外部调用)
     */
    async searchImages(query) {
        // 这里可以实现搜索逻辑
        // 暂时返回所有图片的过滤结果
        const allImages = this.imageLoader.originalImages;
        const filteredImages = allImages.filter(img =>
            img.filename.toLowerCase().includes(query.toLowerCase()) ||
            img.filepath.toLowerCase().includes(query.toLowerCase())
        );

        await this.reloadImages(filteredImages, allImages);
        return filteredImages;
    }

    /**
     * 获取画廊统计信息
     */
    getStats() {
        return this.uiController.getStats();
    }

    /**
     * 重置画廊到初始状态
     */
    async reset() {
        this.uiController.resetGallery();
        await this.loadImages();
    }

    /**
     * 获取当前显示设置
     */
    getDisplaySettings() {
        return this.displayController.settings;
    }

    /**
     * 更新显示设置
     */
    updateDisplaySettings(newSettings) {
        Object.assign(this.displayController.displaySettings, newSettings);
        this.displayController.updateGalleryDisplay();
        this.displayController.updateModalDisplay();
    }

    /**
     * 切换放大镜功能
     */
    toggleMagnifier(enabled) {
        this.magnifierController.toggleMagnifier(enabled);
    }

    /**
     * 打开图片模态框
     */
    openImageModal(imagePath, fileName, folderPath, imageData) {
        this.modalManager.openImageModal(imagePath, fileName, folderPath, imageData);
    }

    /**
     * 关闭图片模态框
     */
    closeImageModal() {
        this.modalManager.closeModal();
    }

    /**
     * 设置可见性控制是否启用
     */
    setVisibilityControlsEnabled(enabled) {
        this.modalManager.setVisibilityControlsEnabled(enabled);
    }

    // Getters (供外部访问)
    get currentImages() {
        return this.imageLoader.allImages;
    }

    get displayedImages() {
        return this.imageLoader.displayedImages;
    }

    get isLoading() {
        return this.imageLoader.loadingState;
    }

    get hasMoreImages() {
        return this.imageLoader.hasMoreImages;
    }

    // 暴露模块供调试使用
    get modules() {
        return {
            imageLoader: this.imageLoader,
            displayController: this.displayController,
            magnifierController: this.magnifierController,
            modalManager: this.modalManager,
            uiController: this.uiController
        };
    }
}

// 页面加载完成后初始化画廊
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new Gallery();

    // 调试信息
    console.log('画廊已初始化');
    console.log('显示设置:', gallery.getDisplaySettings());

    // 全局暴露gallery实例以便调试
    window.gallery = gallery;
});

export default Gallery;
