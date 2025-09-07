// scripts/tags.js - (最终版) 支持层级结构的标签管理脚本，使用模态框选择父标签

class HierarchicalTagsManager {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.tagsTree = [];
        this.flatTags = new Map();
        this.currentEditingTagId = null;
        this.tagToDelete = null;

        // [新增] 用于存储当前选择的父标签ID
        this.selectedParentId = null;

        // [新增] 代码级功能开关：设为 true 才会显示管理页面的“可见”开关
        this.enableVisibilityControls = true;

        this.baseFields = [
            { key: 'zh', label: '中文名', required: true },
            { key: 'en', label: '英文名', required: true },
            { key: 'ja', label: '日语名' },
            { key: 'pinyin', label: '拼音' }
        ];
        this.aliasCount = 3;
    }

    async init() {
        this.cacheDOMElements();
        this.renderInputFields();
        this.bindGlobalEvents();
        await this.loadAndRenderAll();
    }

    getDescendantIds(tagId) {
        const descendants = [];
        const findChildren = (id) => {
            descendants.push(id);
            const tag = this.flatTags.get(id);
            if (tag && tag.children) {
                tag.children.forEach(child => findChildren(child.id));
            }
        };
        findChildren(tagId);
        return descendants;
    }

    cacheDOMElements() {
        // 表单和主页面元素
        this.form = document.getElementById('add-tag-form');
        this.formTitle = document.getElementById('form-title');
        this.submitText = document.getElementById('submit-text');
        this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        this.treeContainer = document.getElementById('tags-tree');
        this.loadingIndicator = document.getElementById('loading-indicator');

        // [新增] 父标签选择器元素
        this.parentDisplay = document.getElementById('parent-display');
        this.openParentModalBtn = document.getElementById('open-parent-modal-btn');

        // [新增] 模态框元素
        this.parentModal = document.getElementById('parent-selector-modal');
        this.modalSearchInput = document.getElementById('modal-search-input');
        this.modalTreeContainer = document.getElementById('modal-tree-container');
        this.modalCloseBtn = document.getElementById('modal-close-btn');
        this.modalSetTopLevelBtn = document.getElementById('modal-set-top-level-btn');

        // 删除弹窗元素
        this.deleteModal = document.getElementById('delete-modal');
        this.deleteTagNameSpan = document.getElementById('delete-tag-name');
        this.childrenWarning = document.getElementById('children-warning');

        // [新增] 缓存表单中的可见性开关
        this.formVisibilityToggle = document.getElementById('form-tag-visibility-toggle');
        this.formVisibilityToggleContainer = document.querySelector('.form-visibility-control .toggle-container');
    }

    bindGlobalEvents() {
        // 全局事件
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('clear-inputs-btn').addEventListener('click', () => this.cancelEditMode());
        this.cancelEditBtn.addEventListener('click', () => this.cancelEditMode());
        document.getElementById('expand-all-btn').addEventListener('click', () => this.toggleAll(true));
        document.getElementById('collapse-all-btn').addEventListener('click', () => this.toggleAll(false));
        document.getElementById('cancel-delete-btn').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('confirm-delete-btn').addEventListener('click', () => this.confirmDelete());
        this.treeContainer.addEventListener('click', (e) => this.handleTreeInteraction(e));

        // [新增] 模态框相关事件
        this.openParentModalBtn.addEventListener('click', () => this.openParentModal());
        this.parentDisplay.addEventListener('click', () => this.openParentModal()); // 点击显示框也打开
        this.modalCloseBtn.addEventListener('click', () => this.closeParentModal());
        this.modalSetTopLevelBtn.addEventListener('click', () => this.selectParent(null));
        this.parentModal.addEventListener('click', (e) => {
            if (e.target === this.parentModal) this.closeParentModal(); // 点击背景关闭
        });
        this.modalSearchInput.addEventListener('input', () => this.filterModalTree());
        this.modalTreeContainer.addEventListener('click', (e) => this.handleModalTreeClick(e));

        // [BUG修复] 为表单中的开关容器添加点击事件监听器
        if (this.formVisibilityToggleContainer) {
            this.formVisibilityToggleContainer.addEventListener('click', () => {
                // 手动切换隐藏的 checkbox 的状态
                this.formVisibilityToggle.checked = !this.formVisibilityToggle.checked;
            });
        }
    }


    async loadAndRenderAll() {
        this.showLoading(true);
        try {
            const response = await fetch(`${this.API_BASE_URL}/tags`);
            if (!response.ok) throw new Error(`网络错误: ${response.statusText}`);
            this.tagsTree = await response.json();

            this.flatTags.clear();
            const flatten = (nodes) => {
                nodes.forEach(node => {
                    this.flatTags.set(node.id, node);
                    if (node.children) flatten(node.children);
                });
            };
            flatten(this.tagsTree);

            this.renderTree();
        } catch (error) {
            console.error('加载标签数据失败:', error);
            this.treeContainer.innerHTML = `<p class="error-message">加载失败: ${error.message}</p>`;
        } finally {
            this.showLoading(false);
        }
    }

    // --- 渲染 ---
    renderInputFields() {
        const container = document.getElementById('input-fields-container');
        let html = '';
        this.baseFields.forEach(field => {
            html += `
                <div class="input-field-group">
                    <label for="input-${field.key}">${field.label}${field.required ? ' *' : ''}</label>
                    <input type="text" id="input-${field.key}" data-lang="${field.key}" placeholder="${field.label}..." ${field.required ? 'required' : ''}>
                </div>`;
        });
        for (let i = 1; i <= this.aliasCount; i++) {
            html += `
                <div class="input-field-group">
                    <label for="input-alias${i}">别称 ${i}</label>
                    <input type="text" id="input-alias${i}" data-lang="nickname" placeholder="别称 ${i}...">
                </div>`;
        }
        container.innerHTML = html;
    }

    renderTree() {
        if (this.tagsTree.length === 0) {
            this.treeContainer.innerHTML = '<p>暂无标签，请在上方添加一个新标签。</p>';
            return;
        }
        this.treeContainer.innerHTML = `<ul>${this.renderTreeNodes(this.tagsTree)}</ul>`;
    }

    renderTreeNodes(nodes, isModal = false) {
        return nodes.map(node => {
            if (isModal && this.currentEditingTagId) {
                const excludedIds = this.getDescendantIds(this.currentEditingTagId);
                if (excludedIds.includes(node.id)) return '';
            }

            const hasChildren = node.children && node.children.length > 0;
            const childrenHTML = hasChildren ? `<ul class="tree-children collapsed">${this.renderTreeNodes(node.children, isModal)}</ul>` : '';

            // [新增] 根据 is_hidden 状态生成开关的 HTML
            const visibilityToggleHTML = (this.enableVisibilityControls && !isModal) ? `
                <label class="tree-visibility-toggle" title="控制此标签是否在画廊显示">
                    <input type="checkbox" data-action="toggle-visibility" ${node.is_hidden ? '' : 'checked'}>
                    <div class="toggle-switch"></div>
                </label>
            ` : '';

            // [修改] 为 div.tree-item 添加 is-hidden 类（如果适用）
            return `
                <li data-tag-id="${node.id}">
                    <div class="tree-item ${this.currentEditingTagId === node.id ? 'selected' : ''} ${node.is_hidden ? 'is-hidden' : ''}">
                        <span class="tree-indent">
                            ${hasChildren ? `<button class="tree-toggle"><i class="fa-solid fa-chevron-right"></i></button>` : ''}
                        </span>
                        <div class="tree-content">
                            <span class="tree-label">${this.getNodeDisplayName(node)}</span>
                            <span class="tree-info">(${node.primary_name_en})</span>
                        </div>
                        ${!isModal ? `
                        <div class="tree-actions">
                            ${visibilityToggleHTML}
                            <button class="tree-action-btn add-child" title="添加子标签"><i class="fa-solid fa-plus"></i></button>
                            <button class="tree-action-btn edit" title="编辑"><i class="fa-solid fa-edit"></i></button>
                            <button class="tree-action-btn delete" title="删除"><i class="fa-solid fa-trash"></i></button>
                        </div>` : ''}
                    </div>
                    ${childrenHTML}
                </li>`;
        }).join('');
    }

    // --- 事件处理 ---
    handleTreeInteraction(e) {
        const listItem = e.target.closest('li[data-tag-id]');
        if (!listItem) return;
        const tagId = parseInt(listItem.dataset.tagId, 10);

        // [新增] 处理可见性开关的点击事件
        if (e.target.dataset.action === 'toggle-visibility') {
            const isChecked = e.target.checked;
            // isChecked 为 true 意味着标签可见，is_hidden 应该是 false
            this.toggleTagVisibility(tagId, !isChecked);
            return; // 处理完开关事件后，不再执行后续逻辑
        }

        const button = e.target.closest('button');
        if (button) {
            if (button.classList.contains('tree-toggle')) {
                listItem.querySelector('.tree-children')?.classList.toggle('collapsed');
                button.classList.toggle('expanded');
            } else if (button.classList.contains('add-child')) {
                this.selectParent(tagId);
                this.form.scrollIntoView({ behavior: 'smooth' });
            } else if (button.classList.contains('edit')) {
                this.enterEditMode(tagId);
            } else if (button.classList.contains('delete')) {
                this.showDeleteModal(tagId);
            }
        } else if (e.target.closest('.tree-item')) {
            // 如果点击的不是开关，则进入编辑模式
            this.enterEditMode(tagId);
        }
    }

    // [新增] 切换标签可见性的核心函数
    async toggleTagVisibility(tagId, shouldBeHidden) {
        try {
            const response = await fetch(`${this.API_BASE_URL}/tags/${tagId}/visibility`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_hidden: shouldBeHidden })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '更新失败');
            }

            // 更新成功后，同步前端UI
            const treeItem = this.treeContainer.querySelector(`li[data-tag-id="${tagId}"] > .tree-item`);
            if (treeItem) {
                treeItem.classList.toggle('is-hidden', shouldBeHidden);
            }
            // 同时更新内存中的数据状态，以便下次渲染时保持一致
            const tagData = this.flatTags.get(tagId);
            if (tagData) {
                tagData.is_hidden = shouldBeHidden;
            }

        } catch (error) {
            console.error('更新标签可见性失败:', error);
            alert(`操作失败: ${error.message}`);
            // 如果API调用失败，则将开关恢复原状
            const checkbox = this.treeContainer.querySelector(`li[data-tag-id="${tagId}"] input[data-action="toggle-visibility"]`);
            if (checkbox) {
                checkbox.checked = !shouldBeHidden;
            }
        }
    }



    async handleFormSubmit(e) {
        e.preventDefault();
        const { primary_name_en, aliases } = this.collectFormData();
        const parent_id = this.selectedParentId;

        // [修改] 获取开关状态
        const is_hidden = !this.formVisibilityToggle.checked;

        if (!aliases.some(a => a.lang === 'zh' && a.name)) { alert('请至少填写中文名称'); return; }
        if (!aliases.some(a => a.lang === 'en' && a.name)) { alert('请至少填写英文名称'); return; }

        const method = this.currentEditingTagId ? 'PUT' : 'POST';
        const url = this.currentEditingTagId ? `${this.API_BASE_URL}/tags/${this.currentEditingTagId}` : `${this.API_BASE_URL}/tags`;

        try {
            // [修改] 将 is_hidden 添加到发送的数据中
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ primary_name_en, aliases, parent_id, is_hidden })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '未知错误');
            }
            alert(`标签${this.currentEditingTagId ? '更新' : '创建'}成功`);
            this.cancelEditMode();
            await this.loadAndRenderAll();
        } catch (error) {
            alert(`保存失败: ${error.message}`);
        }
    }

    // --- 状态管理 ---
    enterEditMode(tagId) {
        const tag = this.flatTags.get(tagId);
        if (!tag) return;

        this.currentEditingTagId = tagId;
        this.clearInputs();

        tag.aliases.forEach(alias => {
            if (this.baseFields.some(f => f.key === alias.lang)) {
                const input = document.getElementById(`input-${alias.lang}`);
                if (input) input.value = alias.name;
            } else if (alias.lang.startsWith('nickname')) {
                for (let i = 1; i <= this.aliasCount; i++) {
                    const aliasInput = document.getElementById(`input-alias${i}`);
                    if (aliasInput && !aliasInput.value) {
                        aliasInput.value = alias.name;
                        break;
                    }
                }
            }
        });
        this.selectParent(tag.parent_id);

        // [修改] 设置表单开关的状态以匹配当前标签
        if (this.formVisibilityToggle) {
            this.formVisibilityToggle.checked = !tag.is_hidden;
        }

        this.formTitle.textContent = `编辑标签：${this.getNodeDisplayName(tag)}`;
        this.submitText.textContent = '更新标签';
        this.cancelEditBtn.style.display = 'inline-flex';

        document.querySelectorAll('.tree-item.selected').forEach(el => el.classList.remove('selected'));
        const currentItem = this.treeContainer.querySelector(`li[data-tag-id='${tagId}'] .tree-item`);
        if (currentItem) currentItem.classList.add('selected');
        this.form.scrollIntoView({ behavior: 'smooth' });
    }

    cancelEditMode() {
        this.currentEditingTagId = null;
        this.clearInputs();
        this.selectParent(null);

        // [修改] 重置表单开关为默认开启状态
        if (this.formVisibilityToggle) {
            this.formVisibilityToggle.checked = true;
        }

        this.formTitle.textContent = '添加新标签';
        this.submitText.textContent = '保存到数据库';
        this.cancelEditBtn.style.display = 'none';
        document.querySelectorAll('.tree-item.selected').forEach(el => el.classList.remove('selected'));
    }

    // --- 数据收集与处理 ---
    collectFormData() {
        const aliases = [];
        this.baseFields.forEach(field => {
            const value = document.getElementById(`input-${field.key}`).value.trim();
            if (value) aliases.push({ name: value, lang: field.key });
        });
        for (let i = 1; i <= this.aliasCount; i++) {
            const value = document.getElementById(`input-alias${i}`).value.trim();
            if (value) aliases.push({ name: value, lang: 'nickname' });
        }
        const enAlias = aliases.find(a => a.lang === 'en');
        const primary_name_en = enAlias ? enAlias.name.toLowerCase().replace(/[^a-z0-9_]+/g, '_') : Date.now().toString();

        return { primary_name_en, aliases };
    }

    // --- [新增] 模态框逻辑 ---
    openParentModal() {
        this.modalTreeContainer.innerHTML = `<ul>${this.renderTreeNodes(this.tagsTree, true)}</ul>`;
        this.parentModal.classList.add('show');
        this.modalSearchInput.focus();
    }

    closeParentModal() {
        this.parentModal.classList.remove('show');
        this.modalSearchInput.value = ''; // 清空搜索框
    }

    handleModalTreeClick(e) {
        const listItem = e.target.closest('li[data-tag-id]');
        if (!listItem) return;

        const tagId = parseInt(listItem.dataset.tagId, 10);
        const toggleButton = e.target.closest('.tree-toggle');

        if (toggleButton) {
            listItem.querySelector('.tree-children')?.classList.toggle('collapsed');
            toggleButton.classList.toggle('expanded');
        } else {
            this.selectParent(tagId);
        }
    }

    selectParent(parentId) {
        this.selectedParentId = parentId;
        if (parentId === null) {
            this.parentDisplay.value = '';
            this.parentDisplay.placeholder = '-- 顶级标签 (无父标签) --';
        } else {
            const parentTag = this.flatTags.get(parentId);
            if (parentTag) {
                this.parentDisplay.value = this.getNodeDisplayName(parentTag);
            }
        }
        this.closeParentModal();
    }

    filterModalTree() {
        const query = this.modalSearchInput.value.trim().toLowerCase();
        const allNodes = this.modalTreeContainer.querySelectorAll('li[data-tag-id]');

        if (!query) {
            allNodes.forEach(node => {
                node.style.display = '';
                const label = node.querySelector('.tree-label');
                if (label) label.innerHTML = label.textContent; // 恢复原始文本
            });
            return;
        }

        const matchedIds = new Set();
        allNodes.forEach(node => {
            const label = node.querySelector('.tree-label');
            const info = node.querySelector('.tree-info');
            const nodeText = (label.textContent + info.textContent).toLowerCase();

            if (nodeText.includes(query)) {
                // 标记匹配节点及其所有父节点
                let current = node;
                while (current && current.dataset.tagId) {
                    matchedIds.add(parseInt(current.dataset.tagId, 10));
                    current = current.parentElement.closest('li[data-tag-id]');
                }
            }
        });

        allNodes.forEach(node => {
            const nodeId = parseInt(node.dataset.tagId, 10);
            const label = node.querySelector('.tree-label');

            if (matchedIds.has(nodeId)) {
                node.style.display = '';
                // 高亮匹配的文本
                const originalText = label.textContent;
                const regex = new RegExp(query, 'gi');
                label.innerHTML = originalText.replace(regex, `<span class="highlight">$&</span>`);
            } else {
                node.style.display = 'none';
            }
        });
    }


    // --- 辅助函数 ---
    getNodeDisplayName(node) {
        if (!node || !node.aliases) return node?.primary_name_en || '未知标签';
        const zhAlias = node.aliases.find(a => a.lang === 'zh');
        return zhAlias ? zhAlias.name : node.primary_name_en;
    }

    clearInputs() {
        this.form.reset();
    }

    toggleAll(expand) {
        this.treeContainer.querySelectorAll('.tree-children').forEach(el => el.classList.toggle('collapsed', !expand));
        this.treeContainer.querySelectorAll('.tree-toggle').forEach(el => el.classList.toggle('expanded', expand));
    }

    showLoading(show) {
        this.loadingIndicator.classList.toggle('hidden', !show);
    }

    showDeleteModal(tagId) {
        const tag = this.flatTags.get(tagId);
        if (!tag) return;
        this.tagToDelete = tag;
        this.deleteTagNameSpan.textContent = this.getNodeDisplayName(tag);
        this.childrenWarning.style.display = (tag.children && tag.children.length > 0) ? 'block' : 'none';
        this.deleteModal.classList.add('show');
    }

    hideDeleteModal() {
        this.deleteModal.classList.remove('show');
        this.tagToDelete = null;
    }

    async confirmDelete() {
        if (!this.tagToDelete) return;
        try {
            const response = await fetch(`${this.API_BASE_URL}/tags/${this.tagToDelete.id}`, { method: 'DELETE' });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '未知错误');
            }
            alert('标签删除成功');
            this.hideDeleteModal();
            // 如果删除的是当前选中的父标签，则清空选择
            if (this.selectedParentId === this.tagToDelete.id) {
                this.selectParent(null);
            }
            await this.loadAndRenderAll();
        } catch (error) {
            alert(`删除失败: ${error.message}`);
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new HierarchicalTagsManager().init();
});