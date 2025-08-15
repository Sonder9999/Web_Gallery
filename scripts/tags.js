// scripts/tags.js - (已修复) Excel风格的标签管理页前端逻辑

class TagEditor {
    constructor() {
        this.API_BASE_URL = 'http://localhost:3000/api';
        this.tagsData = []; // 从API获取的原始数据
        this.tableData = []; // 转换为表格结构的扁平数据
        // 固定的核心语言列，作为表格的基础
        this.baseHeaders = [
            { key: 'zh', title: '中文' },
            { key: 'en', title: '英文' },
            { key: 'ja', title: '日语' },
            { key: 'pinyin', title: '拼音' }
        ];
        this.dynamicAliasCount = 1; // 动态“别称”列的数量，至少为1
        this.editingCell = null; // 记录当前正在编辑的单元格，防止重复触发保存
    }

    async init() {
        this.cacheDOMElements();
        this.bindEvents();
        await this.fetchAndRender();
    }

    cacheDOMElements() {
        this.form = document.getElementById('add-tag-form');
        this.inputFieldsContainer = document.getElementById('input-fields-container');
        this.tableHead = document.querySelector('#tags-table thead');
        this.tableBody = document.querySelector('#tags-table tbody');
        this.loadingIndicator = document.getElementById('loading-indicator');
    }

    bindEvents() {
        document.getElementById('clear-inputs-btn').addEventListener('click', () => this.clearInputs());
        this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        // 使用事件委托处理表格的所有交互，性能更佳
        this.tableBody.addEventListener('click', (e) => this.handleTableClick(e));
    }

    // --- 核心数据处理与渲染流程 ---

    async fetchAndRender() {
        this.showLoading(true);
        try {
            const response = await fetch(`${this.API_BASE_URL}/tags`);
            if (!response.ok) throw new Error('网络请求失败');
            this.tagsData = await response.json();
            this.processDataForTable(); // 转换数据
            this.render(); // 统一渲染所有部分
        } catch (error) {
            this.tableBody.innerHTML = `<tr><td colspan="100%">加载失败: ${error.message}</td></tr>`;
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * [已修复] 将从API获取的数据转换为适合表格渲染的结构
     */
    processDataForTable() {
        // 1. 计算需要多少个动态“别称”列
        let maxDynamicAliases = 0;
        this.tagsData.forEach(tag => {
            // “别称”指的是语言(lang)不属于我们预设的基础语言的那些标签
            const dynamicAliases = tag.aliases.filter(alias => !this.baseHeaders.some(h => h.key === alias.lang));
            if (dynamicAliases.length > maxDynamicAliases) {
                maxDynamicAliases = dynamicAliases.length;
            }
        });
        // 保证至少有3个“别称”列，即使所有标签都没有别称
        this.dynamicAliasCount = Math.max(3, maxDynamicAliases + 1);

        // 2. 将原始数据转换为扁平的表格行数据
        this.tableData = this.tagsData.map(tag => {
            const row = {
                tagId: tag.id,
                primaryName: tag.primary_name_en,
                // 使用一个Map来存储所有别名，方便按语言key快速查找
                aliases: new Map()
            };

            const dynamicAliases = tag.aliases.filter(alias => !this.baseHeaders.some(h => h.key === alias.lang));

            // 填充基础语言别名
            tag.aliases.forEach(alias => {
                if (this.baseHeaders.some(h => h.key === alias.lang)) {
                    row.aliases.set(alias.lang, { id: alias.id, name: alias.name });
                }
            });

            // 填充动态“别称”
            dynamicAliases.forEach((alias, index) => {
                row.aliases.set(`alias${index + 1}`, { id: alias.id, name: alias.name, originalLang: alias.lang });
            });

            return row;
        });
    }

    /**
     * 根据当前状态统一渲染整个页面
     */
    render() {
        this.renderInputs();
        this.renderTableHeaders();
        this.renderTableBody();
    }

    renderInputs() {
        const allHeaders = this.getFullHeaders();
        const html = allHeaders.map(header => `
            <div class="input-field-group">
                <label for="input-${header.key}">${header.title}</label>
                <input type="text" id="input-${header.key}" data-lang="${header.key}" placeholder="${header.title}...">
            </div>
        `).join('');

        this.inputFieldsContainer.innerHTML = html;
        // this.inputFieldsContainer.style.gridTemplateColumns = `repeat(${allHeaders.length}, 1fr)`;
    }

    renderTableHeaders() {
        const allHeaders = this.getFullHeaders();
        const headerHtml = allHeaders.map((header, index) => {
            let th = `<th data-lang="${header.key}">${header.title}`;
            // 只在最后一个表头上显示“添加列”按钮
            if (index === allHeaders.length - 1) {
                th += `<button class="add-column-btn" title="添加别称列"><i class="fa-solid fa-plus"></i></button>`;
            }
            th += `</th>`;
            return th;
        }).join('');

        this.tableHead.innerHTML = `<tr>${headerHtml}<th>操作</th></tr>`;

        // 渲染后立即绑定事件
        const addBtn = this.tableHead.querySelector('.add-column-btn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.dynamicAliasCount++;
                this.render(); // 增加一列后，重新渲染所有部分
            });
        }
    }

    renderTableBody() {
        if (this.tableData.length === 0) {
            this.tableBody.innerHTML = `<tr><td colspan="100%">数据库为空，请在上方添加新标签</td></tr>`;
            return;
        }

        const allHeaders = this.getFullHeaders();
        const bodyHtml = this.tableData.map(row => {
            const cellsHtml = allHeaders.map(header => {
                const alias = row.aliases.get(header.key);
                if (alias) {
                    return `<td data-alias-id="${alias.id}" data-lang="${header.key}" contenteditable="true">${alias.name}</td>`;
                } else {
                    return `<td class="empty-cell" data-lang="${header.key}" contenteditable="true"></td>`;
                }
            }).join('');
            return `
                <tr data-tag-id="${row.tagId}">
                    ${cellsHtml}
                    <td><button class="delete-row-btn" title="删除此标签"><i class="fa-solid fa-trash"></i></button></td>
                </tr>
            `;
        }).join('');
        this.tableBody.innerHTML = bodyHtml;
    }

    // --- 事件处理逻辑 ---

    handleTableClick(e) {
        const target = e.target;
        const row = target.closest('tr');
        if (!row) return;

        // 点击删除按钮
        if (target.closest('.delete-row-btn')) {
            this.deleteTag(row.dataset.tagId);
            return;
        }

        // 点击可编辑单元格
        if (target.tagName === 'TD' && target.isContentEditable) {
            target.focus();
            this.handleCellEdit(target);
        } else {
            // 点击行内其他地方，用该行数据填充顶部输入框
            this.populateInputsFromRow(row.dataset.tagId);
        }
    }

    handleCellEdit(cell) {
        if (this.editingCell === cell) return;
        this.editingCell = cell;

        const originalValue = cell.textContent; // 记录原始值

        const onBlur = () => {
            // 移除监听，防止内存泄漏
            cell.removeEventListener('blur', onBlur);
            cell.removeEventListener('keydown', onKeydown);
            this.saveCell(cell, originalValue);
            this.editingCell = null;
        };

        const onKeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                cell.blur(); // 触发 blur 事件来保存
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cell.textContent = originalValue; // 恢复原值
                cell.blur();
            }
        };

        cell.addEventListener('blur', onBlur);
        cell.addEventListener('keydown', onKeydown);
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        const inputs = this.inputFieldsContainer.querySelectorAll('input');
        const aliases = [];

        inputs.forEach(input => {
            const name = input.value.trim();
            if (name) {
                // 对于动态别称列，我们统一使用 'nickname' 作为 lang，后端可以自行处理
                const lang = this.baseHeaders.some(h => h.key === input.dataset.lang) ? input.dataset.lang : 'nickname';
                aliases.push({ name, lang });
            }
        });

        if (aliases.length === 0) {
            alert('请至少填写一个标签名称！');
            return;
        }

        const enInput = document.getElementById('input-en');
        const primaryNameEn = (enInput && enInput.value.trim())
            ? enInput.value.trim().toLowerCase().replace(/\s+/g, '_')
            : aliases[0].name.toLowerCase().replace(/\s+/g, '_');

        try {
            await this.apiCall('/tags', 'POST', { primary_name_en: primaryNameEn, aliases });
            alert('新标签及所有别名已成功保存！');
            this.clearInputs();
            await this.fetchAndRender(); // 成功后刷新整个表格
        } catch (error) {
            alert(`保存失败: ${error.message}`);
        }
    }

    // --- API 调用与辅助函数 ---

    async saveCell(cell, originalValue) {
        const newValue = cell.textContent.trim();
        if (newValue === originalValue) return; // 值未改变，不执行任何操作

        const row = cell.closest('tr');
        const tagId = row.dataset.tagId;
        const aliasId = cell.dataset.aliasId;
        let lang = cell.dataset.lang;
        // 如果是动态别称列，统一用'nickname'
        if (lang.startsWith('alias')) {
            lang = 'nickname';
        }

        try {
            if (aliasId && newValue) { // 更新
                await this.apiCall(`/aliases/${aliasId}`, 'PUT', { name: newValue, lang });
            } else if (aliasId && !newValue) { // 删除
                await this.apiCall(`/aliases/${aliasId}`, 'DELETE');
            } else if (!aliasId && newValue) { // 新增
                await this.apiCall('/aliases', 'POST', { tag_id: tagId, name: newValue, lang });
            }
            await this.fetchAndRender(); // 操作成功后刷新
        } catch (error) {
            alert(`保存失败: ${error.message}`);
            cell.textContent = originalValue; // 失败时恢复原值
        }
    }

    async deleteTag(tagId) {
        if (!confirm('确定要删除这个标签及其所有别名吗？此操作不可逆！')) return;
        try {
            await this.apiCall(`/tags/${tagId}`, 'DELETE');
            await this.fetchAndRender();
        } catch (error) {
            alert(`删除失败: ${error.message}`);
        }
    }

    populateInputsFromRow(tagId) {
        this.clearInputs();
        const rowData = this.tableData.find(row => row.tagId == tagId);
        if (!rowData) return;

        for (const [key, alias] of rowData.aliases.entries()) {
            const input = document.getElementById(`input-${key}`);
            if (input) {
                input.value = alias.name;
            }
        }
    }

    clearInputs() {
        this.form.reset();
    }

    getFullHeaders() {
        const dynamicHeaders = Array.from({ length: this.dynamicAliasCount }, (_, i) => ({
            key: `alias${i + 1}`,
            title: `别称 ${i + 1}`
        }));
        return [...this.baseHeaders, ...dynamicHeaders];
    }

    showLoading(isLoading) {
        this.loadingIndicator.classList.toggle('hidden', !isLoading);
        this.tableBody.classList.toggle('hidden', isLoading);
    }

    async apiCall(endpoint, method, body = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${this.API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'API请求失败');
        }
        return response.json();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TagEditor().init();
});