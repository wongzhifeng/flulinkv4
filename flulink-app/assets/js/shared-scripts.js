/**
 * FluLink 应用共享脚本文件
 * 包含所有页面共用的JavaScript功能
 */

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有共享功能
    initNavigation();
    initAnimations();
    initInteractions();
});

/**
 * 初始化导航功能
 */
function initNavigation() {
    // 底部导航栏切换
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // 移除所有活动状态
            navItems.forEach(i => {
                i.classList.remove('active');
                i.classList.add('text-gray-400');
            });
            
            // 添加当前项的活动状态
            this.classList.add('active');
            this.classList.remove('text-gray-400');
            
            // 获取导航项的目标页面
            const targetPage = this.getAttribute('data-target');
            if (targetPage) {
                navigateToPage(targetPage);
            }
        });
    });
    
    // 顶部导航栏返回按钮
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            window.history.back();
        });
    });
}

/**
 * 初始化动画效果
 */
function initAnimations() {
    // 添加页面加载动画
    document.body.classList.add('loaded');
    
    // 初始化滚动动画
    initScrollAnimations();
    
    // 初始化悬停效果
    initHoverEffects();
}

/**
 * 初始化交互功能
 */
function initInteractions() {
    // 初始化模态框
    initModals();
    
    // 初始化下拉菜单
    initDropdowns();
    
    // 初始化表单验证
    initFormValidation();
    
    // 初始化工具提示
    initTooltips();
}

/**
 * 页面导航功能
 */
function navigateToPage(pageName) {
    // 根据页面名称导航到对应页面
    const pageMap = {
        'home': 'index.html',
        'map': 'spread-map.html',
        'create': 'create-strain.html',
        'profile': 'immunity-profile.html'
    };
    
    const targetUrl = pageMap[pageName];
    if (targetUrl) {
        // 添加页面切换动画
        document.body.classList.add('page-transition');
        
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 300);
    }
}

/**
 * 滚动动画初始化
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

/**
 * 悬停效果初始化
 */
function initHoverEffects() {
    // 卡片悬停效果
    const cards = document.querySelectorAll('.card, .virus-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 按钮悬停效果
    const buttons = document.querySelectorAll('.action-button, .neumorphism');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

/**
 * 模态框功能
 */
function initModals() {
    // 打开模态框
    const modalTriggers = document.querySelectorAll('[data-modal-target]');
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', function() {
            const targetId = this.getAttribute('data-modal-target');
            const modal = document.getElementById(targetId);
            if (modal) {
                openModal(modal);
            }
        });
    });
    
    // 关闭模态框
    const modalCloseButtons = document.querySelectorAll('.modal-close');
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // 点击模态框外部关闭
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });
}

/**
 * 打开模态框
 */
function openModal(modal) {
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // 添加打开动画
    setTimeout(() => {
        modal.classList.add('animate-in');
    }, 10);
}

/**
 * 关闭模态框
 */
function closeModal(modal) {
    modal.classList.remove('animate-in');
    
    setTimeout(() => {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }, 300);
}

/**
 * 下拉菜单功能
 */
function initDropdowns() {
    const dropdownTriggers = document.querySelectorAll('.dropdown-trigger');
    dropdownTriggers.forEach(trigger => {
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const dropdown = this.nextElementSibling;
            if (dropdown && dropdown.classList.contains('dropdown-menu')) {
                // 关闭其他所有下拉菜单
                document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
                    if (menu !== dropdown) {
                        menu.classList.remove('active');
                    }
                });
                
                // 切换当前下拉菜单
                dropdown.classList.toggle('active');
            }
        });
    });
    
    // 点击页面其他地方关闭下拉菜单
    document.addEventListener('click', function() {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
            menu.classList.remove('active');
        });
    });
}

/**
 * 表单验证功能
 */
function initFormValidation() {
    const forms = document.querySelectorAll('form[data-validate]');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(form)) {
                e.preventDefault();
            }
        });
    });
}

/**
 * 验证表单
 */
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[data-required]');
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, '此字段为必填项');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    return isValid;
}

/**
 * 显示字段错误
 */
function showFieldError(field, message) {
    field.classList.add('error');
    
    // 创建或更新错误消息
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('field-error')) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error text-red-400 text-xs mt-1';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    errorElement.textContent = message;
}

/**
 * 清除字段错误
 */
function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('field-error')) {
        errorElement.remove();
    }
}

/**
 * 工具提示功能
 */
function initTooltips() {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip]');
    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            showTooltip(this, tooltipText);
        });
        
        trigger.addEventListener('mouseleave', function()