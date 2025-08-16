// scripts/gallery.js - (重写) 通过API从数据库获取图片数据并展示

class Gallery {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api'; // 定义API基础URL
        this.allImages = [];         // 存储从API获取的所有图片对象
        this.displayedImages = [];   // 存储当前已渲染到页面的图片
        this.batchSize = 20;         // 每次加载的数量
        this.currentPage = 0;        // 当前加载的页码
        this.isLoading = false;      // 防止重复加载的标志
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadImagesFromAPI(); // 程序入口：从API加载数据
    }

    /**
     * [核心修改] 从后端API获取所有图片数据
     */
    async loadImagesFromAPI() {
        this.showLoading(true);
        try {
            const response = await fetch(`${this.API_BASE_URL}/images`);
            if (!response.ok) throw new Error('网络请求失败');
            const images = await response.json();

            // 将获取到的图片数据随机打乱
            this.allImages = this.shuffleArray(images);

            // 加载第一批图片
            this.loadNextBatch();

        } catch (error) {
            console.error("加载图片数据失败:", error);
            const container = document.getElementById('gallery-grid');
            container.innerHTML = `<p class="error-message">加载图片失败，请检查后端服务是否开启。</p>`;
        } finally {
            this.showLoading(false);
        }
    }

    bindEvents() {
        document.getElementById('shuffle-btn').addEventListener('click', () => this.shuffleAndReload());
        document.getElementById('load-more-btn').addEventListener('click', () => this.loadNextBatch());
        window.addEventListener('scroll', () => this.handleScroll());
        this.bindModalEvents();
    }

    /**
     * 加载下一批图片进行渲染
     */
    async loadNextBatch() {
        if (this.isLoading || this.currentPage * this.batchSize >= this.allImages.length) {
            return; // 如果正在加载或所有图片已加载完毕，则不执行
        }

        this.isLoading = true;
        this.showLoading(true);

        const startIndex = this.currentPage * this.batchSize;
        const endIndex = startIndex + this.batchSize;
        const batch = this.allImages.slice(startIndex, endIndex);

        await this.renderImageBatch(batch);

        this.currentPage++;
        this.updateLoadedCount();
        this.updateLoadMoreButton();
        this.isLoading = false;
        this.showLoading(false);
    }

    /**
     * 将一批图片数据渲染成HTML元素并添加到页面
     */
    async renderImageBatch(imageBatch) {
        const container = document.getElementById('gallery-grid');
        const fragment = document.createDocumentFragment();

        imageBatch.forEach(imageObject => {
            const item = this.createGalleryItem(imageObject);
            fragment.appendChild(item);
            this.displayedImages.push(imageObject);
        });

        container.appendChild(fragment);
    }

    /**
     * [核心修改] 根据单个图片对象创建HTML元素
     * @param {object} image - 包含id, filepath, filename, width, height的对象
     */
    createGalleryItem(image) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        // 使用随机延迟让图片加载动画显得更自然
        item.style.animationDelay = `${Math.random() * 0.5}s`;

        // 从图片对象中直接获取信息
        const imagePath = image.filepath; // 例如: 'images/elysia_12345.jpg'
        const fileName = image.filename;
        const folderPath = imagePath.substring(0, imagePath.lastIndexOf('/'));

        item.innerHTML = `
            <img src="${imagePath}" alt="${fileName}" loading="lazy">
            <div class="item-info">
                <div class="item-title">${fileName}</div>
                <div class.item-path">${folderPath}</div>
                <div class="item-dimensions">
                    <span class="item-size">${image.width} × ${image.height}</span>
                    <span class="item-ratio">${this.calculateAspectRatio(image.width, image.height)}</span>
                </div>
            </div>
        `;

        item.addEventListener('click', () => {
            this.openImageModal(imagePath, fileName, folderPath);
        });

        return item;
    }

    shuffleAndReload() {
        // 重新打乱已获取的图片数组
        this.allImages = this.shuffleArray(this.allImages);
        // 清空现有内容
        document.getElementById('gallery-grid').innerHTML = '';
        this.displayedImages = [];
        this.currentPage = 0;
        // 重新加载
        this.loadNextBatch();
    }

    // --- 其他辅助函数 (大部分保持不变) ---

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    handleScroll() {
        if (this.isLoading) return;
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            this.loadNextBatch();
        }
    }

    updateLoadedCount() {
        document.getElementById('loaded-count').textContent = this.displayedImages.length;
    }

    updateLoadMoreButton() {
        const btn = document.getElementById('load-more-btn');
        const hasMore = this.currentPage * this.batchSize < this.allImages.length;
        btn.disabled = !hasMore;
        btn.innerHTML = hasMore
            ? '<i class="fa-solid fa-plus"></i> 加载更多'
            : '<i class="fa-solid fa-check"></i> 已加载全部';
    }

    showLoading(show) {
        const indicator = document.getElementById('loading-indicator');
        indicator.style.display = show ? 'flex' : 'none';
    }

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

    bindModalEvents() {
        const modal = document.getElementById('image-modal');
        const closeBtn = document.querySelector('.modal-close');
        const downloadBtn = document.getElementById('download-btn');
        const closeModal = () => {
            modal.classList.add('closing');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('closing', 'show');
            }, 300);
        };
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('show')) closeModal(); });
        downloadBtn.addEventListener('click', () => {
            const img = document.getElementById('modal-image');
            const link = document.createElement('a');
            link.href = img.src;
            link.download = img.alt || 'image';
            link.click();
        });
    }

    openImageModal(imagePath, fileName, folderPath) {
        const modal = document.getElementById('image-modal');
        document.getElementById('modal-image').src = imagePath;
        document.getElementById('modal-image').alt = fileName;
        document.getElementById('modal-title').textContent = fileName;
        document.getElementById('modal-path').textContent = folderPath;
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('show'));
    }
}

// 页面加载完成后初始化画廊
document.addEventListener('DOMContentLoaded', () => {
    new Gallery();
});