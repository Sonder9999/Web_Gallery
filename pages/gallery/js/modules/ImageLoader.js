/**
 * 图片加载器模块
 * 负责图片数据的加载、管理和API交互
 */
import { GalleryConfig } from './GalleryConfig.js';

export class ImageLoader {
    constructor() {
        this.API_BASE_URL = GalleryConfig.API_BASE_URL;
        this.originalImages = [];
        this.currentSourceImages = [];
        this.allImages = [];
        this.displayedImages = [];
        this.batchSize = GalleryConfig.DEFAULT_BATCH_SIZE;
        this.currentPage = 0;
        this.isLoading = false;
    }

    /**
     * 从后端API获取所有图片数据
     */
    async loadImagesFromAPI() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/images`);
            if (!response.ok) throw new Error('网络请求失败');
            const images = await response.json();

            this.originalImages = [...images];
            this.currentSourceImages = [...this.originalImages];

            return this.shuffleArray(this.currentSourceImages);
        } catch (error) {
            console.error("加载图片数据失败:", error);
            throw error;
        }
    }

    /**
     * 更新图片列表
     */
    updateImageList(newImageList, newSource = null) {
        if (newSource) {
            this.currentSourceImages = newSource;
        }

        this.allImages = newImageList;
        this.displayedImages = [];
        this.currentPage = 0;
    }

    /**
     * 获取下一批图片
     */
    getNextBatch() {
        if (this.currentPage * this.batchSize >= this.allImages.length) {
            return [];
        }

        const startIndex = this.currentPage * this.batchSize;
        const endIndex = startIndex + this.batchSize;
        const batch = this.allImages.slice(startIndex, endIndex);

        this.currentPage++;
        return batch;
    }

    /**
     * 添加已显示的图片
     */
    addDisplayedImages(images) {
        this.displayedImages.push(...images);
    }

    /**
     * 从所有列表中移除图片
     */
    removeImage(imageId) {
        this.originalImages = this.originalImages.filter(img => img.id !== imageId);
        this.currentSourceImages = this.currentSourceImages.filter(img => img.id !== imageId);
        this.allImages = this.allImages.filter(img => img.id !== imageId);
    }

    /**
     * 打乱数组
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 重新打乱当前图片列表
     */
    shuffleCurrentImages() {
        this.allImages = this.shuffleArray(this.allImages);
        this.displayedImages = [];
        this.currentPage = 0;
    }

    /**
     * 异步加载图片标签
     */
    async loadImageTags(imageId) {
        try {
            console.log('正在加载图片标签，图片ID:', imageId);
            const response = await fetch(`${this.API_BASE_URL}/images/${imageId}/tags`);
            console.log('API响应状态:', response.status);

            if (!response.ok) {
                throw new Error(`标签加载失败，状态码: ${response.status}`);
            }

            const tags = await response.json();
            console.log('获取到的标签:', tags);
            return tags;
        } catch (error) {
            console.error('加载标签失败:', error);
            // 返回模拟数据作为后备
            return [
                { name: '示例标签1' },
                { name: '示例标签2' }
            ];
        }
    }

    /**
     * 切换图片可见性
     */
    async toggleImageVisibility(imageId, shouldBeHidden) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/images/${imageId}/visibility`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_hidden: shouldBeHidden }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || '更新失败');

            return result;
        } catch (error) {
            console.error('更新图片可见性失败:', error);
            throw error;
        }
    }

    /**
     * 计算宽高比
     */
    calculateAspectRatio(width, height) {
        if (height === 0) return 'N/A';
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const commonDivisor = gcd(width, height);
        const ratioW = width / commonDivisor;
        const ratioH = height / commonDivisor;
        if (ratioW > 32 || ratioH > 32) {
            return `${(width / height).toFixed(2)}:1`;
        }
        return `${ratioW}:${ratioH}`;
    }

    // Getters
    get hasMoreImages() {
        return this.currentPage * this.batchSize < this.allImages.length;
    }

    get displayedCount() {
        return this.displayedImages.length;
    }

    get totalCount() {
        return this.allImages.length;
    }

    get loadingState() {
        return this.isLoading;
    }

    set loadingState(value) {
        this.isLoading = value;
    }
}
