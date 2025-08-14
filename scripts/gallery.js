// scripts/gallery.js - 瀑布流图片展示
// filepath: f:\Study\ComputerScience\OtherClass\web\Gallery\scripts\gallery.js
class Gallery {
    constructor() {
        this.images = [];
        this.displayedImages = [];
        this.batchSize = 20;
        this.currentBatch = 0;
        this.isLoading = false;

        this.init();
    }

    init() {
        this.loadImagePaths();
        this.bindEvents();
        this.loadInitialBatch();
    }

    // 模拟从服务器获取图片路径列表
    // 实际项目中这应该是一个API调用
    loadImagePaths() {
        // 根据你的.gitignore文件，模拟图片路径
        const imagePaths = [
            'images/top_logo.png',
            'images/user_avatar.png',
            'images/wallhaven-1pdpy3_4x.png',
            'images/wallhaven-exkoxo.jpg',
            'images/wallhaven-m3o5w9.png',

            // 原神 - 珊瑚宫心海
            'images/Genshin/Sangonomiya Kokomi/wallhaven-1kgjzw.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-2yg26x.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-3zxxdy.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-5grd21.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-6dpgew.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-7pg12y.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-7pg663.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-8oj63k.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-28pkyx.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-28vv9g.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-85dr7o.png',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-85o66k.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-853yo1.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-571128.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-d6gg1o.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-d66z9l.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-dp1qd3.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-ex6wy8.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-g7ozmq.png',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-j3yeww.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-j3711q.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-kx2j91.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-kxljdq.png',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-kxlx96.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-l8jp8p.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-l8jw2y.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-l81l8l.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-l86yyr.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-o36zgm.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-o55x67.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-o5685p.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-p97e9e.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-rrpdpq.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-y8rgll.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-y828ll.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-yx71wk.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-yxv957.jpg',
            'images/Genshin/Sangonomiya Kokomi/wallhaven-zyzr3v.png',

            // 崩坏三 - Elysia
            'images/Honkai Impact 3rd/Elysia/wallhaven-1pdpy3_4x.png',
            'images/Honkai Impact 3rd/Elysia/wallhaven-1pdpy3.jpg',
            'images/Honkai Impact 3rd/Elysia/wallhaven-7p1v79.jpg',
            'images/Honkai Impact 3rd/Elysia/wallhaven-7prep3.jpg',
            'images/Honkai Impact 3rd/Elysia/wallhaven-9d5d2w.jpg',
            'images/Honkai Impact 3rd/Elysia/wallhaven-9dgzrx.png',
            'images/Honkai Impact 3rd/Elysia/wallhaven-exkoxo.jpg',
            'images/Honkai Impact 3rd/Elysia/wallhaven-jx1l2y.jpg',
            'images/Honkai Impact 3rd/Elysia/wallhaven-l8wl2p.jpg',
            'images/Honkai Impact 3rd/Elysia/wallhaven-m3o5w9.png',
            'images/Honkai Impact 3rd/Elysia/wallhaven-m35e5k.jpg',
            'images/Honkai Impact 3rd/Elysia/wallhaven-p99213.jpg',
            'images/Honkai Impact 3rd/Elysia/wallhaven-zyoqzv.png',

            // 崩坏星穹铁道 - 流萤
            'images/Honkai StarRail/流萤/wallhaven-2yxj9g.jpg',
            'images/Honkai StarRail/流萤/wallhaven-3ljr76.jpg',
            'images/Honkai StarRail/流萤/wallhaven-6d3orw.jpg',
            'images/Honkai StarRail/流萤/wallhaven-6dgmvl.jpg',
            'images/Honkai StarRail/流萤/wallhaven-7p7qqv.png',
            'images/Honkai StarRail/流萤/wallhaven-7p7ry9.jpg',
            'images/Honkai StarRail/流萤/wallhaven-7pq2ey.jpg',
            'images/Honkai StarRail/流萤/wallhaven-9dl191.jpg',
            'images/Honkai StarRail/流萤/wallhaven-9dpwr1.jpg',
            'images/Honkai StarRail/流萤/wallhaven-jx7jvw.jpg',
            'images/Honkai StarRail/流萤/wallhaven-jxpqoq.jpg',
            'images/Honkai StarRail/流萤/wallhaven-jxzmjy.jpg',
            'images/Honkai StarRail/流萤/wallhaven-kxekj1.jpg',
            'images/Honkai StarRail/流萤/wallhaven-kxg5rm.jpg',
            'images/Honkai StarRail/流萤/wallhaven-kxgr1q.png',
            'images/Honkai StarRail/流萤/wallhaven-l8x6lr.jpg',
            'images/Honkai StarRail/流萤/wallhaven-m38eok.jpg',
            'images/Honkai StarRail/流萤/wallhaven-o5vm6l.png',
            'images/Honkai StarRail/流萤/wallhaven-p9ppxp.png',
            'images/Honkai StarRail/流萤/wallhaven-rr92v7.jpg',
            'images/Honkai StarRail/流萤/wallhaven-rrl8pm.jpg',
            'images/Honkai StarRail/流萤/wallhaven-vqroqm.jpg',
            'images/Honkai StarRail/流萤/wallhaven-wejr1p.jpg',
            'images/Honkai StarRail/流萤/wallhaven-x6g3xz.png',
            'images/Honkai StarRail/流萤/wallhaven-xe5ero.jpg',
            'images/Honkai StarRail/流萤/wallhaven-yq77og.jpg',
            'images/Honkai StarRail/流萤/wallhaven-yxl5vk.jpg',
            'images/Honkai StarRail/流萤/wallhaven-yxowdd.jpg',
            'images/Honkai StarRail/流萤/wallhaven-zy626y.png',
            'images/Honkai StarRail/流萤/wallhaven-zyrr2w.jpg',
            'images/Honkai StarRail/流萤/流萤雨中/HD电脑壁纸.jpg',
            'images/Honkai StarRail/流萤/流萤雨中/HD电脑带鱼屏壁纸.jpg',
            'images/Honkai StarRail/流萤/流萤雨中/MAC笔记本壁纸.jpg',
            'images/Honkai StarRail/流萤/流萤雨中/PAD平板壁纸.jpg',
            'images/Honkai StarRail/流萤/流萤雨中/PHONE手机壁纸.jpg',
            'images/Honkai StarRail/流萤/流萤雨中/PHONE折叠屏手机壁纸.jpg',
            'images/Honkai StarRail/流萤/流萤雨中/WATCH手表壁纸.jpg'
        ];

        // 随机打乱图片顺序
        this.images = this.shuffleArray([...imagePaths]);
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    bindEvents() {
        // 重新排列按钮
        document.getElementById('shuffle-btn').addEventListener('click', () => {
            this.shuffleAndReload();
        });

        // 加载更多按钮
        document.getElementById('load-more-btn').addEventListener('click', () => {
            this.loadNextBatch();
        });

        // 图片预览弹窗
        this.bindModalEvents();

        // 无限滚动（可选）
        window.addEventListener('scroll', () => this.handleScroll());
    }

    bindModalEvents() {
        const modal = document.getElementById('image-modal');
        const closeBtn = document.querySelector('.modal-close');
        const downloadBtn = document.getElementById('download-btn');

        // 关闭弹窗
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 0);
        });

        // 点击背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => modal.style.display = 'none', 300);
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                modal.classList.remove('show');
                setTimeout(() => modal.style.display = 'none', 300);
            }
        });

        // 下载按钮
        downloadBtn.addEventListener('click', () => {
            const img = document.getElementById('modal-image');
            const link = document.createElement('a');
            link.href = img.src;
            link.download = img.alt || 'image';
            link.click();
        });
    }

    loadInitialBatch() {
        this.loadNextBatch();
    }

    async loadNextBatch() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading();

        const startIndex = this.currentBatch * this.batchSize;
        const endIndex = Math.min(startIndex + this.batchSize, this.images.length);
        const batch = this.images.slice(startIndex, endIndex);

        // 模拟加载延迟
        await new Promise(resolve => setTimeout(resolve, 500));

        await this.renderImageBatch(batch);

        this.currentBatch++;
        this.updateLoadedCount();
        this.updateLoadMoreButton();

        this.isLoading = false;
        this.hideLoading();
    }

    async renderImageBatch(imagePaths) {
        const container = document.getElementById('gallery-grid');
        const fragment = document.createDocumentFragment();

        const imagePromises = imagePaths.map(path => this.createImageElement(path));
        const imageElements = await Promise.allSettled(imagePromises);

        imageElements.forEach(result => {
            if (result.status === 'fulfilled' && result.value) {
                fragment.appendChild(result.value);
                this.displayedImages.push(result.value.dataset.imagePath);
            }
        });

        container.appendChild(fragment);
    }

    async createImageElement(imagePath) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const item = this.createGalleryItem(imagePath, img);
                resolve(item);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${imagePath}`);
                resolve(null);
            };
            img.src = imagePath;
        });
    }

    createGalleryItem(imagePath, img) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.imagePath = imagePath;

        // 随机延迟动画，让图片依次出现
        const delay = Math.random() * 0.5;
        item.style.animationDelay = `${delay}s`;

        const fileName = imagePath.split('/').pop();
        const folderPath = imagePath.substring(0, imagePath.lastIndexOf('/'));

        item.innerHTML = `
            <img src="${imagePath}" alt="${fileName}" loading="lazy">
            <div class="item-info">
                <div class="item-title">${fileName}</div>
                <div class="item-path">${folderPath}</div>
                <div class="item-dimensions">
                    <span class="item-size">${img.naturalWidth} × ${img.naturalHeight}</span>
                    <span class="item-ratio">${this.calculateAspectRatio(img.naturalWidth, img.naturalHeight)}</span>
                </div>
            </div>
        `;

        // 绑定点击事件
        item.addEventListener('click', () => {
            this.openImageModal(imagePath, fileName, folderPath);
        });

        return item;
    }

    calculateAspectRatio(width, height) {
        const gcd = this.getGCD(width, height);
        const ratioW = width / gcd;
        const ratioH = height / gcd;

        if (ratioW > 10 || ratioH > 10) {
            return `${(width / height).toFixed(2)}:1`;
        }

        return `${ratioW}:${ratioH}`;
    }

    getGCD(a, b) {
        return b === 0 ? a : this.getGCD(b, a % b);
    }

    openImageModal(imagePath, fileName, folderPath) {
        const modal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const modalTitle = document.getElementById('modal-title');
        const modalPath = document.getElementById('modal-path');

        modalImage.src = imagePath;
        modalImage.alt = fileName;
        modalTitle.textContent = fileName;
        modalPath.textContent = folderPath;

        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    shuffleAndReload() {
        // 重新打乱图片顺序
        this.images = this.shuffleArray(this.images);

        // 清空现有内容
        document.getElementById('gallery-grid').innerHTML = '';
        this.displayedImages = [];
        this.currentBatch = 0;

        // 重新加载
        this.loadInitialBatch();
    }

    updateLoadedCount() {
        document.getElementById('loaded-count').textContent = this.displayedImages.length;
    }

    updateLoadMoreButton() {
        const btn = document.getElementById('load-more-btn');
        const hasMore = this.currentBatch * this.batchSize < this.images.length;

        btn.disabled = !hasMore;
        btn.innerHTML = hasMore
            ? '<i class="fa-solid fa-plus"></i> 加载更多'
            : '<i class="fa-solid fa-check"></i> 已加载全部';
    }

    showLoading() {
        document.getElementById('loading-indicator').classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading-indicator').classList.add('hidden');
    }

    // 无限滚动（可选功能）
    handleScroll() {
        if (this.isLoading) return;

        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;

        if (scrollTop + clientHeight >= scrollHeight - 1000) {
            this.loadNextBatch();
        }
    }
}

// 页面加载完成后初始化画廊
document.addEventListener('DOMContentLoaded', () => {
    new Gallery();
});