// scripts/filters.js - Gallery filtering functionality

class FilterManager {
    constructor(galleryInstance) {
        this.gallery = galleryInstance;

        this.filters = {
            resolution: {
                width: null,
                height: null,
                mode: 'at-least' // 'at-least', 'exact', 'less-than'
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
            ratioButtons: document.querySelectorAll('.ratio-btn'),
            fuzzyToggle: document.getElementById('fuzzy-toggle'),
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
        // Resolution filtering
        this.dom.widthInput.addEventListener('input', () => this.handleResolutionChange());
        this.dom.heightInput.addEventListener('input', () => this.handleResolutionChange());
        this.dom.resolutionModeBtn.addEventListener('click', () => this.toggleResolutionMode());

        // Ratio filtering
        this.dom.ratioButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleRatioChange(btn));
        });
        this.dom.fuzzyToggle.addEventListener('change', () => this.handleFuzzyToggle());

        // Clear button
        this.dom.clearBtn.addEventListener('click', () => this.clearAllFilters());
    }

    handleResolutionChange() {
        const width = parseInt(this.dom.widthInput.value, 10);
        const height = parseInt(this.dom.heightInput.value, 10);

        this.filters.resolution.width = isNaN(width) || width <= 0 ? null : width;
        this.filters.resolution.height = isNaN(height) || height <= 0 ? null : height;

        this.applyFilters();
    }

    toggleResolutionMode() {
        const currentModeIndex = this.resolutionModes.indexOf(this.filters.resolution.mode);
        const nextModeIndex = (currentModeIndex + 1) % this.resolutionModes.length;
        this.filters.resolution.mode = this.resolutionModes[nextModeIndex];

        // Update icon
        const icon = this.dom.resolutionModeBtn.querySelector('i');
        icon.className = `fa-solid ${this.resolutionIcons[this.filters.resolution.mode]}`;

        // Add a little animation
        this.dom.resolutionModeBtn.classList.add('active');
        icon.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.dom.resolutionModeBtn.classList.remove('active');
            icon.style.transform = 'rotate(0deg)';
        }, 300);

        this.applyFilters();
    }

    handleRatioChange(clickedBtn) {
        // Remove active class from all buttons
        this.dom.ratioButtons.forEach(btn => btn.classList.remove('active'));

        const ratioValue = clickedBtn.dataset.ratio;

        // If the clicked button was already active, deactivate it
        if (this.filters.ratio.value === ratioValue) {
            this.filters.ratio.value = null;
        } else {
            this.filters.ratio.value = ratioValue;
            clickedBtn.classList.add('active');
        }

        this.applyFilters();
    }

    handleFuzzyToggle() {
        this.filters.ratio.isFuzzy = this.dom.fuzzyToggle.checked;
        this.applyFilters();
    }

    clearAllFilters() {
        // Reset state
        this.filters.resolution = { width: null, height: null, mode: 'at-least' };
        this.filters.ratio = { value: null, isFuzzy: false };

        // Reset UI
        this.dom.widthInput.value = '';
        this.dom.heightInput.value = '';
        const icon = this.dom.resolutionModeBtn.querySelector('i');
        icon.className = `fa-solid ${this.resolutionIcons['at-least']}`;
        this.dom.ratioButtons.forEach(btn => btn.classList.remove('active'));
        this.dom.fuzzyToggle.checked = false;

        // Re-load all images from the gallery's original set
        this.gallery.updateWithNewImages(this.gallery.originalImages);
        this.updateClearButtonVisibility();
    }


    applyFilters() {
        this.updateClearButtonVisibility();
        const allImages = [...this.gallery.originalImages]; // Always filter from the original full list

        const filteredImages = allImages.filter(image => {
            // Resolution Check
            const res = this.filters.resolution;
            if (res.width && res.height) {
                if (res.mode === 'at-least' && (image.width < res.width || image.height < res.height)) {
                    return false;
                }
                if (res.mode === 'less-than' && (image.width > res.width || image.height > res.height)) {
                    return false;
                }
                if (res.mode === 'exact' && (image.width !== res.width || image.height !== res.height)) {
                    return false;
                }
            }

            // Aspect Ratio Check
            const ratioFilter = this.filters.ratio;
            if (ratioFilter.value) {
                const targetRatio = parseFloat(ratioFilter.value);
                const imageRatio = image.width / image.height;

                if (ratioFilter.isFuzzy) {
                    const tolerance = 0.5; // e.g. 3:1 matches 2.5 to 3.5
                    if (Math.abs(imageRatio - targetRatio) > tolerance) {
                        return false;
                    }
                } else {
                    // For exact match, allow a small tolerance for floating point inaccuracies
                    const precision = 0.02;
                    if (Math.abs(imageRatio - targetRatio) > precision) {
                        return false;
                    }
                }
            }

            return true;
        });

        // Update gallery with filtered results
        this.gallery.updateWithNewImages(filteredImages);
    }

    isAnyFilterActive() {
        const res = this.filters.resolution;
        const ratio = this.filters.ratio;
        return (res.width && res.height) || ratio.value !== null;
    }

    updateClearButtonVisibility() {
        if (this.isAnyFilterActive()) {
            this.dom.clearBtn.classList.add('visible');
        } else {
            this.dom.clearBtn.classList.remove('visible');
        }
    }
}

// Initialize when the gallery is ready
document.addEventListener('DOMContentLoaded', () => {
    const checkGalleryReady = setInterval(() => {
        if (window.gallery) {
            clearInterval(checkGalleryReady);
            window.filterManager = new FilterManager(window.gallery);
            console.log('筛选管理器已初始化。');
        }
    }, 100);
});