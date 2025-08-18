// 搜索功能配置 - 代码开关
const SEARCH_CONFIG = {
    // 主功能开关
    enableAdvancedSearch: true,
    enableSearchHistory: true,

    // 筛选功能开关
    enableResolutionFilter: true,
    enableRatioFilter: true,
    enableSourceFilter: true,
    enableTagFilter: true,

    // 子功能开关
    enableCustomResolution: true,
    enableCustomRatio: true,
    enableFuzzyRatioMatch: true,
    enableRecommendedTags: true,

    // 界面功能开关
    enableSearchSuggestions: true,
    enableFilterToggles: true,

    // 数据限制
    maxHistoryItems: 10,
    maxSelectedTags: 20,
    maxRecommendedTags: 15
};

class AdvancedSearch {
    constructor() {
        this.isInitialized = false;
        this.searchHistory = this.loadSearchHistory();
        this.selectedTags = [];
        this.tagLogicMode = 'AND'; // AND 或 OR
        this.currentFilters = this.getDefaultFilters();

        if (SEARCH_CONFIG.enableAdvancedSearch) {
            this.init();
        }
    }

    init() {
        this.createSearchModal();
        this.bindEvents();
        this.loadRecommendedTags();
        this.isInitialized = true;
    }

    createSearchModal() {
        const modalHTML = `
            <div id="search-overlay" class="search-overlay">
                <div class="search-modal">
                    <div class="search-header">
                        <h2 class="search-title">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            高级搜索
                        </h2>
                        <button class="search-close" id="search-close-btn">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                        <input type="text" class="search-main-input" id="search-main-input"
                               placeholder="搜索图片...">
                    </div>

                    <div class="search-content">
                        ${this.renderSearchHistory()}
                        ${this.renderFilters()}
                    </div>

                    <div class="search-actions">
                        <button class="search-action-btn secondary" id="search-reset-btn">
                            <i class="fa-solid fa-rotate-left"></i>
                            重置
                        </button>
                        <button class="search-action-btn primary" id="search-submit-btn">
                            <i class="fa-solid fa-magnifying-glass"></i>
                            搜索
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    renderSearchHistory() {
        if (!SEARCH_CONFIG.enableSearchHistory || this.searchHistory.length === 0) {
            return '';
        }

        return `
            <div class="search-history">
                <div class="search-section-title">
                    搜索历史
                    <button class="clear-history-btn" id="clear-history-btn">清空历史</button>
                </div>
                <div class="history-tags">
                    ${this.searchHistory.map(item => `
                        <span class="history-tag" data-query="${item.query}">
                            ${this.escapeHtml(item.query)}
                        </span>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderFilters() {
        return `
            <div class="search-filters">
                ${this.renderResolutionFilter()}
                ${this.renderRatioFilter()}
                ${this.renderSourceFilter()}
                ${this.renderTagFilter()}
            </div>
        `;
    }

    renderResolutionFilter() {
        if (!SEARCH_CONFIG.enableResolutionFilter) return '';

        const presets = [
            { label: 'FHD (1080p)', value: '1920x1080' },
            { label: '2K', value: '2560x1440' },
            { label: '4K', value: '3840x2160' }
        ];

        return `
            <div class="filter-section">
                <div class="filter-header">
                    <h3 class="filter-title">分辨率筛选</h3>
                    ${SEARCH_CONFIG.enableFilterToggles ? `
                        <label class="filter-toggle">
                            <input type="checkbox" class="filter-checkbox" data-filter="resolution" checked>
                            <span class="filter-slider"></span>
                        </label>
                    ` : ''}
                </div>
                <div class="filter-options active" id="resolution-options">
                    <div class="preset-options">
                        ${presets.map(preset => `
                            <button class="preset-option resolution-preset" data-value="${preset.value}">
                                ${preset.label}
                            </button>
                        `).join('')}
                    </div>
                    ${this.renderCustomResolutionInput()}
                </div>
            </div>
        `;
    }

    renderCustomResolutionInput() {
        if (!SEARCH_CONFIG.enableCustomResolution) return '';

        return `
            <div class="custom-input-group">
                <label class="custom-input-label">自定义分辨率</label>
                <div class="input-row">
                    <input type="number" class="custom-input" id="custom-width" placeholder="宽度">
                    <span class="input-separator">×</span>
                    <input type="number" class="custom-input" id="custom-height" placeholder="高度">
                    <select class="custom-input" id="resolution-mode">
                        <option value="exact">精确</option>
                        <option value="minimum">至少</option>
                    </select>
                </div>
            </div>
        `;
    }

    renderRatioFilter() {
        if (!SEARCH_CONFIG.enableRatioFilter) return '';

        const presets = [
            { label: '16:9 (横屏)', value: '16:9' },
            { label: '21:9 (宽屏)', value: '21:9' },
            { label: '9:16 (竖屏)', value: '9:16' },
            { label: '1:1 (方形)', value: '1:1' }
        ];

        return `
            <div class="filter-section">
                <div class="filter-header">
                    <h3 class="filter-title">比例筛选</h3>
                    ${SEARCH_CONFIG.enableFilterToggles ? `
                        <label class="filter-toggle">
                            <input type="checkbox" class="filter-checkbox" data-filter="ratio" checked>
                            <span class="filter-slider"></span>
                        </label>
                    ` : ''}
                </div>
                <div class="filter-options active" id="ratio-options">
                    <div class="preset-options">
                        ${presets.map(preset => `
                            <button class="preset-option ratio-preset" data-value="${preset.value}">
                                ${preset.label}
                            </button>
                        `).join('')}
                    </div>
                    ${this.renderCustomRatioInput()}
                    ${this.renderFuzzyMatchToggle()}
                </div>
            </div>
        `;
    }

    renderCustomRatioInput() {
        if (!SEARCH_CONFIG.enableCustomRatio) return '';

        return `
            <div class="custom-input-group">
                <label class="custom-input-label">自定义比例范围</label>
                <div class="input-row">
                    <input type="number" class="custom-input" id="ratio-min" placeholder="最小比例" step="0.1">
                    <span class="input-separator">到</span>
                    <input type="number" class="custom-input" id="ratio-max" placeholder="最大比例" step="0.1">
                </div>
                <div class="slider-container">
                    <input type="range" class="slider-input" id="ratio-slider"
                           min="0.1" max="5" step="0.1" value="1.78">
                    <div class="slider-values">
                        <span>0.1:1</span>
                        <span id="current-ratio">1.8:1</span>
                        <span>5:1</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderFuzzyMatchToggle() {
        if (!SEARCH_CONFIG.enableFuzzyRatioMatch) return '';

        return `
            <div class="custom-input-group">
                <label class="custom-input-label">
                    <input type="checkbox" id="fuzzy-ratio-match"> 模糊匹配
                    <small style="color: #666; display: block; margin-top: 4px;">
                        开启后将匹配相近比例（±0.4范围内）
                    </small>
                </label>
            </div>
        `;
    }

    renderSourceFilter() {
        if (!SEARCH_CONFIG.enableSourceFilter) return '';

        return `
            <div class="filter-section">
                <div class="filter-header">
                    <h3 class="filter-title">来源筛选</h3>
                    ${SEARCH_CONFIG.enableFilterToggles ? `
                        <label class="filter-toggle">
                            <input type="checkbox" class="filter-checkbox" data-filter="source" checked>
                            <span class="filter-slider"></span>
                        </label>
                    ` : ''}
                </div>
                <div class="filter-options active" id="source-options">
                    <div class="custom-input-group">
                        <label class="custom-input-label">来源网址</label>
                        <input type="text" class="custom-input" id="source-url"
                               placeholder="输入来源网址或关键词">
                    </div>
                </div>
            </div>
        `;
    }

    renderTagFilter() {
        if (!SEARCH_CONFIG.enableTagFilter) return '';

        return `
            <div class="filter-section">
                <div class="filter-header">
                    <h3 class="filter-title">标签筛选</h3>
                    ${SEARCH_CONFIG.enableFilterToggles ? `
                        <label class="filter-toggle">
                            <input type="checkbox" class="filter-checkbox" data-filter="tags" checked>
                            <span class="filter-slider"></span>
                        </label>
                    ` : ''}
                </div>
                <div class="filter-options active" id="tag-options">
                    <div class="tag-input-container">
                        <input type="text" class="tag-input" id="tag-search-input"
                               placeholder="输入标签名称，按回车添加">
                    </div>
                    <div class="selected-tags" id="selected-tags-container">
                        <!-- 选中的标签将显示在这里 -->
                    </div>
                    <div class="logic-toggle">
                        <button class="logic-option active" data-logic="AND">同时包含 (AND)</button>
                        <button class="logic-option" data-logic="OR">包含任意 (OR)</button>
                    </div>
                    ${this.renderRecommendedTags()}
                </div>
            </div>
        `;
    }

    renderRecommendedTags() {
        if (!SEARCH_CONFIG.enableRecommendedTags) return '';

        return `
            <div class="custom-input-group">
                <label class="custom-input-label">推荐标签</label>
                <div class="recommended-tags" id="recommended-tags-container">
                    <!-- 推荐标签将通过JS加载 -->
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 搜索框点击事件
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('focus', () => this.showSearchModal());
        }

        // 模态框事件
        const overlay = document.getElementById('search-overlay');
        const closeBtn = document.getElementById('search-close-btn');
        const resetBtn = document.getElementById('search-reset-btn');
        const submitBtn = document.getElementById('search-submit-btn');

        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideSearchModal();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideSearchModal());
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.performSearch());
        }

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalVisible()) {
                this.hideSearchModal();
            }
        });

        // 筛选器切换事件
        if (SEARCH_CONFIG.enableFilterToggles) {
            document.addEventListener('change', (e) => {
                if (e.target.classList.contains('filter-checkbox')) {
                    this.toggleFilter(e.target.dataset.filter, e.target.checked);
                }
            });
        }

        // 预设选项点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('preset-option')) {
                this.selectPresetOption(e.target);
            }
        });

        // 历史记录点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('history-tag')) {
                this.selectHistoryItem(e.target.dataset.query);
            }
        });

        // 清空历史
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearSearchHistory());
        }

        // 标签输入
        this.bindTagEvents();

        // 比例滑块
        this.bindRatioSlider();

        // 逻辑切换
        this.bindLogicToggle();
    }

    bindTagEvents() {
        const tagInput = document.getElementById('tag-search-input');
        if (tagInput) {
            tagInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.addTag(tagInput.value.trim());
                    tagInput.value = '';
                    this.hideSuggestions();
                }
            });

            // 标签输入自动完成
            if (SEARCH_CONFIG.enableSearchSuggestions) {
                tagInput.addEventListener('input', (e) => {
                    this.handleTagInput(e.target.value);
                });

                tagInput.addEventListener('blur', () => {
                    // 延迟隐藏，允许点击建议项
                    setTimeout(() => this.hideSuggestions(), 200);
                });
            }
        }

        // 推荐标签点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('recommended-tag')) {
                this.addTag(e.target.textContent);
            }
        });

        // 标签删除
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-remove')) {
                const tagText = e.target.parentElement.textContent.replace('×', '').trim();
                this.removeTag(tagText);
            }
        });

        // 建议项点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tag-suggestion')) {
                const tagInput = document.getElementById('tag-search-input');
                this.addTag(e.target.textContent);
                if (tagInput) {
                    tagInput.value = '';
                }
                this.hideSuggestions();
            }
        });
    }

    async handleTagInput(value) {
        if (!value || value.length < 1) {
            this.hideSuggestions();
            return;
        }

        try {
            const response = await fetch(`/api/tags/suggest?q=${encodeURIComponent(value)}`);
            const suggestions = await response.json();

            if (suggestions.length > 0) {
                this.showSuggestions(suggestions);
            } else {
                this.hideSuggestions();
            }
        } catch (error) {
            console.warn('获取标签建议失败:', error);
            this.hideSuggestions();
        }
    }

    showSuggestions(suggestions) {
        const tagInput = document.getElementById('tag-search-input');
        if (!tagInput) return;

        // 移除现有建议
        this.hideSuggestions();

        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'tag-suggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid var(--search-border-color);
            border-top: none;
            border-radius: 0 0 8px 8px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;

        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'tag-suggestion';
            item.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background-color 0.2s ease;
                font-size: 14px;
            `;
            item.textContent = suggestion.suggestion;

            item.addEventListener('mouseenter', () => {
                item.style.backgroundColor = 'var(--search-tag-bg)';
            });

            item.addEventListener('mouseleave', () => {
                item.style.backgroundColor = 'white';
            });

            suggestionsContainer.appendChild(item);
        });

        tagInput.parentElement.style.position = 'relative';
        tagInput.parentElement.appendChild(suggestionsContainer);
    }

    hideSuggestions() {
        const suggestions = document.querySelector('.tag-suggestions');
        if (suggestions) {
            suggestions.remove();
        }
    }

    bindRatioSlider() {
        const ratioSlider = document.getElementById('ratio-slider');
        const currentRatioSpan = document.getElementById('current-ratio');

        if (ratioSlider && currentRatioSpan) {
            ratioSlider.addEventListener('input', (e) => {
                const ratio = parseFloat(e.target.value);
                currentRatioSpan.textContent = `${ratio.toFixed(1)}:1`;
            });
        }
    }

    bindLogicToggle() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('logic-option')) {
                const logicOptions = document.querySelectorAll('.logic-option');
                logicOptions.forEach(option => option.classList.remove('active'));
                e.target.classList.add('active');
                this.tagLogicMode = e.target.dataset.logic;
            }
        });
    }

    showSearchModal() {
        const overlay = document.getElementById('search-overlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // 聚焦到主搜索输入框
            const mainInput = document.getElementById('search-main-input');
            if (mainInput) {
                setTimeout(() => mainInput.focus(), 300);
            }
        }
    }

    hideSearchModal() {
        const overlay = document.getElementById('search-overlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    isModalVisible() {
        const overlay = document.getElementById('search-overlay');
        return overlay && overlay.classList.contains('active');
    }

    toggleFilter(filterName, enabled) {
        const optionsContainer = document.getElementById(`${filterName}-options`);
        if (optionsContainer) {
            if (enabled) {
                optionsContainer.classList.add('active');
            } else {
                optionsContainer.classList.remove('active');
            }
        }
    }

    selectPresetOption(button) {
        // 移除同类型其他选项的选中状态
        const container = button.parentElement;
        container.querySelectorAll('.preset-option').forEach(option => {
            option.classList.remove('selected');
        });

        // 选中当前选项
        button.classList.add('selected');

        // 根据类型处理数据
        if (button.classList.contains('resolution-preset')) {
            this.currentFilters.resolution = button.dataset.value;
        } else if (button.classList.contains('ratio-preset')) {
            this.currentFilters.ratio = button.dataset.value;
        }
    }

    addTag(tagText) {
        if (!tagText || this.selectedTags.includes(tagText)) return;

        if (this.selectedTags.length >= SEARCH_CONFIG.maxSelectedTags) {
            alert(`最多只能选择 ${SEARCH_CONFIG.maxSelectedTags} 个标签`);
            return;
        }

        this.selectedTags.push(tagText);
        this.updateSelectedTagsDisplay();
    }

    removeTag(tagText) {
        const index = this.selectedTags.indexOf(tagText);
        if (index > -1) {
            this.selectedTags.splice(index, 1);
            this.updateSelectedTagsDisplay();
        }
    }

    updateSelectedTagsDisplay() {
        const container = document.getElementById('selected-tags-container');
        if (!container) return;

        container.innerHTML = this.selectedTags.map(tag => `
            <span class="selected-tag">
                ${this.escapeHtml(tag)}
                <button class="tag-remove">×</button>
            </span>
        `).join('');
    }

    selectHistoryItem(query) {
        const mainInput = document.getElementById('search-main-input');
        if (mainInput) {
            mainInput.value = query;
        }
    }

    clearSearchHistory() {
        this.searchHistory = [];
        this.saveSearchHistory();

        const historyContainer = document.querySelector('.search-history');
        if (historyContainer) {
            historyContainer.style.display = 'none';
        }
    }

    resetFilters() {
        // 重置所有筛选器
        this.currentFilters = this.getDefaultFilters();
        this.selectedTags = [];
        this.tagLogicMode = 'AND';

        // 重置UI状态
        document.querySelectorAll('.preset-option').forEach(option => {
            option.classList.remove('selected');
        });

        document.querySelectorAll('.custom-input').forEach(input => {
            input.value = '';
        });

        const mainInput = document.getElementById('search-main-input');
        if (mainInput) {
            mainInput.value = '';
        }

        this.updateSelectedTagsDisplay();

        // 重置逻辑切换
        document.querySelectorAll('.logic-option').forEach(option => {
            option.classList.remove('active');
        });
        document.querySelector('.logic-option[data-logic="AND"]')?.classList.add('active');
    }

    async performSearch() {
        const query = document.getElementById('search-main-input')?.value.trim() || '';

        // 构建搜索参数
        const searchParams = {
            query: query,
            filters: this.collectCurrentFilters(),
            tags: this.selectedTags,
            tagLogic: this.tagLogicMode
        };

        // 保存搜索历史
        if (query && SEARCH_CONFIG.enableSearchHistory) {
            this.addToSearchHistory(query);
        }

        // 执行搜索
        try {
            const results = await this.executeSearch(searchParams);
            this.displaySearchResults(results);
            this.hideSearchModal();
        } catch (error) {
            console.error('搜索失败:', error);
            alert('搜索失败，请重试');
        }
    }

    collectCurrentFilters() {
        const filters = {};

        // 分辨率筛选
        if (SEARCH_CONFIG.enableResolutionFilter) {
            const customWidth = document.getElementById('custom-width')?.value;
            const customHeight = document.getElementById('custom-height')?.value;
            const resolutionMode = document.getElementById('resolution-mode')?.value;

            if (customWidth && customHeight) {
                filters.resolution = {
                    width: parseInt(customWidth),
                    height: parseInt(customHeight),
                    mode: resolutionMode || 'exact'
                };
            } else if (this.currentFilters.resolution) {
                const [width, height] = this.currentFilters.resolution.split('x');
                filters.resolution = {
                    width: parseInt(width),
                    height: parseInt(height),
                    mode: 'exact'
                };
            }
        }

        // 比例筛选
        if (SEARCH_CONFIG.enableRatioFilter) {
            const ratioMin = document.getElementById('ratio-min')?.value;
            const ratioMax = document.getElementById('ratio-max')?.value;
            const fuzzyMatch = document.getElementById('fuzzy-ratio-match')?.checked;

            if (ratioMin || ratioMax) {
                filters.ratio = {
                    min: ratioMin ? parseFloat(ratioMin) : null,
                    max: ratioMax ? parseFloat(ratioMax) : null,
                    fuzzy: fuzzyMatch
                };
            } else if (this.currentFilters.ratio) {
                const [width, height] = this.currentFilters.ratio.split(':');
                const ratio = parseFloat(width) / parseFloat(height);
                filters.ratio = {
                    target: ratio,
                    fuzzy: fuzzyMatch
                };
            }
        }

        // 来源筛选
        if (SEARCH_CONFIG.enableSourceFilter) {
            const sourceUrl = document.getElementById('source-url')?.value.trim();
            if (sourceUrl) {
                filters.source = sourceUrl;
            }
        }

        return filters;
    }

    async executeSearch(searchParams) {
        // 这里实现实际的搜索逻辑
        // 调用后端API或前端筛选
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(searchParams)
        });

        if (!response.ok) {
            throw new Error('搜索请求失败');
        }

        return await response.json();
    }

    displaySearchResults(results) {
        // 显示搜索结果
        console.log('搜索结果:', results);

        // 如果存在 gallery 实例，直接更新图片数据
        if (window.gallery && typeof window.gallery.updateImages === 'function') {
            window.gallery.updateImages(results.data || results);
        } else {
            // 触发自定义事件，让主应用处理结果显示
            const event = new CustomEvent('searchResults', {
                detail: results
            });
            document.dispatchEvent(event);
        }

        // 更新搜索状态显示
        this.updateSearchStatus(results);
    }

    updateSearchStatus(results) {
        const loadedCount = document.getElementById('loaded-count');
        if (loadedCount) {
            const count = results.data ? results.data.length : results.length;
            loadedCount.textContent = count;
        }

        // 可以添加搜索结果提示
        const existingNotice = document.querySelector('.search-result-notice');
        if (existingNotice) {
            existingNotice.remove();
        }

        if (results.data && results.data.length > 0) {
            const notice = document.createElement('div');
            notice.className = 'search-result-notice';
            notice.style.cssText = `
                background: #e3f2fd;
                color: #1565c0;
                padding: 12px 20px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #2196f3;
                font-size: 14px;
            `;
            notice.innerHTML = `
                <i class="fa-solid fa-magnifying-glass"></i>
                搜索结果：找到 ${results.data.length} 张图片
                <button style="float: right; background: none; border: none; color: #1565c0; cursor: pointer;" onclick="this.parentElement.remove(); window.advancedSearch.clearSearchResults();">
                    <i class="fa-solid fa-xmark"></i> 清除筛选
                </button>
            `;

            const galleryControls = document.getElementById('gallery-controls');
            if (galleryControls) {
                galleryControls.insertAdjacentElement('afterend', notice);
            }
        }
    }

    clearSearchResults() {
        // 清除搜索结果，重新加载原始数据
        if (window.gallery && typeof window.gallery.loadImages === 'function') {
            window.gallery.loadImages();
        }

        const notice = document.querySelector('.search-result-notice');
        if (notice) {
            notice.remove();
        }
    }

    async loadRecommendedTags() {
        if (!SEARCH_CONFIG.enableRecommendedTags) return;

        try {
            const response = await fetch('/api/tags/popular');
            const tags = await response.json();

            const container = document.getElementById('recommended-tags-container');
            if (container && tags.length > 0) {
                container.innerHTML = tags
                    .slice(0, SEARCH_CONFIG.maxRecommendedTags)
                    .map(tag => `
                        <span class="recommended-tag">${this.escapeHtml(tag.name)}</span>
                    `).join('');
            }
        } catch (error) {
            console.warn('加载推荐标签失败:', error);
        }
    }

    addToSearchHistory(query) {
        // 避免重复
        this.searchHistory = this.searchHistory.filter(item => item.query !== query);

        // 添加到开头
        this.searchHistory.unshift({
            query: query,
            timestamp: Date.now()
        });

        // 限制数量
        if (this.searchHistory.length > SEARCH_CONFIG.maxHistoryItems) {
            this.searchHistory = this.searchHistory.slice(0, SEARCH_CONFIG.maxHistoryItems);
        }

        this.saveSearchHistory();
    }

    loadSearchHistory() {
        try {
            const history = localStorage.getItem('gallery_search_history');
            return history ? JSON.parse(history) : [];
        } catch (error) {
            console.warn('加载搜索历史失败:', error);
            return [];
        }
    }

    saveSearchHistory() {
        try {
            localStorage.setItem('gallery_search_history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('保存搜索历史失败:', error);
        }
    }

    getDefaultFilters() {
        return {
            resolution: null,
            ratio: null,
            source: null,
            tags: []
        };
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化搜索功能
document.addEventListener('DOMContentLoaded', () => {
    if (SEARCH_CONFIG.enableAdvancedSearch) {
        window.advancedSearch = new AdvancedSearch();
    }
});

// 导出配置供外部使用
window.SEARCH_CONFIG = SEARCH_CONFIG;
