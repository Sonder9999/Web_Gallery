// js/nav.js - 导航栏交互功能
class Navigation {
    constructor() {
        this.searchInput = document.querySelector('.search-input');
        this.searchBtn = document.querySelector('.search-btn');
        this.clearBtn = document.querySelector('.nav-search-clean');
        this.navLinks = document.querySelectorAll('.nav-link');

        this.init();
    }

    init() {
        this.bindEvents();
        this.setActiveLink();
        this.handleResponsive();
    }

    bindEvents() {
        // 搜索功能
        this.searchBtn?.addEventListener('click', () => this.handleSearch());
        this.searchInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // 清除搜索
        this.clearBtn?.addEventListener('click', () => this.clearSearch());

        // 搜索输入监听
        this.searchInput?.addEventListener('input', (e) => {
            this.toggleClearButton(e.target.value);
        });

        // 导航链接点击
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // 响应式监听
        window.addEventListener('resize', () => this.handleResponsive());
    }

    handleSearch() {
        // this.clearSearch();
        const query = this.searchInput?.value.trim();
        if (query) {
            console.log('搜索:', query);
            // TODO: 实现搜索功能
            // this.performSearch(query);
        }
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.toggleClearButton('');
            this.searchInput.focus();
        }
    }

    toggleClearButton(value) {
        if (this.clearBtn) {
            this.clearBtn.style.display = value ? 'block' : 'none';
        }
    }

    handleNavClick(e) {
        e.preventDefault();
        const link = e.currentTarget;
        const href = link.getAttribute('href');

        // 更新活跃状态
        this.setActiveLink(href);

        // 导航逻辑
        this.navigate(href);
    }

    setActiveLink(currentPath = window.location.pathname) {
        this.navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }

    navigate(path) {
        console.log('导航到:', path);
        // TODO: 实现客户端路由或页面跳转
        // 简单实现：
        window.location.href = path;
    }

    handleResponsive() {
        const width = window.innerWidth;

        // 可以在这里添加响应式逻辑
        if (width <= 480) {
            // 移动端特殊处理
            this.setupMobileInteractions();
        }
    }

    setupMobileInteractions() {
        // 移动端特殊交互设置
        // 例如：双击搜索栏展开等
    }
}

// 初始化导航栏
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
});

// 滚动时导航栏效果（可选）
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const nav = document.getElementById('top-nav');
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // 向下滚动，隐藏导航栏
        nav.style.transform = 'translateY(-100%)';
    } else {
        // 向上滚动，显示导航栏
        nav.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScrollY;
});