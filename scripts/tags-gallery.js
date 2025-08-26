// scripts/tags-gallery.js

class TagsGallery {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api';

        // --- 在这里配置你希望显示的标签语言 ---
        // 可选值: 'zh', 'en', 'ja', 'pinyin', 'nickname'
        this.DISPLAY_LANGUAGE = 'zh';

        this.container = document.getElementById('tags-gallery-container');
        this.loadingIndicator = document.getElementById('loading-indicator');

        this.init();
    }

    async init() {
        this.showLoading(true);
        try {
            const allTags = await this.fetchAllTags();
            // 过滤掉没有图片的标签
            const tagsWithImages = allTags.filter(tag => tag.imageCount > 0);

            // 随机打乱标签数组，让每次加载的顺序都不同
            this.shuffleArray(tagsWithImages);

            this.renderTags(tagsWithImages);
        } catch (error) {
            console.error('初始化标签画廊失败:', error);
            this.container.innerHTML = `<p class="error-message">加载失败，请稍后重试。</p>`;
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * 获取所有标签，并为每个标签附加上图片数量和一张随机封面
     */
    async fetchAllTags() {
        // 1. 获取所有标签的树形结构
        const response = await fetch(`${this.API_BASE_URL}/tags`);
        if (!response.ok) throw new Error('获取标签列表失败');
        const tagsTree = await response.json();

        // 2. 扁平化树形结构
        const flatTags = this.flattenTags(tagsTree);

        // 3. 并行地为每个标签获取图片信息
        const tagPromises = flatTags.map(async (tag) => {
            try {
                const imagesResponse = await fetch(`${this.API_BASE_URL}/tags/${tag.id}/images`);
                if (!imagesResponse.ok) return { ...tag, imageCount: 0, coverImage: null };

                const images = await imagesResponse.json();

                return {
                    ...tag,
                    imageCount: images.length,
                    // 从图片列表中随机选择一张作为封面
                    coverImage: images.length > 0 ? images[Math.floor(Math.random() * images.length)] : null
                };
            } catch (e) {
                return { ...tag, imageCount: 0, coverImage: null };
            }
        });

        // 4. 等待所有请求完成
        return Promise.all(tagPromises);
    }

    /**
     * 将树形结构的标签数组转换为扁平数组
     */
    flattenTags(nodes) {
        let flatList = [];
        nodes.forEach(node => {
            flatList.push(node);
            if (node.children && node.children.length > 0) {
                flatList = flatList.concat(this.flattenTags(node.children));
            }
        });
        return flatList;
    }

    /**
     * 渲染所有标签卡片
     */
    renderTags(tags) {
        if (!tags || tags.length === 0) {
            this.container.innerHTML = '<p>没有找到任何带图片的标签。</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        tags.forEach(tag => {
            const card = this.createTagCard(tag);
            if (card) {
                fragment.appendChild(card);
            }
        });

        this.container.appendChild(fragment);
    }

    /**
     * 创建单个标签卡片HTML元素
     */
    createTagCard(tag) {
        // 如果标签没有封面图，则不创建卡片
        if (!tag.coverImage) {
            return null;
        }

        const card = document.createElement('a');
        card.className = 'tag-card';
        // 设置链接，点击后跳转到主页并带上标签搜索参数
        card.href = `/index.html?search=${encodeURIComponent(this.getTagName(tag))}`;

        const coverUrl = tag.coverImage.filepath.replace(/\\/g, '/');

        card.innerHTML = `
            <div class="card-background" style="background-image: url('${coverUrl}')"></div>
            <div class="card-overlay"></div>
            <div class="card-content" style="min-height: ${this.getRandomHeight()}px;">
                <div class="tag-name">${this.getTagName(tag)}</div>
                <div class="image-count">
                    <i class="fa-solid fa-image"></i>
                    <span>${tag.imageCount} 张图片</span>
                </div>
            </div>
        `;
        return card;
    }

    /**
     * 根据配置的语言获取标签名称
     */
    getTagName(tag) {
        const preferredAlias = tag.aliases.find(a => a.lang === this.DISPLAY_LANGUAGE);
        if (preferredAlias) return preferredAlias.name;

        const zhAlias = tag.aliases.find(a => a.lang === 'zh');
        if (zhAlias) return zhAlias.name;

        return tag.primary_name_en; // 作为最终备选
    }

    /**
     * 为卡片生成一个随机高度，以创造瀑布流的错落感
     */
    getRandomHeight() {
        return Math.floor(Math.random() * (280 - 180 + 1)) + 180; // 180px 到 280px 之间
    }

    /**
     * 显示/隐藏加载动画
     */
    showLoading(isLoading) {
        this.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    }

    /**
     * 随机打乱数组
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}


// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new TagsGallery();
});