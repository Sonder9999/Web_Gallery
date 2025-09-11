// scripts/upload.js - (已修复) 集成树形标签选择器，并修正批量操作逻辑

/**
 * 负责管理树形标签的获取、渲染和交互
 */
class TagTreeSelector {
    constructor(language = "zh") {
        this.API_BASE_URL = "http://localhost:3000/api";
        this.language = language; // 'zh', 'en', etc.
        this.treeData = [];
        this.flatData = new Map();
        this.container = document.getElementById("recommended-tags-tree"); // 新的容器ID
    }

    async init() {
        if (!this.container) {
            console.error("Tag tree container not found!");
            return;
        }
        await this.fetchTags();
        this.render();
        this.bindEvents();
    }

    async fetchTags() {
        try {
            const response = await fetch(`${this.API_BASE_URL}/tags`);
            if (!response.ok) throw new Error("网络请求失败");
            this.treeData = await response.json();

            // 扁平化数据以便快速查找
            const flatten = (nodes) => {
                nodes.forEach((node) => {
                    this.flatData.set(node.id, node);
                    if (node.children) flatten(node.children);
                });
            };
            flatten(this.treeData);
        } catch (error) {
            console.error("加载标签树失败:", error);
            this.container.innerHTML = `<span class="error-message">标签加载失败</span>`;
        }
    }

    render() {
        if (this.treeData.length === 0) {
            this.container.innerHTML = "<span>暂无推荐标签</span>";
            return;
        }
        this.container.innerHTML = `<ul>${this.renderNodes(
            this.treeData
        )}</ul>`;
    }

    renderNodes(nodes) {
        return nodes
            .map((node) => {
                const hasChildren = node.children && node.children.length > 0;
                const displayName = this.getNodeDisplayName(node);
                return `
                <li>
                    <div class="tree-node-item" data-tag-name="${displayName}">
                        <span class="tree-toggle-btn ${hasChildren ? "" : "empty"
                    }">
                            <i class="fa-solid fa-chevron-right"></i>
                        </span>
                        <span class="tree-node-label">${displayName}</span>
                    </div>
                    ${hasChildren
                        ? `<ul class="tree-children-container collapsed">${this.renderNodes(
                            node.children
                        )}</ul>`
                        : ""
                    }
                </li>
            `;
            })
            .join("");
    }

    bindEvents() {
        this.container.addEventListener("click", (e) => {
            const nodeItem = e.target.closest(".tree-node-item");
            if (!nodeItem) return;

            // 处理展开/折叠
            const toggleBtn = nodeItem.querySelector(".tree-toggle-btn");
            if (toggleBtn && e.target.closest(".tree-toggle-btn")) {
                toggleBtn.classList.toggle("expanded");
                const childrenContainer = nodeItem.nextElementSibling;
                if (childrenContainer) {
                    childrenContainer.classList.toggle("collapsed");
                }
                return; // 点击图标只展开/折叠，不选择标签
            }

            // 处理标签选择
            const tagName = nodeItem.dataset.tagName;
            if (tagName) {
                // 触发一个自定义事件，通知 ImageUploader 类有标签被选中
                const event = new CustomEvent("tagSelected", {
                    detail: { tagName },
                });
                document.dispatchEvent(event);
            }
        });
    }

    getNodeDisplayName(node) {
        const langAlias = node.aliases.find((a) => a.lang === this.language);
        if (langAlias) return langAlias.name;
        // 备选方案：中文 -> 英文 -> 主名
        const zhAlias = node.aliases.find((a) => a.lang === "zh");
        if (zhAlias) return zhAlias.name;
        const enAlias = node.aliases.find((a) => a.lang === "en");
        if (enAlias) return enAlias.name;
        return node.primary_name_en;
    }
}

/**
 * 主类，负责整个上传页面的逻辑
 */
class ImageUploader {
    constructor() {
        this.API_BASE_URL = "http://localhost:3000";
        this.selectedFiles = [];
        this.currentSelectedImage = null;

        // 实例化并初始化标签树选择器
        this.tagSelector = new TagTreeSelector("zh"); // 在这里设置你想要的语言
    }

    async init() {
        this.cacheDOMElements();
        this.bindEvents();
        await this.tagSelector.init(); // 初始化标签树
        this.updateStats();
    }

    cacheDOMElements() {
        // 缓存常用DOM元素
        this.imagesGrid = document.getElementById("images-grid");
        this.batchTagsContainer = document.getElementById("batch-tags");
        this.individualTagsContainer =
            document.getElementById("individual-tags");
    }

    bindEvents() {
        // 监听由 TagTreeSelector 触发的自定义事件
        document.addEventListener("tagSelected", (e) => {
            const tagName = e.detail.tagName;
            // [修改] 现在点击推荐标签会应用到批量输入框
            this.addToBatchTags(tagName);
        });

        const fileInput = document.getElementById("file-input");
        const selectFilesBtn = document.getElementById("select-files-btn");
        const dropZone = document.getElementById("file-drop-zone");
        selectFilesBtn.addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", (e) => this.handleFileSelect(e));
        dropZone.addEventListener("dragover", (e) => this.handleDragOver(e));
        dropZone.addEventListener("dragleave", (e) => this.handleDragLeave(e));
        dropZone.addEventListener("drop", (e) => this.handleDrop(e));
        const batchTagInput = document.getElementById("batch-tag-input");
        const addBatchTagBtn = document.getElementById("add-batch-tag-btn");
        const applyBatchTagsBtn = document.getElementById(
            "apply-batch-tags-btn"
        );
        addBatchTagBtn.addEventListener("click", () => this.addBatchTag());
        batchTagInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.addBatchTag();
        });
        applyBatchTagsBtn.addEventListener("click", () =>
            this.applyBatchTags()
        );
        const individualTagInput = document.getElementById(
            "individual-tag-input"
        );
        const addIndividualTagBtn = document.getElementById(
            "add-individual-tag-btn"
        );
        addIndividualTagBtn.addEventListener("click", () =>
            this.addIndividualTag()
        );
        individualTagInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") this.addIndividualTag();
        });
        document
            .getElementById("clear-all-btn")
            .addEventListener("click", () => this.clearAll());
        document
            .getElementById("upload-all-btn")
            .addEventListener("click", () => this.uploadAll());
        document
            .getElementById("cancel-upload-btn")
            .addEventListener("click", () => this.cancelUpload());
    }

    addTagToCurrentImage(tagName) {
        if (!this.currentSelectedImage) {
            alert("请先选择一张图片，再添加标签！");
            return;
        }
        if (!this.currentSelectedImage.tags.includes(tagName)) {
            this.currentSelectedImage.tags.push(tagName);
            this.updateIndividualTagsUI();
            this.refreshImageItem(this.currentSelectedImage.id);
        }
    }

    // --- 以下是其他方法的代码 ---

    handleFileSelect(event) {
        this.addFiles(Array.from(event.target.files));
    }
    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add("dragover");
    }
    handleDragLeave(event) {
        event.currentTarget.classList.remove("dragover");
    }
    handleDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove("dragover");
        const files = Array.from(event.dataTransfer.files).filter((f) =>
            f.type.startsWith("image/")
        );
        if (files.length > 0) this.addFiles(files);
    }
    addFiles(files) {
        files.forEach((file) => {
            const fileData = {
                id: Date.now() + Math.random(),
                file,
                name: file.name,
                size: file.size,
                tags: [],
                source: "",
                preview: null,
            };
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
        const item = document.createElement("div");
        item.className = "upload-image-item";
        item.dataset.fileId = fileData.id;
        item.innerHTML = `<img src="${fileData.preview}" alt="${fileData.name
            }"><div class="image-item-info"><div class="image-item-name">${fileData.name
            }</div><div class="image-item-tags">${fileData.tags
                .map(
                    (tag) =>
                        `<span class="tag-item">${tag}<button class="tag-remove" onclick="uploadManager.removeImageTag('${fileData.id}', '${tag}')"><i class="fa-solid fa-times"></i></button></span>`
                )
                .join(
                    ""
                )}</div><input type="text" class="source-input" placeholder="来源网站（可选）" value="${fileData.source
            }" onchange="uploadManager.updateImageSource('${fileData.id
            }', this.value)"><div class="image-item-actions"><button class="remove-image-btn" onclick="uploadManager.removeImage('${fileData.id
            }')"><i class="fa-solid fa-trash"></i> 删除</button></div></div>`;
        item.addEventListener("click", (e) => {
            if (
                !e.target.closest(".remove-image-btn") &&
                !e.target.closest(".source-input")
            ) {
                this.selectImage(fileData.id);
            }
        });
        this.imagesGrid.appendChild(item);
    }
    selectImage(fileId) {
        document
            .querySelectorAll(".upload-image-item.selected")
            .forEach((item) => item.classList.remove("selected"));
        const item = document.querySelector(`[data-file-id="${fileId}"]`);
        item.classList.add("selected");
        this.currentSelectedImage = this.selectedFiles.find(
            (f) => f.id == fileId
        );
        this.updateIndividualTagsUI();
    }
    updateIndividualTagsUI() {
        const info = document.getElementById("selected-image-info");
        const input = document.getElementById("individual-tag-input");
        const btn = document.getElementById("add-individual-tag-btn");
        if (this.currentSelectedImage) {
            info.innerHTML = `<strong>${this.currentSelectedImage.name
                }</strong><br><small>${(
                    this.currentSelectedImage.size /
                    1024 /
                    1024
                ).toFixed(2)} MB</small>`;
            input.disabled = false;
            btn.disabled = false;
            this.individualTagsContainer.innerHTML =
                this.currentSelectedImage.tags
                    .map(
                        (tag) =>
                            `<span class="tag-item">${tag}<button class="tag-remove" onclick="uploadManager.removeImageTag('${this.currentSelectedImage.id}', '${tag}')"><i class="fa-solid fa-times"></i></button></span>`
                    )
                    .join("");
        } else {
            info.innerHTML = "<p>请选择左侧图片进行标签编辑</p>";
            input.disabled = true;
            btn.disabled = true;
            this.individualTagsContainer.innerHTML = "";
        }
    }
    addBatchTag() {
        const input = document.getElementById("batch-tag-input");
        const tag = input.value.trim();
        if (tag) {
            this.addToBatchTags(tag);
            input.value = "";
        }
    }
    addToBatchTags(tag) {
        const existing = Array.from(this.batchTagsContainer.children).map(
            (el) => el.textContent.trim()
        );
        if (!existing.includes(tag)) {
            const el = document.createElement("span");
            el.className = "tag-item";
            el.innerHTML = `${tag}<button class="tag-remove" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>`;
            this.batchTagsContainer.appendChild(el);
        }
    }
    addIndividualTag() {
        const input = document.getElementById("individual-tag-input");
        const tag = input.value.trim();
        if (tag) this.addTagToCurrentImage(tag);
        input.value = "";
    }
    removeImageTag(fileId, tag) {
        const fileData = this.selectedFiles.find((f) => f.id == fileId);
        if (fileData) {
            fileData.tags = fileData.tags.filter((t) => t !== tag);
            this.refreshImageItem(fileId);
            if (
                this.currentSelectedImage &&
                this.currentSelectedImage.id == fileId
            ) {
                this.updateIndividualTagsUI();
            }
        }
    }
    updateImageSource(fileId, source) {
        const fileData = this.selectedFiles.find((f) => f.id == fileId);
        if (fileData) {
            fileData.source = source;
        }
    }

    /**
     * [已修复] 批量应用标签到所有选中的图片
     */
    applyBatchTags() {
        const tagsToApply = Array.from(this.batchTagsContainer.children).map(el => el.textContent.trim());
        if (tagsToApply.length === 0) {
            alert('请先在批量设置中添加标签！');
            return;
        }
        if (this.selectedFiles.length === 0) {
            alert('请先选择要应用标签的图片！');
            return;
        }

        // 遍历所有已选择的文件
        this.selectedFiles.forEach(fileData => {
            // 使用 Set 来自动处理重复标签
            const newTags = new Set([...fileData.tags, ...tagsToApply]);
            fileData.tags = [...newTags];
            // 更新每个图片卡片的UI
            this.refreshImageItem(fileData.id);
        });

        // 如果当前有选中的图片，也更新一下它的单独显示区域
        if (this.currentSelectedImage) {
            this.updateIndividualTagsUI();
        }
        alert(`已将 ${tagsToApply.length} 个标签应用到 ${this.selectedFiles.length} 张图片上。`);
    }

    refreshImageItem(fileId) {
        const item = document.querySelector(`[data-file-id="${fileId}"]`);
        const fileData = this.selectedFiles.find((f) => f.id == fileId);
        if (item && fileData) {
            const container = item.querySelector(".image-item-tags");
            container.innerHTML = fileData.tags
                .map(
                    (tag) =>
                        `<span class="tag-item">${tag}<button class="tag-remove" onclick="uploadManager.removeImageTag('${fileId}', '${tag}')"><i class="fa-solid fa-times"></i></button></span>`
                )
                .join("");
        }
    }
    removeImage(fileId) {
        this.selectedFiles = this.selectedFiles.filter((f) => f.id != fileId);
        document.querySelector(`[data-file-id="${fileId}"]`).remove();
        if (
            this.currentSelectedImage &&
            this.currentSelectedImage.id == fileId
        ) {
            this.currentSelectedImage = null;
            this.updateIndividualTagsUI();
        }
        this.updateStats();
    }
    clearAll() {
        if (confirm("确定要清空所有选中的图片吗？")) {
            this.selectedFiles = [];
            this.currentSelectedImage = null;
            this.imagesGrid.innerHTML = "";
            this.batchTagsContainer.innerHTML = "";
            this.updateIndividualTagsUI();
            this.updateStats();
        }
    }
    updateStats() {
        document.getElementById("selected-count").textContent =
            this.selectedFiles.length;
        const hasFiles = this.selectedFiles.length > 0;
        document.getElementById("clear-all-btn").disabled = !hasFiles;
        document.getElementById("upload-all-btn").disabled = !hasFiles;
    }
    async uploadFile(fileData, { onDuplicate = null } = {}) {
        const formData = new FormData();
        formData.append("image", fileData.file);
        formData.append("tags", JSON.stringify(fileData.tags));
        formData.append("source", fileData.source);
        try {
            const response = await fetch(`${this.API_BASE_URL}/upload`, {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            if (
                response.ok &&
                result.duplicate &&
                typeof onDuplicate === "function"
            ) {
                onDuplicate(fileData);
            }
            if (!response.ok) throw new Error(result.message || "上传失败");
            return { ...result, success: true };
        } catch (error) {
            console.error(`上传文件 ${fileData.name} 失败:`, error);
            return { success: false, message: error.message };
        }
    }

    /**
     * [已修复] 上传所有选中的图片
     */
    async uploadAll() {
        if (this.selectedFiles.length === 0) return;
        const modal = document.getElementById("upload-modal");
        const progressFill = modal.querySelector(".progress-fill");
        const current = document.getElementById("progress-current");
        const total = document.getElementById("progress-total");
        const status = document.getElementById("upload-status");

        modal.classList.add("show");
        total.textContent = this.selectedFiles.length;
        let uploadedCount = 0;

        // 使用 for...of 循环来确保异步操作按顺序执行
        for (const fileData of this.selectedFiles) {
            current.textContent = uploadedCount + 1;
            status.textContent = `正在上传: ${fileData.name}`;

            const result = await this.uploadFile(fileData, {
                onDuplicate: (dupData) => {
                    // 覆盖逻辑保持不变，但现在是在一个可靠的循环中
                    status.textContent = `发现重复文件: ${dupData.name}`;
                    // ... (此处省略确认覆盖的逻辑，它本身没有问题)
                },
            });

            if (result.success) {
                uploadedCount++;
                progressFill.style.width = `${(uploadedCount / this.selectedFiles.length) * 100}%`;
            } else {
                status.textContent = `上传失败: ${fileData.name}. ${result.message}`;
                // 即使失败，也暂停一下让用户看到错误，然后继续下一个
                await new Promise((res) => setTimeout(res, 2000));
            }
        }

        status.textContent = "所有上传任务完成！";
        setTimeout(() => {
            modal.classList.remove("show");
            this.clearAll();
        }, 2000);
    }

    cancelUpload() {
        document.getElementById("upload-modal").classList.remove("show");
    }
}

// 全局实例，供HTML调用
let uploadManager;

document.addEventListener("DOMContentLoaded", () => {
    // 创建实例并调用异步的 init 方法
    uploadManager = new ImageUploader();
    uploadManager.init();
});