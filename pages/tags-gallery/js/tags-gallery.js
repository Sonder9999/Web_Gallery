// scripts/tags-gallery.js - (已修复瀑布流、动画和隐藏标签的显示逻辑)

class TagsGallery {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.DISPLAY_LANGUAGE = 'zh';
        this.container = document.getElementById('tags-gallery-container');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.enableVisibilityControls = true;
        this.init();
    }

    async init() {
        this.showLoading(true);
        try {
            const response = await fetch(`${this.API_BASE_URL}/tags?visible=true`);
            if (!response.ok) throw new Error('获取标签列表失败');
            const tagsTree = await response.json();

            const allTags = this.flattenTags(tagsTree);
            const detailedTags = await this.fetchTagDetails(allTags);
            // 筛选条件不变：只要总数>0就应该处理
            const tagsWithImages = detailedTags.filter(tag => tag.imageCount > 0);

            this.shuffleArray(tagsWithImages);
            this.renderTags(tagsWithImages);

        } catch (error) {
            console.error('初始化标签画廊失败:', error);
            this.container.innerHTML = `<p class="error-message">加载失败，请稍后重试。</p>`;
        } finally {
            this.showLoading(false);
        }
    }

    async fetchTagDetails(tags) {
        // ... (此函数逻辑是正确的，保持不变) ...
        const tagPromises = tags.map(async (tag) => {
            try {
                const imagesResponse = await fetch(`${this.API_BASE_URL}/tags/${tag.id}/images`);
                if (!imagesResponse.ok) return { ...tag, imageCount: 0, coverImage: null };
                const images = await imagesResponse.json();
                const visibleImages = images.filter(img => !img.is_hidden);
                return {
                    ...tag,
                    imageCount: images.length,
                    coverImage: visibleImages.length > 0 ? visibleImages[Math.floor(Math.random() * visibleImages.length)] : null
                };
            } catch (e) {
                return { ...tag, imageCount: 0, coverImage: null };
            }
        });
        return Promise.all(tagPromises);
    }

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

    renderTags(tags) {
        // ... (此函数保持不变) ...
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
        this.container.innerHTML = '';
        this.container.appendChild(fragment);
    }

    createTagCard(tag) {
        if (tag.imageCount === 0) return null;

        const card = document.createElement('a');
        card.className = 'tag-card';
        card.href = `/pages/gallery/gallery.html?search=${encodeURIComponent(this.getTagName(tag))}`;

        const isActive = !tag.is_hidden;
        const visibilityToggleHTML = this.enableVisibilityControls ? `
            <div class="visibility-toggle-container">
                <span>画廊显示</span>
                <div class="toggle-switch ${isActive ? 'active' : ''}" data-tag-id="${tag.id}"></div>
            </div>
        ` : '';

        // [核心修复]
        // 如果有封面图，就创建 <img> 标签
        // 如果没有，就给 card 添加 'no-cover' 类，让 CSS 来处理样式
        let imageHTML = '';
        if (tag.coverImage) {
            const imagePath = tag.coverImage.filepath.replace(/\\/g, '/');
            // 使用相对路径以兼容Live Server和文件系统访问
            const relativeImagePath = `../../public/${imagePath}`;
            imageHTML = `<img src="${relativeImagePath}" class="card-image" alt="${this.getTagName(tag)}">`;
        } else {
            card.classList.add('no-cover');
        }

        card.innerHTML = `
            ${visibilityToggleHTML}
            ${imageHTML}
            <div class="card-overlay"></div>
            <div class="card-content">
                <div class="tag-name">${this.getTagName(tag)}</div>
                <div class="image-count">
                    <i class="fa-solid fa-image"></i>
                    <span>${tag.imageCount} 张图片</span>
                </div>
            </div>
        `;

        if (this.enableVisibilityControls) {
            const toggle = card.querySelector('.toggle-switch');
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleTagVisibility(tag.id, true, card);
            });
        }

        return card;
    }

    // ... (toggleTagVisibility, getTagName, showLoading, shuffleArray 等函数保持不变) ...
    async toggleTagVisibility(tagId, shouldBeHidden, cardElement) {
        const toggle = cardElement.querySelector('.toggle-switch');
        try {
            const response = await fetch(`${this.API_BASE_URL}/tags/${tagId}/visibility`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_hidden: shouldBeHidden })
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || '更新失败');
            toggle.classList.remove('active');
            cardElement.classList.add('fading-out');
            setTimeout(() => cardElement.remove(), 400); // 动画时长为 0.4s
        } catch (error) {
            console.error('更新标签可见性失败:', error);
            alert(`操作失败: ${error.message}`);
        }
    }

    getTagName(tag) {
        const preferredAlias = tag.aliases.find(a => a.lang === this.DISPLAY_LANGUAGE);
        if (preferredAlias) return preferredAlias.name;
        const zhAlias = tag.aliases.find(a => a.lang === 'zh');
        if (zhAlias) return zhAlias.name;
        return tag.primary_name_en;
    }

    getRandomHeight() { return 0; }

    showLoading(isLoading) {
        this.loadingIndicator.style.display = isLoading ? 'flex' : 'none';
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TagsGallery();
});