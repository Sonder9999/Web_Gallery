// scripts/upload.js - 上传页面交互功能

class ImageUploader {
    constructor() {
        this.selectedFiles = [];
        this.currentSelectedImage = null;
        this.recommendedTags = [
            '原神', '珊瑚宫心海', '崩坏三', 'Elysia', '崩坏星穹铁道', '流萤',
            '动漫', '游戏', '角色', '风景', '插画', '4K', '高清'
        ];

        this.init();
    }

    init() {
        this.bindEvents();
        this.renderRecommendedTags();
        this.updateStats();
    }

    bindEvents() {
        // ... (这部分代码保持不变) ...
        const fileInput = document.getElementById('file-input');
        const selectFilesBtn = document.getElementById('select-files-btn');
        const dropZone = document.getElementById('file-drop-zone');

        selectFilesBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        dropZone.addEventListener('drop', (e) => this.handleDrop(e));

        const batchTagInput = document.getElementById('batch-tag-input');
        const addBatchTagBtn = document.getElementById('add-batch-tag-btn');
        const applyBatchTagsBtn = document.getElementById('apply-batch-tags-btn');

        addBatchTagBtn.addEventListener('click', () => this.addBatchTag());
        batchTagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addBatchTag();
        });
        applyBatchTagsBtn.addEventListener('click', () => this.applyBatchTags());

        const individualTagInput = document.getElementById('individual-tag-input');
        const addIndividualTagBtn = document.getElementById('add-individual-tag-btn');

        addIndividualTagBtn.addEventListener('click', () => this.addIndividualTag());
        individualTagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addIndividualTag();
        });

        document.getElementById('clear-all-btn').addEventListener('click', () => this.clearAll());
        document.getElementById('upload-all-btn').addEventListener('click', () => this.uploadAll());
        document.getElementById('cancel-upload-btn').addEventListener('click', () => this.cancelUpload());
    }


    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        this.addFiles(files);
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('dragover');
    }

    handleDragLeave(event) {
        event.currentTarget.classList.remove('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');

        const files = Array.from(event.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length > 0) {
            this.addFiles(files);
        }
    }

    addFiles(files) {
        files.forEach(file => {
/*             if (file.size > 10 * 1024 * 1024) { // 10MB 限制
                alert(`文件 ${file.name} 超过 10MB 限制`);
                return;
            } */

            const fileData = {
                id: Date.now() + Math.random(),
                file: file,
                name: file.name,
                size: file.size,
                tags: [],
                source: '',
                preview: null
            };

            // 生成预览图
            const reader = new FileReader();
            reader.onload = (e) => {
                fileData.preview = e.target.result;
                this.selectedFiles.push(fileData);
                this.renderImageItem(fileData);
                this.updateStats();
            };
            reader.readAsDataURL(file);
        });
    }

    renderImageItem(fileData) {
        const imagesGrid = document.getElementById('images-grid');
        const item = document.createElement('div');
        item.className = 'upload-image-item';
        item.dataset.fileId = fileData.id;

        item.innerHTML = `
            <img src="${fileData.preview}" alt="${fileData.name}">
            <div class="image-item-info">
                <div class="image-item-name">${fileData.name}</div>
                <div class="image-item-tags">
                    ${fileData.tags.map(tag => `
                        <span class="tag-item">
                            ${tag}
                            <button class="tag-remove" onclick="uploadManager.removeImageTag('${fileData.id}', '${tag}')">
                                <i class="fa-solid fa-times"></i>
                            </button>
                        </span>
                    `).join('')}
                </div>
                <input type="text" class="source-input" placeholder="来源网站（可选）"
                       value="${fileData.source}"
                       onchange="uploadManager.updateImageSource('${fileData.id}', this.value)">
                <div class="image-item-actions">
                    <button class="remove-image-btn" onclick="uploadManager.removeImage('${fileData.id}')">
                        <i class="fa-solid fa-trash"></i> 删除
                    </button>
                </div>
            </div>
        `;

        // 添加点击选择功能
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.remove-image-btn') && !e.target.closest('.source-input')) {
                this.selectImage(fileData.id);
            }
        });

        imagesGrid.appendChild(item);
    }

    selectImage(fileId) {
        // 移除之前的选中状态
        document.querySelectorAll('.upload-image-item.selected').forEach(item => {
            item.classList.remove('selected');
        });

        // 选中当前图片
        const item = document.querySelector(`[data-file-id="${fileId}"]`);
        item.classList.add('selected');

        // 更新当前选中的图片
        this.currentSelectedImage = this.selectedFiles.find(f => f.id == fileId);
        this.updateIndividualTagsUI();
    }

    updateIndividualTagsUI() {
        const imageInfo = document.getElementById('selected-image-info');
        const tagInput = document.getElementById('individual-tag-input');
        const addBtn = document.getElementById('add-individual-tag-btn');
        const tagsContainer = document.getElementById('individual-tags');

        if (this.currentSelectedImage) {
            imageInfo.innerHTML = `
                <strong>${this.currentSelectedImage.name}</strong><br>
                <small>${(this.currentSelectedImage.size / 1024 / 1024).toFixed(2)} MB</small>
            `;
            tagInput.disabled = false;
            addBtn.disabled = false;

            // 渲染当前图片的标签
            tagsContainer.innerHTML = this.currentSelectedImage.tags.map(tag => `
                <span class="tag-item">
                    ${tag}
                    <button class="tag-remove" onclick="uploadManager.removeImageTag('${this.currentSelectedImage.id}', '${tag}')">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </span>
            `).join('');
        } else {
            imageInfo.innerHTML = '<p>请选择左侧图片进行标签编辑</p>';
            tagInput.disabled = true;
            addBtn.disabled = true;
            tagsContainer.innerHTML = '';
        }
    }

    addBatchTag() {
        const input = document.getElementById('batch-tag-input');
        const tag = input.value.trim();

        if (tag) {
            this.addToBatchTags(tag);
            input.value = '';
        }
    }

    addToBatchTags(tag) {
        const container = document.getElementById('batch-tags');
        const existingTags = Array.from(container.children).map(el => el.textContent.trim());

        if (!existingTags.includes(tag)) {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag-item';
            tagElement.innerHTML = `
                ${tag}
                <button class="tag-remove" onclick="this.parentElement.remove()">
                    <i class="fa-solid fa-times"></i>
                </button>
            `;
            container.appendChild(tagElement);
        }

        // 如果当前有选中的图片，同时将该标签添加到当前图片（避免重复）
        if (this.currentSelectedImage) {
            if (!this.currentSelectedImage.tags.includes(tag)) {
                this.currentSelectedImage.tags.push(tag);
                this.refreshImageItem(this.currentSelectedImage.id);
                this.updateIndividualTagsUI();
            }
        }
    }

    addIndividualTag() {
        const input = document.getElementById('individual-tag-input');
        const tag = input.value.trim();

        if (tag && this.currentSelectedImage) {
            if (!this.currentSelectedImage.tags.includes(tag)) {
                this.currentSelectedImage.tags.push(tag);
                this.updateIndividualTagsUI();
                this.refreshImageItem(this.currentSelectedImage.id);
            }
            input.value = '';
        }
    }

    removeImageTag(fileId, tag) {
        const fileData = this.selectedFiles.find(f => f.id == fileId);
        if (fileData) {
            fileData.tags = fileData.tags.filter(t => t !== tag);
            this.refreshImageItem(fileId);
            if (this.currentSelectedImage && this.currentSelectedImage.id == fileId) {
                this.updateIndividualTagsUI();
            }
        }
    }

    updateImageSource(fileId, source) {
        const fileData = this.selectedFiles.find(f => f.id == fileId);
        if (fileData) {
            fileData.source = source;
        }
    }

    applyBatchTags() {
        // 取出批量标签（去空）
        const batchTags = Array.from(document.getElementById('batch-tags').children)
            .map(el => el.textContent.trim())
            .filter(t => t.length > 0);

        // 将每张图片的 tags **重置为** 批量标签（不再在原有基础上追加）
        this.selectedFiles.forEach(fileData => {
            fileData.tags = [...batchTags];
        });

        // 刷新所有图片项显示
        this.selectedFiles.forEach(fileData => {
            this.refreshImageItem(fileData.id);
        });

        // 如果有选中图片，更新右侧单图标签 UI
        if (this.currentSelectedImage) {
            // 如果当前选中图片在 selectedFiles 中，更新引用并刷新 UI
            const cur = this.selectedFiles.find(f => f.id == this.currentSelectedImage.id);
            if (cur) this.currentSelectedImage = cur;
            this.updateIndividualTagsUI();
        }
    }

    refreshImageItem(fileId) {
        const item = document.querySelector(`[data-file-id="${fileId}"]`);
        const fileData = this.selectedFiles.find(f => f.id == fileId);

        if (item && fileData) {
            const tagsContainer = item.querySelector('.image-item-tags');
            tagsContainer.innerHTML = fileData.tags.map(tag => `
                <span class="tag-item">
                    ${tag}
                    <button class="tag-remove" onclick="uploadManager.removeImageTag('${fileId}', '${tag}')">
                        <i class="fa-solid fa-times"></i>
                    </button>
                </span>
            `).join('');
        }
    }

    removeImage(fileId) {
        this.selectedFiles = this.selectedFiles.filter(f => f.id != fileId);
        document.querySelector(`[data-file-id="${fileId}"]`).remove();

        if (this.currentSelectedImage && this.currentSelectedImage.id == fileId) {
            this.currentSelectedImage = null;
            this.updateIndividualTagsUI();
        }

        this.updateStats();
    }

    renderRecommendedTags() {
        const container = document.getElementById('recommended-tags');
        container.innerHTML = this.recommendedTags.map(tag => `
            <span class="tag-item recommended" onclick="uploadManager.addToBatchTags('${tag}')">
                ${tag}
            </span>
        `).join('');
    }

    clearAll() {
        if (confirm('确定要清空所有选中的图片吗？')) {
            this.selectedFiles = [];
            this.currentSelectedImage = null;
            document.getElementById('images-grid').innerHTML = '';
            document.getElementById('batch-tags').innerHTML = '';
            this.updateIndividualTagsUI();
            this.updateStats();
        }
    }

    updateStats() {
        document.getElementById('selected-count').textContent = this.selectedFiles.length;

        const hasFiles = this.selectedFiles.length > 0;
        document.getElementById('clear-all-btn').disabled = !hasFiles;
        document.getElementById('upload-all-btn').disabled = !hasFiles;
    }

    // --- 新增：实际的文件上传逻辑 ---
    async uploadFile(fileData, { onDuplicate = null } = {}) {
        const formData = new FormData();
        formData.append('image', fileData.file);
        formData.append('tags', JSON.stringify(fileData.tags));
        formData.append('source', fileData.source);

        try {
            const response = await fetch('http://localhost:3000/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            // 如果检测到重复，并且提供了 onDuplicate 回调函数
            if (response.ok && result.duplicate && typeof onDuplicate === 'function') {
                onDuplicate(fileData); // 调用回调，把当前文件数据传回去
            }

            if (!response.ok) {
                throw new Error(result.message || '上传失败');
            }

            return result;

        } catch (error) {
            console.error(`上传文件 ${fileData.name} 失败:`, error);
            return { success: false, message: error.message }; // 返回失败对象
        }
    }

    // --- 【重要】修改 uploadAll 方法 ---
    async uploadAll() {
        if (this.selectedFiles.length === 0) return;

        const modal = document.getElementById('upload-modal');
        const progressFill = modal.querySelector('.progress-fill');
        const progressCurrent = document.getElementById('progress-current');
        const progressTotal = document.getElementById('progress-total');
        const uploadStatus = document.getElementById('upload-status');

        modal.classList.add('show');
        progressTotal.textContent = this.selectedFiles.length;
        let uploadedCount = 0;

        for (let i = 0; i < this.selectedFiles.length; i++) {
            const fileData = this.selectedFiles[i];

            progressCurrent.textContent = i + 1;
            uploadStatus.textContent = `正在上传: ${fileData.name}`;

            const result = await this.uploadFile(fileData, {
                // 定义一个在检测到重复时执行的回调函数
                onDuplicate: async (duplicateFileData) => {
                    uploadStatus.textContent = `发现重复文件: ${duplicateFileData.name}`;
                    // 弹出确认框
                    if (confirm(`图片 "${duplicateFileData.name}" 已存在，是否要覆盖更新它的标签和来源信息？`)) {
                        uploadStatus.textContent = `正在覆盖更新: ${duplicateFileData.name}`;

                        // 调用新的覆盖接口
                        const formData = new FormData();
                        formData.append('image', duplicateFileData.file);
                        formData.append('tags', JSON.stringify(duplicateFileData.tags));
                        formData.append('source', duplicateFileData.source);

                        try {
                            const overwriteResponse = await fetch('http://localhost:3000/overwrite', {
                                method: 'POST',
                                body: formData
                            });
                            if (!overwriteResponse.ok) {
                                throw new Error('覆盖失败');
                            }
                            uploadStatus.textContent = `覆盖成功: ${duplicateFileData.name}`;
                        } catch (err) {
                            uploadStatus.textContent = `覆盖失败: ${duplicateFileData.name}`;
                        }
                    } else {
                        uploadStatus.textContent = `跳过重复文件: ${duplicateFileData.name}`;
                    }
                }
            });

            if (result.success) {
                uploadedCount++;
                const progress = (uploadedCount / this.selectedFiles.length) * 100;
                progressFill.style.width = progress + '%';
            } else {
                uploadStatus.textContent = `上传失败: ${fileData.name}. ${result.message}`;
                await new Promise(resolve => setTimeout(resolve, 2000)); // 暂停让用户看到错误
            }
        }

        uploadStatus.textContent = '所有上传任务完成！';
        setTimeout(() => {
            modal.classList.remove('show');
            this.clearAll();
        }, 2000);
    }


    /* async simulateUpload(fileData) {
        // 模拟上传延迟
        return new Promise(resolve => {
            setTimeout(resolve, 1000 + Math.random() * 2000);
        });
    }
 */
    cancelUpload() {
        document.getElementById('upload-modal').classList.remove('show');
        // 注意：这里的取消只是关闭了弹窗，并不会停止已经发起的网络请求。
        // 实现真正的请求中断需要更复杂 AbortController 逻辑。
    }
}

// 全局实例，供HTML调用
let uploadManager;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    uploadManager = new ImageUploader();
});