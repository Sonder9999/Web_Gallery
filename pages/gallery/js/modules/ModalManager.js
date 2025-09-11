/**
 * 模态框管理器模块
 * 负责图片预览弹窗的显示、关闭和交互
 */
import { GalleryConfig } from './GalleryConfig.js';

export class ModalManager {
    constructor(imageLoader, displayController, magnifierController) {
        this.imageLoader = imageLoader;
        this.displayController = displayController;
        this.magnifierController = magnifierController;
        this.enableVisibilityControls = GalleryConfig.CONTROL_SETTINGS.enableVisibilityControls;
        this.currentImageData = null;
    }

    /**
     * 绑定模态框事件
     */
    bindModalEvents() {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const closeBtn = document.querySelector('.modal-close');
        const downloadBtn = document.getElementById('download-btn');
        const visibilityControl = document.getElementById('visibility-control-container');
        const visibilityToggle = document.getElementById('image-visibility-toggle');

        // 模态框显示时启用放大镜
        modal.addEventListener('transitionend', (e) => {
            if (e.target === modal && modal.classList.contains('show')) {
                const modalImg = modal.querySelector('#modal-image');
                if (modalImg) {
                    // 如果图片已经加载完成，立即激活放大镜
                    if (modalImg.complete) {
                        this.magnifierController.enableForModal(modalImg);
                    } else {
                        // 如果图片还没加载完成，等待加载完成后再激活
                        modalImg.addEventListener('load', () => {
                            this.magnifierController.enableForModal(modalImg);
                        }, { once: true });
                    }
                }
            }
        });

        // 关闭模态框
        const closeModal = () => this.closeModal();

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
        });

        // 下载按钮
        downloadBtn.addEventListener('click', () => {
            const img = document.getElementById('modal-image');
            const link = document.createElement('a');
            link.href = img.src;
            link.download = img.alt || 'image';
            link.click();
        });

        // 可见性控制
        if (this.enableVisibilityControls && visibilityToggle) {
            visibilityControl.style.display = 'block';
            visibilityToggle.parentElement.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleVisibilityToggle();
            });
        }
    }

    /**
     * 打开图片模态框
     */
    async openImageModal(imagePath, fileName, folderPath, imageData = null) {
        const modal = document.getElementById('image-modal');
        const img = document.getElementById('modal-image');
        const visibilityToggle = document.getElementById('image-visibility-toggle');

        this.currentImageData = imageData;

        img.src = imagePath;
        img.alt = fileName;
        document.getElementById('modal-title').textContent = fileName;
        document.getElementById('modal-path').textContent = folderPath;

        // 设置可见性控制
        if (this.enableVisibilityControls && imageData) {
            visibilityToggle.dataset.imageId = imageData.id;
            visibilityToggle.dataset.imagePath = imagePath;
            visibilityToggle.classList.toggle('active', !imageData.is_hidden);
        }

        // 更新尺寸信息
        await this.updateDimensions(img, imageData);

        // 显示模态框
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('show'));
    }

    /**
     * 关闭模态框
     */
    closeModal() {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');

        // 禁用放大镜
        this.magnifierController.disableForModal(modalImage);

        modal.classList.remove('show');
        modal.classList.add('closing');

        setTimeout(() => {
            modal.classList.remove('closing');
            modal.style.display = 'none';
            modalImage.src = '';
            this.currentImageData = null;
        }, GalleryConfig.ANIMATION_DELAYS.modalTransition);
    }

    /**
     * 更新尺寸信息
     */
    async updateDimensions(img, imageData) {
        const updateInfo = () => {
            let width, height;
            if (imageData && imageData.width && imageData.height) {
                width = imageData.width;
                height = imageData.height;
            } else {
                width = img.naturalWidth;
                height = img.naturalHeight;
            }

            const dimensions = `${width} × ${height}`;
            const ratio = this.imageLoader.calculateAspectRatio(width, height);

            document.getElementById('modal-size').textContent = dimensions;
            document.getElementById('modal-ratio').textContent = ratio;

            // 加载标签
            if (imageData && imageData.id) {
                this.loadModalTags(imageData.id);
            }

            this.displayController.updateModalDisplay();
        };

        if (imageData && imageData.width && imageData.height) {
            updateInfo();
        } else {
            img.onload = updateInfo;
        }
    }

    /**
     * 加载模态框标签
     */
    async loadModalTags(imageId) {
        try {
            const tags = await this.imageLoader.loadImageTags(imageId);
            const tagsContainer = document.querySelector('#modal-tags .tags-container');
            await this.displayController.renderTags(tags, tagsContainer);
        } catch (error) {
            console.error('加载模态框标签失败:', error);
        }
    }

    /**
     * 处理可见性切换
     */
    async handleVisibilityToggle() {
        if (!this.currentImageData) return;

        const toggle = document.getElementById('image-visibility-toggle');
        const imageId = parseInt(toggle.dataset.imageId, 10);
        const newIsHiddenState = toggle.classList.contains('active');

        try {
            await this.imageLoader.toggleImageVisibility(imageId, newIsHiddenState);

            // 更新开关状态
            toggle.classList.toggle('active', !newIsHiddenState);

            // 如果图片被隐藏，从画廊移除并关闭弹窗
            if (newIsHiddenState) {
                this.removeImageFromGallery(imageId, toggle.dataset.imagePath);
                this.closeModal();
            }

        } catch (error) {
            console.error('更新图片可见性失败:', error);
            alert(`操作失败: ${error.message}`);
        }
    }

    /**
     * 从画廊移除图片
     */
    removeImageFromGallery(imageId, imagePath) {
        // 从数据中移除
        this.imageLoader.removeImage(imageId);

        // 从DOM中移除
        const itemToRemove = document.querySelector(`.gallery-item img[src="${imagePath}"]`)?.closest('.gallery-item');
        if (itemToRemove) {
            itemToRemove.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                itemToRemove.remove();
            }, 300);
        }

        // 触发计数更新事件
        this.dispatchCountUpdateEvent();
    }

    /**
     * 触发计数更新事件
     */
    dispatchCountUpdateEvent() {
        const event = new CustomEvent('galleryCountUpdate', {
            detail: {
                displayedCount: this.imageLoader.displayedCount,
                totalCount: this.imageLoader.totalCount
            }
        });
        document.dispatchEvent(event);
    }

    /**
     * 设置可见性控制是否启用
     */
    setVisibilityControlsEnabled(enabled) {
        this.enableVisibilityControls = enabled;
        const visibilityControl = document.getElementById('visibility-control-container');
        if (visibilityControl) {
            visibilityControl.style.display = enabled ? 'block' : 'none';
        }
    }

    // Getter
    get isOpen() {
        const modal = document.getElementById('image-modal');
        return modal && modal.classList.contains('show');
    }
}
