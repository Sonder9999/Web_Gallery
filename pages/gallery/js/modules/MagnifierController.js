/**
 * 放大镜控制器模块
 * 负责放大镜功能的初始化、配置和控制
 */
import { GalleryConfig } from './GalleryConfig.js';

export class MagnifierController {
    constructor(displayController) {
        this.displayController = displayController;
        this.magnifier = null;
        this.config = GalleryConfig.getMagnifierConfig();
    }

    /**
     * 初始化放大镜
     */
    initMagnifier() {
        const settings = this.displayController.magnifierSettings;
        console.log('初始化放大镜，设置:', settings); // 调试日志

        if (settings.enabled) {
            console.log('创建放大镜实例'); // 调试日志
            this.magnifier = new ImageMagnifier({
                selectionSize: settings.selectionSize,
                selectionBorderWidth: this.config.selectionBorderWidth,
                selectionBorderColor: this.config.selectionBorderColor,
                selectionBorderOpacity: this.config.selectionBorderOpacity,
                selectionBackgroundOpacity: this.config.selectionBackgroundOpacity,
                zoomLevel: settings.zoomLevel,
                displayBorderWidth: this.config.displayBorderWidth,
                displayBorderColor: this.config.displayBorderColor,
                displayBackgroundColor: this.config.displayBackgroundColor,
                displayShadowBlur: this.config.displayShadowBlur,
                fadeSpeed: GalleryConfig.ANIMATION_DELAYS.fadeSpeed,
                offsetX: this.config.offsetX,
                offsetY: this.config.offsetY,
                minZoom: this.config.minZoom,
                maxZoom: this.config.maxZoom
            });
            console.log('放大镜实例创建完成:', this.magnifier); // 调试日志
        } else {
            console.log('放大镜功能已禁用'); // 调试日志
        }
    }

    /**
     * 切换放大镜功能
     */
    toggleMagnifier(enabled) {
        const settings = this.displayController.magnifierSettings;
        settings.enabled = enabled;
        this.displayController.magnifierSettings = settings;

        if (enabled) {
            if (!this.magnifier) {
                this.initMagnifier();
            }
        } else {
            if (this.magnifier) {
                this.magnifier.destroy();
                this.magnifier = null;
            }
            this.clearMagnifierStyles();
        }
    }

    /**
     * 清理放大镜样式
     */
    clearMagnifierStyles() {
        document.querySelectorAll('.magnifier-enabled, .magnifier-active').forEach(img => {
            img.classList.remove('magnifier-enabled', 'magnifier-active');
        });
    }

    /**
     * 更新放大镜配置
     */
    updateMagnifierConfig() {
        if (this.magnifier) {
            const settings = this.displayController.magnifierSettings;

            this.magnifier.updateConfig({
                selectionSize: settings.selectionSize,
                zoomLevel: settings.zoomLevel
            });

            this.updateMagnifierStyles();
        }
    }

    /**
     * 更新放大镜样式
     */
    updateMagnifierStyles() {
        const settings = this.displayController.magnifierSettings;
        const selectionBox = document.querySelector('.magnifier-selection-box');
        const displayBox = document.querySelector('.magnifier-display-box');

        if (selectionBox) {
            selectionBox.className = `magnifier-selection-box ${settings.selectionStyle}`;
        }
        if (displayBox) {
            displayBox.className = `magnifier-display-box ${settings.displayStyle}`;
        }
    }

    /**
     * 绑定放大镜设置
     */
    bindMagnifierSettings() {
        const magnifierSettings = {
            'enable-magnifier': (checked) => {
                this.toggleMagnifier(checked);
            },
            'selection-size': (value) => {
                const settings = this.displayController.magnifierSettings;
                settings.selectionSize = parseInt(value);
                this.displayController.magnifierSettings = settings;
                this.updateMagnifierConfig();

                const valueDisplay = document.querySelector('#selection-size + .range-value');
                if (valueDisplay) valueDisplay.textContent = value + 'px';
            },
            'zoom-level': (value) => {
                const settings = this.displayController.magnifierSettings;
                settings.zoomLevel = parseFloat(value);
                this.displayController.magnifierSettings = settings;
                this.updateMagnifierConfig();

                const valueDisplay = document.querySelector('#zoom-level + .range-value');
                if (valueDisplay) valueDisplay.textContent = value + 'x';
            },
            'selection-style': (value) => {
                const settings = this.displayController.magnifierSettings;
                settings.selectionStyle = value;
                this.displayController.magnifierSettings = settings;
                this.updateMagnifierConfig();
            },
            'display-style': (value) => {
                const settings = this.displayController.magnifierSettings;
                settings.displayStyle = value;
                this.displayController.magnifierSettings = settings;
                this.updateMagnifierConfig();
            }
        };

        Object.entries(magnifierSettings).forEach(([elementId, handler]) => {
            const element = document.getElementById(elementId);
            if (element) {
                // 设置初始值
                if (element.type === 'checkbox') {
                    element.checked = this.displayController.magnifierSettings.enabled;
                } else if (element.type === 'range') {
                    const settingKey = elementId.replace('-', '');
                    if (settingKey === 'selectionsize') {
                        element.value = this.displayController.magnifierSettings.selectionSize;
                    } else if (settingKey === 'zoomlevel') {
                        element.value = this.displayController.magnifierSettings.zoomLevel;
                    }
                } else if (element.tagName === 'SELECT') {
                    if (elementId.includes('selection-style')) {
                        element.value = this.displayController.magnifierSettings.selectionStyle;
                    } else if (elementId.includes('display-style')) {
                        element.value = this.displayController.magnifierSettings.displayStyle;
                    }
                }

                // 绑定事件
                const eventType = element.type === 'range' ? 'input' : 'change';
                element.addEventListener(eventType, (e) => {
                    const value = element.type === 'checkbox' ? e.target.checked : e.target.value;
                    handler(value);
                });
            }
        });
    }

    /**
     * 为模态框图片启用放大镜
     */
    enableForModal(modalImg) {
        if (!modalImg) return;

        if (this.magnifier && this.displayController.magnifierSettings.enabled && modalImg.complete) {
            console.log('启用模态框放大镜'); // 调试日志
            modalImg.classList.add('magnifier-enabled');
            this.magnifier.activate(modalImg);
        } else {
            console.log('放大镜未启用或图片未加载完成'); // 调试日志
            modalImg.classList.remove('magnifier-enabled', 'magnifier-active');
        }
    }

    /**
     * 为模态框图片禁用放大镜
     */
    disableForModal(modalImg) {
        if (modalImg) {
            modalImg.classList.remove('magnifier-enabled', 'magnifier-active');
            if (this.magnifier) {
                this.magnifier.deactivate(modalImg);
            }
        }
    }    /**
     * 重置放大镜到默认设置
     */
    resetToDefaults() {
        const defaultSettings = GalleryConfig.getDefaultDisplaySettings().magnifier;
        this.displayController.magnifierSettings = defaultSettings;

        // 更新UI控件
        const enableCheckbox = document.getElementById('enable-magnifier');
        const selectionSizeSlider = document.getElementById('selection-size');
        const zoomLevelSlider = document.getElementById('zoom-level');
        const selectionStyleSelect = document.getElementById('selection-style');
        const displayStyleSelect = document.getElementById('display-style');

        if (enableCheckbox) {
            enableCheckbox.checked = defaultSettings.enabled;
            this.toggleMagnifier(defaultSettings.enabled);
        }

        if (selectionSizeSlider) {
            selectionSizeSlider.value = defaultSettings.selectionSize;
            const valueDisplay = document.querySelector('#selection-size + .range-value');
            if (valueDisplay) valueDisplay.textContent = defaultSettings.selectionSize + 'px';
        }

        if (zoomLevelSlider) {
            zoomLevelSlider.value = defaultSettings.zoomLevel;
            const valueDisplay = document.querySelector('#zoom-level + .range-value');
            if (valueDisplay) valueDisplay.textContent = defaultSettings.zoomLevel + 'x';
        }

        if (selectionStyleSelect) selectionStyleSelect.value = defaultSettings.selectionStyle;
        if (displayStyleSelect) displayStyleSelect.value = defaultSettings.displayStyle;

        this.updateMagnifierConfig();
    }

    // Getter
    get isEnabled() {
        return this.displayController.magnifierSettings.enabled && this.magnifier !== null;
    }
}
