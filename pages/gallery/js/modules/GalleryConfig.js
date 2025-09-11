/**
 * 画廊配置模块
 * 包含所有配置常量和默认设置
 */
export class GalleryConfig {
    static API_BASE_URL = 'http://localhost:3000/api';

    static DEFAULT_BATCH_SIZE = 20;

    static DEFAULT_DISPLAY_SETTINGS = {
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
        },
        magnifier: {
            enabled: true,
            selectionSize: 230,
            zoomLevel: 2.0,
            selectionStyle: 'solid',
            displayStyle: 'square'
        }
    };

    static CONTROL_SETTINGS = {
        allowUserSettings: true,
        showSettingsPanel: true,
        enableVisibilityControls: true
    };

    static ANIMATION_DELAYS = {
        modalTransition: 300,
        fadeSpeed: 200
    };

    static MAGNIFIER_CONFIG = {
        selectionBorderWidth: 2,
        selectionBorderColor: '#007bff',
        selectionBorderOpacity: 0.8,
        selectionBackgroundOpacity: 0.1,
        displayBorderWidth: 3,
        displayBorderColor: '#007bff',
        displayBackgroundColor: '#ffffff',
        displayShadowBlur: 15,
        offsetX: 20,
        offsetY: 20,
        minZoom: 1.2,
        maxZoom: 8
    };

    /**
     * 获取深拷贝的默认显示设置
     */
    static getDefaultDisplaySettings() {
        return JSON.parse(JSON.stringify(this.DEFAULT_DISPLAY_SETTINGS));
    }

    /**
     * 获取深拷贝的控制设置
     */
    static getControlSettings() {
        return { ...this.CONTROL_SETTINGS };
    }

    /**
     * 获取深拷贝的放大镜配置
     */
    static getMagnifierConfig() {
        return { ...this.MAGNIFIER_CONFIG };
    }
}
