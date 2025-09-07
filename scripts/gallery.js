// scripts/        // 显示设置状态
// 主开关设置 - 在代码中控制是否允许用户修改设置
this.allowUserSettings = true; // 设为false可禁用用户设置面板画廊显示和设置管理

class Gallery {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api'; // 定义API基础URL
        this.originalImages = [];    // [新增] 存储从API获取的原始、完整的图片列表
        this.allImages = [];         // 存储当前用于显示和筛选的图片列表
        this.displayedImages = [];   // 存储当前已渲染到页面的图片
        this.batchSize = 20;         // 每次加载的数量
        this.currentPage = 0;        // 当前加载的页码
        this.isLoading = false;      // 防止重复加载的标志

        // [新增] 代码级功能开关：设为 true 才会显示图片详情页的“主页显示”开关
        this.enableVisibilityControls = true;

        // 显示设置状态
        this.displaySettings = {
            gallery: {
                name: false,
                path: false,
                size: true,
                ratio: false,
                tags: true
            },
            modal: {
                name: false,
                path: false,
                size: false,
                ratio: true,
                tags: true
            }
        };

        // 主开关设置 - 在代码中控制功能
        this.allowUserSettings = true; // 设为false可禁用用户设置面板
        this.showSettingsPanel = false; // 设为false可完全隐藏显示设置面板和按钮

        this.init();
    }

    async init() {
        this.initDisplaySettings();
        this.bindEvents();
        this.initSettingsPanelVisibility();
        await this.loadImagesFromAPI(); // 程序入口：从API加载数据
    }

    /**
     * 初始化设置面板可见性
     */
    initSettingsPanelVisibility() {
        const settingsBtn = document.getElementById('display-settings-btn');
        const settingsPanel = document.getElementById('display-settings-panel');

        if (!this.showSettingsPanel) {
            if (settingsBtn) settingsBtn.style.display = 'none';
            if (settingsPanel) settingsPanel.style.display = 'none';
        }
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

            this.originalImages = [...images]; // 保存一份原始数据
            this.currentSourceImages = [...this.originalImages]; // 初始数据源是所有图片

            this.updateWithNewImages(this.shuffleArray(this.currentSourceImages));

        } catch (error) {
            console.error("加载图片数据失败:", error);
            const container = document.getElementById('gallery-grid');
            container.innerHTML = `<p class="error-message">加载图片失败，请检查后端服务是否开启。</p>`;
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * [核心修改] 更新画廊内容，现在可以接收一个可选的 newSource
     */
    updateWithNewImages(newImageList, newSource = null) {
        // 如果提供了新的数据源 (来自搜索), 则更新 currentSourceImages
        if (newSource) {
            this.currentSourceImages = newSource;
        }

        document.getElementById('gallery-grid').innerHTML = '';
        this.allImages = newImageList; // allImages 是当前要显示的列表（可能已被筛选）
        this.displayedImages = [];
        this.currentPage = 0;

        this.loadNextBatch();
    }

    bindEvents() {
        document.getElementById('shuffle-btn').addEventListener('click', () => this.shuffleAndReload());
        document.getElementById('load-more-btn').addEventListener('click', () => this.loadNextBatch());
        window.addEventListener('scroll', () => this.handleScroll());
        this.bindModalEvents();
        this.bindDisplaySettings();
    }

    /**
     * 加载下一批图片进行渲染
     */
    async loadNextBatch() {
        if (this.isLoading || this.currentPage * this.batchSize >= this.allImages.length) {
            this.updateLoadMoreButton(); // 确保在没有更多图片时更新按钮状态
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
        const ratio = this.calculateAspectRatio(image.width, image.height);
        const dimensions = `${image.width} × ${image.height}`;

        // 构建信息显示HTML
        const infoHTML = `
            <div class="gallery-item-info">
                <div class="info-name" style="display: ${this.displaySettings.gallery.name ? 'block' : 'none'}">${fileName}</div>
                <div class="info-path" style="display: ${this.displaySettings.gallery.path ? 'block' : 'none'}">${folderPath}</div>
                <div class="info-dimensions-line">
                    <span class="info-size" style="display: ${this.displaySettings.gallery.size ? 'inline' : 'none'}">${dimensions}</span>
                    <span class="info-ratio" style="display: ${this.displaySettings.gallery.ratio ? 'inline' : 'none'}">${ratio}</span>
                </div>
                <div class="info-tags" style="display: ${this.displaySettings.gallery.tags ? 'flex' : 'none'}">
                    </div>
            </div>
        `;

        item.innerHTML = `
            <img src="${imagePath}" alt="${fileName}" loading="lazy">
            ${infoHTML}
        `;

        // 如果启用了标签显示，异步加载标签
        if (this.displaySettings.gallery.tags) {
            this.loadImageTags(image.id, item.querySelector('.info-tags'));
        }

        item.addEventListener('click', () => {
            this.openImageModal(imagePath, fileName, folderPath, image);
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
        if (indicator) {
            indicator.style.display = show ? 'flex' : 'none';
        }
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
        const visibilityControl = document.getElementById('visibility-control-container');
        const visibilityToggle = document.getElementById('image-visibility-toggle');

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

        // [新增] 为开关绑定点击事件
        if (this.enableVisibilityControls && visibilityToggle) {
            visibilityControl.style.display = 'block'; // 根据代码开关决定是否显示
            visibilityToggle.parentElement.addEventListener('click', (e) => {
                e.stopPropagation();
                const imageId = parseInt(visibilityToggle.dataset.imageId, 10);
                // `active` class 表示显示，所以如果它当前是 active，那么新的 is_hidden 状态应该是 true
                const newIsHiddenState = visibilityToggle.classList.contains('active');
                this.toggleImageVisibility(imageId, newIsHiddenState);
            });
        }
    }

    openImageModal(imagePath, fileName, folderPath, imageData = null) {
        const modal = document.getElementById('image-modal');
        const img = document.getElementById('modal-image');
        const visibilityToggle = document.getElementById('image-visibility-toggle');

        img.src = imagePath;
        img.alt = fileName;
        document.getElementById('modal-title').textContent = fileName;
        document.getElementById('modal-path').textContent = folderPath;

        if (this.enableVisibilityControls && imageData) {
            visibilityToggle.dataset.imageId = imageData.id;
            visibilityToggle.dataset.imagePath = imagePath; // 保存路径用于后续移除
            // 如果 imageData.is_hidden 是 1 或 true，则开关为关闭状态 (不 active)
            // 否则为开启状态 (active)
            visibilityToggle.classList.toggle('active', !imageData.is_hidden);
        }

        // ... (updateDimensions 和 img.onload 的逻辑保持不变) ...
        const updateDimensions = () => {
            let width, height;
            if (imageData && imageData.width && imageData.height) {
                width = imageData.width;
                height = imageData.height;
            } else {
                width = img.naturalWidth;
                height = img.naturalHeight;
            }

            const dimensions = `${width} × ${height}`;
            const ratio = this.calculateAspectRatio(width, height);
            document.getElementById('modal-size').textContent = dimensions;
            document.getElementById('modal-ratio').textContent = ratio;

            if (imageData && imageData.id) {
                const tagsContainer = document.querySelector('#modal-tags .tags-container');
                this.loadImageTags(imageData.id, tagsContainer);
            }
            this.updateModalDisplay();
        };

        if (imageData && imageData.width && imageData.height) {
            updateDimensions();
        } else {
            img.onload = updateDimensions;
        }

        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('show'));
    }

    /**
     * 异步加载图片标签
     */
    async loadImageTags(imageId, container) {
        try {
            console.log('正在加载图片标签，图片ID:', imageId);
            const response = await fetch(`${this.API_BASE_URL}/images/${imageId}/tags`);
            console.log('API响应状态:', response.status);

            if (!response.ok) {
                throw new Error(`标签加载失败，状态码: ${response.status}`);
            }

            const tags = await response.json();
            console.log('获取到的标签:', tags);
            container.innerHTML = '';

            if (tags.length === 0) {
                container.innerHTML = '<span class="tag no-tags">暂无标签</span>';
                return;
            }

            tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'tag';
                tagElement.textContent = tag.name;
                tagElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // 这里可以添加点击标签的搜索功能
                    console.log('搜索标签:', tag.name);
                });
                container.appendChild(tagElement);
            });
        } catch (error) {
            console.error('加载标签失败:', error);
            // 使用模拟数据作为后备
            container.innerHTML = `
                <span class="tag">示例标签1</span>
                <span class="tag">示例标签2</span>
            `;
        }
    }

    // [新增] 切换图片可见性的核心函数
    async toggleImageVisibility(imageId, shouldBeHidden) {
        const toggle = document.getElementById('image-visibility-toggle');
        try {
            const response = await fetch(`${this.API_BASE_URL}/images/${imageId}/visibility`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_hidden: shouldBeHidden }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || '更新失败');

            // 更新开关的UI状态
            toggle.classList.toggle('active', !shouldBeHidden);

            // 如果图片被设为隐藏，则立即从主画廊移除并关闭弹窗
            if (shouldBeHidden) {
                this.originalImages = this.originalImages.filter(img => img.id !== imageId);
                this.currentSourceImages = this.currentSourceImages.filter(img => img.id !== imageId);
                this.allImages = this.allImages.filter(img => img.id !== imageId);

                const itemToRemove = document.querySelector(`.gallery-item img[src="${toggle.dataset.imagePath}"]`)?.closest('.gallery-item');
                if (itemToRemove) {
                    itemToRemove.remove();
                }

                this.updateLoadedCount();
                document.querySelector('.modal-close').click(); // 关闭弹窗
            }

        } catch (error) {
            console.error('更新图片可见性失败:', error);
            alert(`操作失败: ${error.message}`);
        }
    }

    /**
     * 初始化显示设置面板
     */
    initDisplaySettings() {
        // 设置面板已经在HTML中定义好了，这里不需要额外的初始化
        // 复选框的初始状态将在bindDisplaySettings中设置
    }

    /**
     * 绑定显示设置事件
     */
    bindDisplaySettings() {
        // 显示设置按钮
        const settingsBtn = document.getElementById('display-settings-btn');
        const settingsPanel = document.getElementById('display-settings-panel');
        const closeBtn = document.getElementById('close-settings-btn');
        const resetBtn = document.getElementById('reset-settings-btn');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsPanel.classList.toggle('hidden');
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                settingsPanel.classList.add('hidden');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetDisplaySettings();
            });
        }

        // 绑定画廊显示设置
        const gallerySettings = {
            'show-card-name': 'name',
            'show-card-path': 'path',
            'show-card-size': 'size',
            'show-card-ratio': 'ratio',
            'show-card-tags': 'tags'
        };

        Object.entries(gallerySettings).forEach(([checkboxId, settingKey]) => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = this.displaySettings.gallery[settingKey];
                checkbox.addEventListener('change', () => {
                    this.displaySettings.gallery[settingKey] = checkbox.checked;
                    this.updateGalleryDisplay();
                });
            }
        });

        // 主开关控制
        const masterToggle = document.getElementById('enable-display-settings');
        const userContainer = document.getElementById('user-settings-container');

        if (masterToggle && userContainer) {
            masterToggle.checked = this.allowUserSettings;
            userContainer.classList.toggle('disabled', !this.allowUserSettings);

            masterToggle.addEventListener('change', () => {
                this.allowUserSettings = masterToggle.checked;
                userContainer.classList.toggle('disabled', !this.allowUserSettings);
            });
        }

        // 绑定模态框显示设置
        const modalSettings = {
            'show-modal-name': 'name',
            'show-modal-path': 'path',
            'show-modal-size': 'size',
            'show-modal-ratio': 'ratio',
            'show-modal-tags': 'tags'
        };

        Object.entries(modalSettings).forEach(([checkboxId, settingKey]) => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = this.displaySettings.modal[settingKey];
                checkbox.addEventListener('change', () => {
                    if (this.allowUserSettings) {
                        this.displaySettings.modal[settingKey] = checkbox.checked;
                        this.updateModalDisplay();
                    }
                });
            }
        });
    }

    /**
     * 重置显示设置到默认值
     */
    resetDisplaySettings() {
        this.displaySettings = {
            gallery: {
                name: true,
                path: true,
                ratio: true,
                tags: false
            },
            modal: {
                name: true,
                path: true,
                size: true,
                ratio: true,
                tags: false
            }
        };

        // 更新复选框状态
        document.getElementById('show-card-name').checked = true;
        document.getElementById('show-card-path').checked = true;
        document.getElementById('show-card-size').checked = true;
        document.getElementById('show-card-ratio').checked = true;
        document.getElementById('show-card-tags').checked = false;

        document.getElementById('show-modal-name').checked = true;
        document.getElementById('show-modal-path').checked = true;
        document.getElementById('show-modal-size').checked = true;
        document.getElementById('show-modal-ratio').checked = true;
        document.getElementById('show-modal-tags').checked = false;

        // 更新显示
        this.updateGalleryDisplay();
        this.updateModalDisplay();
    }

    /**
     * 更新画廊显示
     */
    updateGalleryDisplay() {
        const items = document.querySelectorAll('.gallery-item');
        items.forEach(item => {
            const info = item.querySelector('.gallery-item-info');
            if (!info) return;

            const nameEl = info.querySelector('.info-name');
            const pathEl = info.querySelector('.info-path');
            const sizeEl = info.querySelector('.info-size');
            const ratioEl = info.querySelector('.info-ratio');
            const tagsEl = info.querySelector('.info-tags');

            if (nameEl) nameEl.style.display = this.displaySettings.gallery.name ? 'block' : 'none';
            if (pathEl) pathEl.style.display = this.displaySettings.gallery.path ? 'block' : 'none';
            if (sizeEl) sizeEl.style.display = this.displaySettings.gallery.size ? 'inline' : 'none';
            if (ratioEl) ratioEl.style.display = this.displaySettings.gallery.ratio ? 'inline' : 'none';
            if (tagsEl) tagsEl.style.display = this.displaySettings.gallery.tags ? 'flex' : 'none';
        });
    }

    /**
     * 更新模态框显示
     */
    updateModalDisplay() {
        // 获取各个信息项元素
        const titleItem = document.getElementById('modal-title-item');
        const pathItem = document.getElementById('modal-path-item');
        const sizeItem = document.getElementById('modal-size-item');
        const ratioItem = document.getElementById('modal-ratio-item');
        const tagsEl = document.getElementById('modal-tags');

        // 控制各项显示/隐藏
        if (titleItem) titleItem.style.display = this.displaySettings.modal.name ? 'inline-flex' : 'none';
        if (pathItem) pathItem.style.display = this.displaySettings.modal.path ? 'inline-flex' : 'none';
        if (sizeItem) sizeItem.style.display = this.displaySettings.modal.size ? 'inline-flex' : 'none';
        if (ratioItem) ratioItem.style.display = this.displaySettings.modal.ratio ? 'inline-flex' : 'none';
        if (tagsEl) tagsEl.style.display = this.displaySettings.modal.tags ? 'block' : 'none';


    }
}

// 页面加载完成后初始化画廊
document.addEventListener('DOMContentLoaded', () => {
    const gallery = new Gallery();

    // 调试信息
    console.log('画廊已初始化');
    console.log('显示设置:', gallery.displaySettings);

    // 全局暴露gallery实例以便调试
    window.gallery = gallery;
});