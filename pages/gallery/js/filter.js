// scripts/filters.js - (已更新)

class FilterManager {
    constructor(galleryInstance) {
        this.gallery = galleryInstance;

        this.filters = {
            resolution: {
                width: null,
                height: null,
                mode: 'at-least', // 'at-least', 'exact', 'less-than'
                isFuzzy: false,
                fuzzyValue: null
            },
            ratio: {
                value: null, // e.g., 1.777
                isFuzzy: false
            }
        };

        this.dom = {
            widthInput: document.getElementById('filter-width'),
            heightInput: document.getElementById('filter-height'),
            resolutionModeBtn: document.getElementById('resolution-mode-btn'),
            resolutionFuzzyToggle: document.getElementById('resolution-fuzzy-toggle'),
            resolutionFuzzyContainer: document.getElementById('resolution-fuzzy-container'),
            resolutionFuzzyInput: document.getElementById('resolution-fuzzy-input'),
            ratioInput: document.getElementById('ratio-input'),
            ratioFuzzyToggle: document.getElementById('ratio-fuzzy-toggle'),
            clearBtn: document.getElementById('clear-filters-btn')
        };

        this.resolutionModes = ['at-least', 'less-than', 'exact'];
        this.resolutionIcons = {
            'at-least': 'fa-greater-than-equal',
            'less-than': 'fa-less-than-equal',
            'exact': 'fa-equals'
        };

        this.bindEvents();
    }

    bindEvents() {
        // Debounce applyFilters to avoid excessive calls on input
        this.debouncedApplyFilters = this.debounce(() => this.applyFilters(), 300);

        // Resolution
        this.dom.widthInput.addEventListener('input', this.debouncedApplyFilters);
        this.dom.heightInput.addEventListener('input', this.debouncedApplyFilters);
        this.dom.resolutionModeBtn.addEventListener('click', () => {
            this.toggleResolutionMode();
            this.applyFilters();
        });
        this.dom.resolutionFuzzyToggle.addEventListener('change', () => this.handleResolutionFuzzyToggle());
        this.dom.resolutionFuzzyInput.addEventListener('input', this.debouncedApplyFilters);

        // Ratio
        this.dom.ratioInput.addEventListener('input', this.debouncedApplyFilters);
        this.dom.ratioFuzzyToggle.addEventListener('change', () => this.applyFilters());

        // Clear
        this.dom.clearBtn.addEventListener('click', () => this.clearAllFilters());
    }

    updateFilterState() {
        // Resolution
        const res = this.filters.resolution;
        res.width = this.parseInput(this.dom.widthInput.value);
        res.height = this.parseInput(this.dom.heightInput.value);
        res.isFuzzy = this.dom.resolutionFuzzyToggle.checked;
        res.fuzzyValue = res.isFuzzy ? this.parseInput(this.dom.resolutionFuzzyInput.value) : null;

        // Ratio
        const ratio = this.filters.ratio;
        const ratioText = this.dom.ratioInput.value.trim();
        if (ratioText.includes(':')) {
            const parts = ratioText.split(':').map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]) && parts[1] > 0) {
                ratio.value = parts[0] / parts[1];
            } else {
                ratio.value = null;
            }
        } else if (!isNaN(parseFloat(ratioText))) {
            ratio.value = parseFloat(ratioText);
        } else {
            ratio.value = null;
        }
        ratio.isFuzzy = this.dom.ratioFuzzyToggle.checked;
    }

    applyFilters() {
        this.updateFilterState();
        this.updateClearButtonVisibility();

        // [核心修改] 始终从当前的数据源进行筛选
        const sourceImages = [...this.gallery.currentSourceImages];

        const filteredImages = sourceImages.filter(image => {
            // Resolution Check
            if (!this.checkResolution(image)) return false;

            // Aspect Ratio Check
            if (!this.checkRatio(image)) return false;

            return true;
        });

        this.gallery.updateWithNewImages(filteredImages);
    }

    checkResolution(image) {
        const res = this.filters.resolution;
        if (!res.width && !res.height) return true; // No filter applied

        const check = (dim, target, fuzzy) => {
            if (target === null) return true; // Skip check if dimension not specified
            const tolerance = res.isFuzzy && fuzzy ? fuzzy : 0;
            const min = target - tolerance;
            const max = target + tolerance;

            if (res.mode === 'at-least') return dim >= min;
            if (res.mode === 'less-than') return dim <= max;
            if (res.mode === 'exact') return dim >= min && dim <= max;
            return true;
        };

        return check(image.width, res.width, res.fuzzyValue) && check(image.height, res.height, res.fuzzyValue);
    }

    checkRatio(image) {
        const ratioFilter = this.filters.ratio;
        if (ratioFilter.value === null) return true; // No filter

        const targetRatio = ratioFilter.value;
        const imageRatio = image.width / image.height;

        if (ratioFilter.isFuzzy) {
            const tolerance = 0.5;
            return Math.abs(imageRatio - targetRatio) <= tolerance;
        } else {
            const precision = 0.02;
            return Math.abs(imageRatio - targetRatio) <= precision;
        }
    }

    // --- UI and Helper Functions ---

    toggleResolutionMode() {
        const currentModeIndex = this.resolutionModes.indexOf(this.filters.resolution.mode);
        const nextModeIndex = (currentModeIndex + 1) % this.resolutionModes.length;
        this.filters.resolution.mode = this.resolutionModes[nextModeIndex];

        const icon = this.dom.resolutionModeBtn.querySelector('i');
        icon.className = `fa-solid ${this.resolutionIcons[this.filters.resolution.mode]}`;
        this.dom.resolutionModeBtn.title = `切换匹配模式 (${this.filters.resolution.mode})`;
    }

    handleResolutionFuzzyToggle() {
        this.dom.resolutionFuzzyContainer.classList.toggle('visible', this.dom.resolutionFuzzyToggle.checked);
        this.applyFilters();
    }

    clearAllFilters() {
        // Reset state
        this.filters = {
            resolution: { width: null, height: null, mode: 'at-least', isFuzzy: false, fuzzyValue: null },
            ratio: { value: null, isFuzzy: false }
        };
        // Reset UI
        this.dom.widthInput.value = '';
        this.dom.heightInput.value = '';
        this.dom.resolutionModeBtn.querySelector('i').className = `fa-solid ${this.resolutionIcons['at-least']}`;
        this.dom.resolutionFuzzyToggle.checked = false;
        this.dom.resolutionFuzzyContainer.classList.remove('visible');
        this.dom.resolutionFuzzyInput.value = '';
        this.dom.ratioInput.value = '';
        this.dom.ratioFuzzyToggle.checked = false;

        // [修改] 应用筛选到当前数据源，而不是重置为所有图片
        this.applyFilters();
    }

    isAnyFilterActive() {
        const res = this.filters.resolution;
        const ratio = this.filters.ratio;
        return (res.width !== null || res.height !== null) || ratio.value !== null;
    }

    updateClearButtonVisibility() {
        this.dom.clearBtn.classList.toggle('visible', this.isAnyFilterActive());
    }

    parseInput(value) {
        const num = parseInt(value, 10);
        return isNaN(num) || num <= 0 ? null : num;
    }

    debounce(func, delay) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // 监听gallery准备就绪事件
    document.addEventListener('galleryReady', (event) => {
        const gallery = event.detail;
        window.filterManager = new FilterManager(gallery);
        console.log('高级筛选管理器已初始化。');
    });

    // 备用方案：如果gallery已经存在（兼容性）
    const checkGalleryReady = setInterval(() => {
        if (window.gallery) {
            clearInterval(checkGalleryReady);
            if (!window.filterManager) {
                window.filterManager = new FilterManager(window.gallery);
                console.log('高级筛选管理器已初始化（备用方案）。');
            }
        }
    }, 100);
});