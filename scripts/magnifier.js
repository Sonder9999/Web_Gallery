/**
 * 图片放大镜组件 - 带选择框和放大显示
 * 在图片上显示方形选择框，在鼠标旁边显示放大内容
 */
class ImageMagnifier {
    constructor(options = {}) {
        // 默认配置
        this.config = {
            // 选择框配置
            selectionSize: options.selectionSize || 200, // 选择框大小（方形）
            selectionBorderWidth: options.selectionBorderWidth || 2,
            selectionBorderColor: options.selectionBorderColor || '#007bff',
            selectionBorderOpacity: options.selectionBorderOpacity || 0.8,
            selectionBackgroundOpacity: options.selectionBackgroundOpacity || 0.1,

            // 放大显示配置
            zoomLevel: options.zoomLevel || 2, // 放大倍数
            displayBorderWidth: options.displayBorderWidth || 3,
            displayBorderColor: options.displayBorderColor || '#007bff',
            displayBackgroundColor: options.displayBackgroundColor || '#ffffff',
            displayShadowBlur: options.displayShadowBlur || 15,

            // 动画配置
            fadeSpeed: options.fadeSpeed || 200,

            // 位置配置
            offsetX: options.offsetX || 20, // 放大显示框与鼠标的X轴偏移
            offsetY: options.offsetY || 20, // 放大显示框与鼠标的Y轴偏移

            // 缩放限制
            minZoom: options.minZoom || 1.2,
            maxZoom: options.maxZoom || 10
        };

        // 元素引用
        this.selectionBox = null;      // 选择框元素
        this.displayBox = null;        // 放大显示框元素
        this.targetImage = null;       // 目标图片
        this.canvas = null;            // 用于绘制放大内容的画布
        this.ctx = null;               // 画布上下文

        // 状态
        this.isActive = false;
        this.imageData = null;

        this.init();
    }

    init() {
        this.createElements();
        this.bindEvents();
    }

    /**
     * 创建选择框和显示框元素
     */
    createElements() {
        // 创建选择框
        this.selectionBox = document.createElement('div');
        this.selectionBox.className = 'magnifier-selection-box';
        this.selectionBox.style.cssText = `
            position: absolute;
            width: ${this.config.selectionSize}px;
            height: ${this.config.selectionSize}px;
            border: ${this.config.selectionBorderWidth}px solid ${this.config.selectionBorderColor};
            background: rgba(255, 255, 255, ${this.config.selectionBackgroundOpacity});
            backdrop-filter: blur(1px);
            pointer-events: none;
            z-index: 1000;
            display: none;
            opacity: 0;
            transition: opacity ${this.config.fadeSpeed}ms ease;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
        `;

        // 创建放大显示框容器
        this.displayBox = document.createElement('div');
        this.displayBox.className = 'magnifier-display-box';

        // 计算放大后的显示尺寸
        const displaySize = this.config.selectionSize * this.config.zoomLevel;

        this.displayBox.style.cssText = `
            position: fixed;
            width: ${displaySize}px;
            height: ${displaySize}px;
            border: ${this.config.displayBorderWidth}px solid ${this.config.displayBorderColor};
            background: ${this.config.displayBackgroundColor};
            pointer-events: none;
            z-index: 10000;
            display: none;
            opacity: 0;
            transition: opacity ${this.config.fadeSpeed}ms ease;
            box-shadow: 0 0 ${this.config.displayShadowBlur}px rgba(0,0,0,0.3);
            overflow: hidden;
        `;

        // 创建画布用于显示放大内容
        this.canvas = document.createElement('canvas');
        this.canvas.width = displaySize;
        this.canvas.height = displaySize;
        this.canvas.style.cssText = `
            width: 100%;
            height: 100%;
            display: block;
        `;

        this.ctx = this.canvas.getContext('2d');
        this.displayBox.appendChild(this.canvas);

        // 添加到页面
        document.body.appendChild(this.selectionBox);
        document.body.appendChild(this.displayBox);
    }

    /**
     * 绑定全局事件
     */
    bindEvents() {
        document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
        document.addEventListener('mouseleave', this.handleGlobalMouseLeave.bind(this));
    }

    /**
     * 激活图片的放大镜功能
     */
    activate(imageElement) {
        if (!imageElement || imageElement.tagName !== 'IMG') {
            console.warn('ImageMagnifier: 无效的图片元素');
            return;
        }

        this.targetImage = imageElement;
        this.loadImageData();

        // 为图片容器设置相对定位（用于选择框定位）
        const imageContainer = imageElement.closest('.modal-content') || imageElement.parentElement;
        if (imageContainer) {
            const originalPosition = getComputedStyle(imageContainer).position;
            if (originalPosition === 'static') {
                imageContainer.style.position = 'relative';
            }
        }

        // 绑定图片事件
        imageElement.addEventListener('mouseenter', this.handleImageEnter.bind(this));
        imageElement.addEventListener('mouseleave', this.handleImageLeave.bind(this));
        imageElement.addEventListener('mousemove', this.handleImageMove.bind(this));

        // 添加样式类
        imageElement.classList.add('magnifier-enabled');
    }

    /**
     * 停用图片的放大镜功能
     */
    deactivate(imageElement) {
        if (imageElement) {
            imageElement.removeEventListener('mouseenter', this.handleImageEnter.bind(this));
            imageElement.removeEventListener('mouseleave', this.handleImageLeave.bind(this));
            imageElement.removeEventListener('mousemove', this.handleImageMove.bind(this));
            imageElement.classList.remove('magnifier-enabled', 'magnifier-active');
        }

        if (this.targetImage === imageElement) {
            this.hideMagnifier();
            this.targetImage = null;
            this.imageData = null;
        }
    }

    /**
     * 加载图片数据
     */
    async loadImageData() {
        if (!this.targetImage) return;

        try {
            // 创建一个新的图片对象来获取原始尺寸
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = this.targetImage.src;
            });

            this.imageData = {
                element: img,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight,
                displayedWidth: this.targetImage.offsetWidth,
                displayedHeight: this.targetImage.offsetHeight
            };

        } catch (error) {
            console.warn('ImageMagnifier: 无法加载图片数据', error);
        }
    }

    /**
     * 处理鼠标进入图片区域
     */
    handleImageEnter(event) {
        if (!this.imageData) return;
        this.isActive = true;
        this.targetImage.classList.add('magnifier-active');
        this.showMagnifier();
    }

    /**
     * 处理鼠标离开图片区域
     */
    handleImageLeave(event) {
        this.isActive = false;
        if (this.targetImage) {
            this.targetImage.classList.remove('magnifier-active');
        }
        this.hideMagnifier();
    }

    /**
     * 处理鼠标在图片上移动
     */
    handleImageMove(event) {
        if (!this.isActive || !this.imageData) return;

        const imageRect = this.targetImage.getBoundingClientRect();
        const x = event.clientX - imageRect.left;
        const y = event.clientY - imageRect.top;

        // 确保鼠标在图片范围内
        if (x >= 0 && x <= imageRect.width && y >= 0 && y <= imageRect.height) {
            this.updateMagnifier(event.clientX, event.clientY, x, y, imageRect);
        }
    }

    /**
     * 处理全局鼠标移动
     */
    handleGlobalMouseMove(event) {
        if (!this.isActive || !this.targetImage) return;

        // 检查鼠标是否仍在目标图片上
        const rect = this.targetImage.getBoundingClientRect();
        const isOverImage = event.clientX >= rect.left &&
                           event.clientX <= rect.right &&
                           event.clientY >= rect.top &&
                           event.clientY <= rect.bottom;

        if (!isOverImage) {
            this.handleImageLeave(event);
        }
    }

    /**
     * 处理全局鼠标离开页面
     */
    handleGlobalMouseLeave(event) {
        this.isActive = false;
        this.hideMagnifier();
    }

    /**
     * 更新放大镜显示
     */
    updateMagnifier(mouseX, mouseY, imageX, imageY, imageRect) {
        if (!this.imageData) return;

        // 计算选择框在图片上的位置
        this.updateSelectionBox(imageX, imageY, imageRect);

        // 计算放大显示框的位置
        const displayPosition = this.calculateDisplayPosition(mouseX, mouseY);
        this.updateDisplayBox(displayPosition.x, displayPosition.y);

        // 绘制放大内容
        this.drawMagnifiedContent(imageX, imageY, imageRect);
    }

    /**
     * 更新选择框位置
     */
    updateSelectionBox(imageX, imageY, imageRect) {
        const halfSize = this.config.selectionSize / 2;

        // 计算选择框中心位置，确保不超出图片边界
        let centerX = Math.max(halfSize, Math.min(imageX, imageRect.width - halfSize));
        let centerY = Math.max(halfSize, Math.min(imageY, imageRect.height - halfSize));

        // 计算选择框左上角位置
        const left = centerX - halfSize;
        const top = centerY - halfSize;

        // 获取图片相对于页面的位置
        const imageRect2 = this.targetImage.getBoundingClientRect();

        this.selectionBox.style.left = (imageRect2.left + left) + 'px';
        this.selectionBox.style.top = (imageRect2.top + top) + 'px';
    }

    /**
     * 计算放大显示框的最佳位置
     */
    calculateDisplayPosition(mouseX, mouseY) {
        const displaySize = this.config.selectionSize * this.config.zoomLevel + this.config.displayBorderWidth * 2;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = mouseX + this.config.offsetX;
        let y = mouseY + this.config.offsetY;

        // 右侧空间不够，放在左侧
        if (x + displaySize > viewportWidth) {
            x = mouseX - displaySize - this.config.offsetX;
        }

        // 下方空间不够，放在上方
        if (y + displaySize > viewportHeight) {
            y = mouseY - displaySize - this.config.offsetY;
        }

        // 确保不超出视口边界
        x = Math.max(10, Math.min(x, viewportWidth - displaySize - 10));
        y = Math.max(10, Math.min(y, viewportHeight - displaySize - 10));

        return { x, y };
    }

    /**
     * 更新放大显示框位置
     */
    updateDisplayBox(x, y) {
        this.displayBox.style.left = x + 'px';
        this.displayBox.style.top = y + 'px';
    }

    /**
     * 绘制放大内容
     */
    drawMagnifiedContent(imageX, imageY, imageRect) {
        if (!this.ctx || !this.imageData) return;

        const displaySize = this.config.selectionSize * this.config.zoomLevel;

        // 清空画布
        this.ctx.clearRect(0, 0, displaySize, displaySize);

        // 计算在原图中的位置和选择区域
        const scaleX = this.imageData.naturalWidth / imageRect.width;
        const scaleY = this.imageData.naturalHeight / imageRect.height;

        const halfSelectionSize = this.config.selectionSize / 2;

        // 确保选择中心不超出图片边界
        const centerX = Math.max(halfSelectionSize, Math.min(imageX, imageRect.width - halfSelectionSize));
        const centerY = Math.max(halfSelectionSize, Math.min(imageY, imageRect.height - halfSelectionSize));

        // 计算在原图中的选择区域
        const sourceX = (centerX - halfSelectionSize) * scaleX;
        const sourceY = (centerY - halfSelectionSize) * scaleY;
        const sourceWidth = this.config.selectionSize * scaleX;
        const sourceHeight = this.config.selectionSize * scaleY;

        // 确保源区域不超出原图边界
        const clampedSourceX = Math.max(0, Math.min(sourceX, this.imageData.naturalWidth - sourceWidth));
        const clampedSourceY = Math.max(0, Math.min(sourceY, this.imageData.naturalHeight - sourceHeight));
        const clampedSourceWidth = Math.min(sourceWidth, this.imageData.naturalWidth - clampedSourceX);
        const clampedSourceHeight = Math.min(sourceHeight, this.imageData.naturalHeight - clampedSourceY);

        try {
            // 绘制放大的图片内容
            this.ctx.drawImage(
                this.imageData.element,
                clampedSourceX,
                clampedSourceY,
                clampedSourceWidth,
                clampedSourceHeight,
                0,
                0,
                displaySize,
                displaySize
            );
        } catch (error) {
            console.warn('ImageMagnifier: 绘制错误', error);
        }
    }

    /**
     * 显示放大镜
     */
    showMagnifier() {
        this.selectionBox.style.display = 'block';
        this.displayBox.style.display = 'block';

        // 使用setTimeout确保display生效后再设置opacity
        setTimeout(() => {
            this.selectionBox.style.opacity = '1';
            this.displayBox.style.opacity = '1';
        }, 10);
    }

    /**
     * 隐藏放大镜
     */
    hideMagnifier() {
        this.selectionBox.style.opacity = '0';
        this.displayBox.style.opacity = '0';

        setTimeout(() => {
            if (this.selectionBox.style.opacity === '0') {
                this.selectionBox.style.display = 'none';
            }
            if (this.displayBox.style.opacity === '0') {
                this.displayBox.style.display = 'none';
            }
        }, this.config.fadeSpeed);
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };

        // 更新选择框样式
        if (this.selectionBox) {
            this.selectionBox.style.width = this.config.selectionSize + 'px';
            this.selectionBox.style.height = this.config.selectionSize + 'px';
            this.selectionBox.style.borderWidth = this.config.selectionBorderWidth + 'px';
            this.selectionBox.style.borderColor = this.config.selectionBorderColor;
        }

        // 更新显示框样式和尺寸
        if (this.displayBox) {
            const displaySize = this.config.selectionSize * this.config.zoomLevel;
            this.displayBox.style.width = displaySize + 'px';
            this.displayBox.style.height = displaySize + 'px';
            this.displayBox.style.borderWidth = this.config.displayBorderWidth + 'px';
            this.displayBox.style.borderColor = this.config.displayBorderColor;
            this.displayBox.style.backgroundColor = this.config.displayBackgroundColor;
        }

        // 更新画布尺寸
        if (this.canvas) {
            const displaySize = this.config.selectionSize * this.config.zoomLevel;
            this.canvas.width = displaySize;
            this.canvas.height = displaySize;
        }
    }

    /**
     * 销毁放大镜
     */
    destroy() {
        if (this.selectionBox) {
            document.body.removeChild(this.selectionBox);
        }
        if (this.displayBox) {
            document.body.removeChild(this.displayBox);
        }

        document.removeEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
        document.removeEventListener('mouseleave', this.handleGlobalMouseLeave.bind(this));

        this.selectionBox = null;
        this.displayBox = null;
        this.targetImage = null;
        this.canvas = null;
        this.ctx = null;
        this.imageData = null;
    }
}

// 导出类以供其他模块使用
window.ImageMagnifier = ImageMagnifier;