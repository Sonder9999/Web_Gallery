// scripts/tags.js - (最终版) 支持层级结构的标签管理脚本

class HierarchicalTagsManager {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.tagsTree = []; // 存储从API获取的原始树形数据
        this.flatTags = new Map(); // 使用Map存储扁平化数据，方便通过ID快速查找
        this.currentEditingTagId = null; // 正在编辑的标签ID
        this.tagToDelete = null; // 准备删除的标签对象

        // 基础字段配置
        this.baseFields = [
            { key: 'zh', label: '中文名', required: true },
            { key: 'en', label: '英文名', required: true },
            { key: 'ja', label: '日语名' },
            { key: 'pinyin', label: '拼音' }
        ];
        this.aliasCount = 3; // 默认显示的“别称”输入框数量
    }

    async init() {
        this.cacheDOMElements();
        this.renderInputFields();
        this.bindGlobalEvents();
        await this.loadAndRenderAll();
    }

    /**
     * [新增] 获取一个标签及其所有子孙标签的ID列表
     * @param {number} tagId - 起始标签的ID
     * @returns {number[]} - 包含起始标签及其所有后代ID的数组
     */
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
        // 缓存所有需要操作的DOM元素
        this.form = document.getElementById('add-tag-form');
        this.formTitle = document.getElementById('form-title');
        this.submitText = document.getElementById('submit-text');
        this.parentSelector = document.getElementById('parent-selector');
        this.clearParentBtn = document.getElementById('clear-parent-btn');
        this.cancelEditBtn = document.getElementById('cancel-edit-btn');
        this.treeContainer = document.getElementById('tags-tree');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.deleteModal = document.getElementById('delete-modal');
        this.deleteTagNameSpan = document.getElementById('delete-tag-name');
        this.childrenWarning = document.getElementById('children-warning');
    }

    bindGlobalEvents() {
        // 绑定不会随渲染变化的全局事件
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        document.getElementById('clear-inputs-btn').addEventListener('click', () => this.clearInputs());
        this.cancelEditBtn.addEventListener('click', () => this.cancelEditMode());
        this.clearParentBtn.addEventListener('click', () => this.clearParentSelection());
        document.getElementById('expand-all-btn').addEventListener('click', () => this.toggleAll(true));
        document.getElementById('collapse-all-btn').addEventListener('click', () => this.toggleAll(false));
        document.getElementById('cancel-delete-btn').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('confirm-delete-btn').addEventListener('click', () => this.confirmDelete());

        // 使用事件委托来处理动态生成的树节点交互
        this.treeContainer.addEventListener('click', (e) => this.handleTreeInteraction(e));
    }

    async loadAndRenderAll() {
        this.showLoading(true);
        try {
            const response = await fetch(`${this.API_BASE_URL}/tags`);
            if (!response.ok) throw new Error(`网络错误: ${response.statusText}`);
            this.tagsTree = await response.json();

            // 创建一个扁平化的数据结构，方便通过ID快速查找
            this.flatTags.clear();
            const flatten = (nodes) => {
                nodes.forEach(node => {
                    this.flatTags.set(node.id, node);
                    if (node.children) flatten(node.children);
                });
            };
            flatten(this.tagsTree);

            this.renderParentSelector();
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

    renderParentSelector() {
        let optionsHtml = '<option value="">-- 顶级标签 (无父标签) --</option>';

        // 只有在编辑模式下，才需要排除某些选项
        let excludedIds = [];
        if (this.currentEditingTagId) {
            // 获取当前正在编辑的标签及其所有子孙的ID
            excludedIds = this.getDescendantIds(this.currentEditingTagId);
        }

        const renderOptions = (nodes, indent = 0) => {
            nodes.forEach(node => {
                // 如果当前节点在排除列表中，则直接跳过，不渲染此选项
                if (excludedIds.includes(node.id)) {
                    return;
                }
                optionsHtml += `<option value="${node.id}">${'　'.repeat(indent)}${this.getNodeDisplayName(node)}</option>`;
                if (node.children) {
                    renderOptions(node.children, indent + 1);
                }
            });
        };

        renderOptions(this.tagsTree);
        this.parentSelector.innerHTML = optionsHtml;
    }

    renderTree() {
        if (this.tagsTree.length === 0) {
            this.treeContainer.innerHTML = '<p>暂无标签，请在上方添加一个新标签。</p>';
            return;
        }
        this.treeContainer.innerHTML = `<ul>${this.renderTreeNodes(this.tagsTree)}</ul>`;
    }

    renderTreeNodes(nodes) {
        return nodes.map(node => {
            const hasChildren = node.children && node.children.length > 0;
            return `
                <li data-tag-id="${node.id}">
                    <div class="tree-item ${this.currentEditingTagId === node.id ? 'selected' : ''}">
                        <span class="tree-indent">
                            ${hasChildren ? `<button class="tree-toggle"><i class="fa-solid fa-chevron-right"></i></button>` : ''}
                        </span>
                        <div class="tree-content">
                            <span class="tree-label">${this.getNodeDisplayName(node)}</span>
                            <span class="tree-info">(${node.primary_name_en})</span>
                        </div>
                        <div class="tree-actions">
                            <button class="tree-action-btn add-child" title="添加子标签"><i class="fa-solid fa-plus"></i></button>
                            <button class="tree-action-btn edit" title="编辑"><i class="fa-solid fa-edit"></i></button>
                            <button class="tree-action-btn delete" title="删除"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    ${hasChildren ? `<ul class="tree-children collapsed">${this.renderTreeNodes(node.children)}</ul>` : ''}
                </li>`;
        }).join('');
    }

    // --- [重要修改] 事件处理 ---
    handleTreeInteraction(e) {
        const listItem = e.target.closest('li[data-tag-id]');
        if (!listItem) return;
        const tagId = parseInt(listItem.dataset.tagId, 10);

        const button = e.target.closest('button');

        if (button) { // 如果点击的是按钮
            if (button.classList.contains('tree-toggle')) {
                listItem.querySelector('.tree-children')?.classList.toggle('collapsed');
                button.classList.toggle('expanded');
            } else if (button.classList.contains('add-child')) {
                this.setParentSelection(tagId);
                this.form.scrollIntoView({ behavior: 'smooth' });
            } else if (button.classList.contains('edit')) {
                this.enterEditMode(tagId);
            } else if (button.classList.contains('delete')) {
                this.showDeleteModal(tagId);
            }
        } else if (e.target.closest('.tree-item')) { // 如果点击的是行本身 (但不是按钮)
            this.enterEditMode(tagId);
        }
    }


    async handleFormSubmit(e) {
        e.preventDefault();
        const { primary_name_en, aliases, parent_id } = this.collectFormData();

        if (!aliases.some(a => a.lang === 'zh' && a.name)) {
            alert('请至少填写中文名称'); return;
        }
        if (!aliases.some(a => a.lang === 'en' && a.name)) {
            alert('请至少填写英文名称'); return;
        }

        const method = this.currentEditingTagId ? 'PUT' : 'POST';
        const url = this.currentEditingTagId ? `${this.API_BASE_URL}/tags/${this.currentEditingTagId}` : `${this.API_BASE_URL}/tags`;

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ primary_name_en, aliases, parent_id })
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
        this.renderParentSelector(); // 重新渲染父选择器以排除当前标签及其子孙

        // 填充表单
        tag.aliases.forEach(alias => {
            if (this.baseFields.some(f => f.key === alias.lang)) {
                const input = document.getElementById(`input-${alias.lang}`);
                if (input) input.value = alias.name;
            } else if (alias.lang.startsWith('nickname')) { // 填充到空的别称框
                for (let i = 1; i <= this.aliasCount; i++) {
                    const aliasInput = document.getElementById(`input-alias${i}`);
                    if (aliasInput && !aliasInput.value) {
                        aliasInput.value = alias.name;
                        break;
                    }
                }
            }
        });
        this.setParentSelection(tag.parent_id);

        // 更新UI
        this.formTitle.textContent = `编辑标签：${this.getNodeDisplayName(tag)}`;
        this.submitText.textContent = '更新标签';
        this.cancelEditBtn.style.display = 'inline-flex';

        // 更新高亮
        document.querySelectorAll('.tree-item.selected').forEach(el => el.classList.remove('selected'));
        const currentItem = this.treeContainer.querySelector(`li[data-tag-id='${tagId}'] .tree-item`);
        if (currentItem) currentItem.classList.add('selected');

        this.form.scrollIntoView({ behavior: 'smooth' });
    }

    cancelEditMode() {
        this.currentEditingTagId = null;
        this.clearInputs();
        this.clearParentSelection();
        this.formTitle.textContent = '添加新标签';
        this.submitText.textContent = '保存到数据库';
        this.cancelEditBtn.style.display = 'none';

        // 移除所有高亮
        document.querySelectorAll('.tree-item.selected').forEach(el => el.classList.remove('selected'));
        this.renderParentSelector(); // 恢复完整的父选择器
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

        return {
            primary_name_en,
            aliases,
            parent_id: this.parentSelector.value || null
        };
    }

    // --- 辅助函数 ---
    getNodeDisplayName(node) {
        if (!node || !node.aliases) return node?.primary_name_en || '未知标签';
        const zhAlias = node.aliases.find(a => a.lang === 'zh');
        return zhAlias ? zhAlias.name : node.primary_name_en;
    }

    getTagPath(startTagId) {
        const path = [];
        let currentTag = this.flatTags.get(startTagId);
        while (currentTag) {
            path.unshift(currentTag);
            currentTag = this.flatTags.get(currentTag.parent_id);
        }
        return path;
    }

    setParentSelection(parentId) {
        this.parentSelector.value = parentId || '';
    }

    clearParentSelection() {
        this.parentSelector.value = '';
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