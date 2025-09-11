/**
 * 显示控制器模块
 * 负责显示设置的管理和UI更新
 */
import { GalleryConfig } from './GalleryConfig.js';

export class DisplayController {
    constructor() {
        this.displaySettings = GalleryConfig.getDefaultDisplaySettings();
        this.allowUserSettings = GalleryConfig.CONTROL_SETTINGS.allowUserSettings;
        this.showSettingsPanel = GalleryConfig.CONTROL_SETTINGS.showSettingsPanel;
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
     * 绑定显示设置事件
     */
    bindDisplaySettings() {
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
        this.bindGallerySettings();

        // 绑定模态框显示设置
        this.bindModalSettings();

        // 绑定主开关控制
        this.bindMasterToggle();
    }

    /**
     * 绑定画廊显示设置
     */
    bindGallerySettings() {
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
    }

    /**
     * 绑定模态框显示设置
     */
    bindModalSettings() {
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
                    this.displaySettings.modal[settingKey] = checkbox.checked;
                    this.updateModalDisplay();
                });
            }
        });
    }

    /**
     * 绑定主开关控制
     */
    bindMasterToggle() {
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
    }

    /**
     * 重置显示设置到默认值
     */
    resetDisplaySettings() {
        this.displaySettings = GalleryConfig.getDefaultDisplaySettings();

        // 更新复选框状态
        this.updateCheckboxStates();

        this.updateGalleryDisplay();
        this.updateModalDisplay();
    }

    /**
     * 更新复选框状态
     */
    updateCheckboxStates() {
        const checkboxMappings = {
            // 画廊设置
            'show-card-name': this.displaySettings.gallery.name,
            'show-card-path': this.displaySettings.gallery.path,
            'show-card-size': this.displaySettings.gallery.size,
            'show-card-ratio': this.displaySettings.gallery.ratio,
            'show-card-tags': this.displaySettings.gallery.tags,
            // 模态框设置
            'show-modal-name': this.displaySettings.modal.name,
            'show-modal-path': this.displaySettings.modal.path,
            'show-modal-size': this.displaySettings.modal.size,
            'show-modal-ratio': this.displaySettings.modal.ratio,
            'show-modal-tags': this.displaySettings.modal.tags
        };

        Object.entries(checkboxMappings).forEach(([id, checked]) => {
            const checkbox = document.getElementById(id);
            if (checkbox) checkbox.checked = checked;
        });
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
        const titleItem = document.getElementById('modal-title-item');
        const pathItem = document.getElementById('modal-path-item');
        const sizeItem = document.getElementById('modal-size-item');
        const ratioItem = document.getElementById('modal-ratio-item');
        const tagsEl = document.getElementById('modal-tags');

        if (titleItem) titleItem.style.display = this.displaySettings.modal.name ? 'inline-flex' : 'none';
        if (pathItem) pathItem.style.display = this.displaySettings.modal.path ? 'inline-flex' : 'none';
        if (sizeItem) sizeItem.style.display = this.displaySettings.modal.size ? 'inline-flex' : 'none';
        if (ratioItem) ratioItem.style.display = this.displaySettings.modal.ratio ? 'inline-flex' : 'none';
        if (tagsEl) tagsEl.style.display = this.displaySettings.modal.tags ? 'block' : 'none';
    }

    /**
     * 生成图片信息HTML
     */
    generateImageInfoHTML(fileName, folderPath, dimensions, ratio) {
        return `
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
    }

    /**
     * 渲染标签到容器
     */
    async renderTags(tags, container) {
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
                // 这里可以添加标签点击事件处理
                console.log('点击标签:', tag.name);
            });
            container.appendChild(tagElement);
        });
    }

    // Getters
    get settings() {
        return this.displaySettings;
    }

    get gallerySettings() {
        return this.displaySettings.gallery;
    }

    get modalSettings() {
        return this.displaySettings.modal;
    }

    get magnifierSettings() {
        return this.displaySettings.magnifier;
    }

    // Setters
    set magnifierSettings(settings) {
        this.displaySettings.magnifier = { ...this.displaySettings.magnifier, ...settings };
    }
}
