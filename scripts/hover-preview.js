/* scripts/hover-preview.js */
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 动态注入设置开关 ---
    // 为了不修改HTML,我们动态地将开关添加到设置面板中
    const settingsPanel = document.getElementById('display-settings-panel');
    if (settingsPanel) {
        // 找到一个参考节点,将新设置项插入其后
        const referenceSection = settingsPanel.querySelector('.settings-section:last-of-type');
        if (referenceSection) {
            const hoverPreviewSettings = document.createElement('div');
            hoverPreviewSettings.className = 'settings-section';
            hoverPreviewSettings.innerHTML = `
                <h4>悬停预览设置</h4>
                <div class="settings-options">
                    <label class="setting-item">
                        <input type="checkbox" id="enable-hover-preview" checked>
                        <span>启用悬停预览</span>
                    </label>
                </div>
            `;
            referenceSection.parentNode.insertBefore(hoverPreviewSettings, referenceSection.nextSibling);
        }
    }

    // 获取开关元素并设置初始状态
    const enableHoverPreviewSwitch = document.getElementById('enable-hover-preview');
    let isHoverPreviewEnabled = enableHoverPreviewSwitch ? enableHoverPreviewSwitch.checked : false;

    if (enableHoverPreviewSwitch) {
        enableHoverPreviewSwitch.addEventListener('change', (e) => {
            isHoverPreviewEnabled = e.target.checked;
        });
    }

    // --- 2. 创建预览元素 ---
    const previewContainer = document.createElement('div');
    previewContainer.id = 'hover-preview-container';
    const previewImage = document.createElement('img');
    previewImage.id = 'hover-preview-image';
    previewContainer.appendChild(previewImage);
    document.body.appendChild(previewContainer);

    // --- 3. 事件委托与处理 ---
    const gallery = document.getElementById('gallery-grid');
    if (!gallery) return;

    let currentItem = null; // 用于跟踪当前悬停的图片项

    // 当鼠标进入一个图片项时触发
    gallery.addEventListener('mouseover', (event) => {
        if (!isHoverPreviewEnabled) return;

        const galleryItem = event.target.closest('.gallery-item');
        if (!galleryItem) return;

        currentItem = galleryItem; // 记录当前项

        const thumbnail = galleryItem.querySelector('img');
        if (!thumbnail) return;

        // 假设原图URL、宽度和高度存储在data属性中,这是最佳实践
        // 如果gallery.js没有提供这些属性,我们会优雅地降级,使用缩略图的src
        const fullSrc = galleryItem.dataset.fullSrc || thumbnail.src;

        previewImage.src = fullSrc;
        previewImage.onload = () => {
            if (currentItem === galleryItem) { // 确保图片加载完成后鼠标仍在该项上
                positionPreview(event, galleryItem);
                previewContainer.classList.add('visible');
            }
        };
    });

    // 当鼠标在图片项上移动时更新位置
    gallery.addEventListener('mousemove', (event) => {
        if (!isHoverPreviewEnabled || !previewContainer.classList.contains('visible')) return;
        const galleryItem = event.target.closest('.gallery-item');
        if (galleryItem) {
            positionPreview(event, galleryItem);
        }
    });

    // 当鼠标离开图片项时隐藏预览
    gallery.addEventListener('mouseout', (event) => {
        const galleryItem = event.target.closest('.gallery-item');
        if (galleryItem) {
            currentItem = null; // 清除记录
            hidePreview();
        }
    });

    // --- 4. 定位与缩放逻辑 ---
    function positionPreview(event, galleryItem) {
        const itemRect = galleryItem.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 15; // 预览窗口与元素及视窗边缘的间距

        // 从data属性获取原图尺寸,若无则使用加载后的图片自然尺寸
        const originalWidth = parseInt(galleryItem.dataset.width, 10) || previewImage.naturalWidth;
        const originalHeight = parseInt(galleryItem.dataset.height, 10) || previewImage.naturalHeight;

        let previewWidth = originalWidth;
        let previewHeight = originalHeight;

        // 计算图片项左右两侧的可用空间,优先选择空间大的一侧
        const spaceRight = viewportWidth - itemRect.right - margin;
        const spaceLeft = itemRect.left - margin;
        const preferRight = spaceRight > spaceLeft;

        // 根据选择的方向确定可用的宽度和高度
        const availableWidth = Math.max(spaceRight, spaceLeft);
        const availableHeight = viewportHeight - (2 * margin);

        // 如果图片原始尺寸超出可用空间,则按比例缩放以适应
        if (previewWidth > availableWidth || previewHeight > availableHeight) {
            const widthScale = availableWidth / previewWidth;
            const heightScale = availableHeight / previewHeight;
            const scale = Math.min(widthScale, heightScale);
            previewWidth *= scale;
            previewHeight *= scale;
        }

        previewContainer.style.width = `${previewWidth}px`;
        previewContainer.style.height = `${previewHeight}px`;

        // 计算预览窗口的位置
        let top = event.clientY - previewHeight / 2;
        let left = preferRight ? itemRect.right + margin : itemRect.left - previewWidth - margin;

        // 确保预览窗口不会超出视窗垂直边界
        if (top < margin) {
            top = margin;
        }
        if (top + previewHeight > viewportHeight - margin) {
            top = viewportHeight - previewHeight - margin;
        }

        previewContainer.style.top = `${top}px`;
        previewContainer.style.left = `${left}px`;
    }

    function hidePreview() {
        previewContainer.classList.remove('visible');
    }
});