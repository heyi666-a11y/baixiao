/**
 * Loading 加载组件
 * 支持全屏加载和局部加载
 */
class Loading {
  constructor() {
    this.overlay = null;
    this.loadingElement = null;
    this.count = 0; // 用于处理多个 loading 请求
  }

  /**
   * 创建加载元素
   * @param {string} message - 加载提示文字
   * @param {Object} options - 配置选项
   */
  createLoading(message, options = {}) {
    const {
      fullscreen = true,
      target = null,
      spinner = 'default',
      background = 'rgba(0, 0, 0, 0.7)',
      color = '#fff'
    } = options;

    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.cssText = `
      position: ${fullscreen ? 'fixed' : 'absolute'};
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: ${background};
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    // 如果不是全屏，设置相对定位容器
    if (!fullscreen && target) {
      target.style.position = 'relative';
      overlay.style.borderRadius = getComputedStyle(target).borderRadius;
    }

    // 创建加载动画
    const spinnerElement = this.createSpinner(spinner, color);
    overlay.appendChild(spinnerElement);

    // 创建提示文字
    if (message) {
      const textElement = document.createElement('div');
      textElement.textContent = message;
      textElement.style.cssText = `
        margin-top: 16px;
        color: ${color};
        font-size: 14px;
        text-align: center;
      `;
      overlay.appendChild(textElement);
    }

    return overlay;
  }

  /**
   * 创建加载动画
   * @param {string} type - 动画类型
   * @param {string} color - 颜色
   */
  createSpinner(type, color) {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    switch (type) {
      case 'dots':
        // 三个点跳动动画
        container.innerHTML = `
          <div style="display:flex;gap:8px;">
            <span style="
              width:12px;height:12px;
              background:${color};
              border-radius:50%;
              animation:loading-bounce 1.4s ease-in-out infinite both;
              animation-delay:-0.32s;
            "></span>
            <span style="
              width:12px;height:12px;
              background:${color};
              border-radius:50%;
              animation:loading-bounce 1.4s ease-in-out infinite both;
              animation-delay:-0.16s;
            "></span>
            <span style="
              width:12px;height:12px;
              background:${color};
              border-radius:50%;
              animation:loading-bounce 1.4s ease-in-out infinite both;
            "></span>
          </div>
        `;
        this.addAnimation('loading-bounce', `
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        `);
        break;

      case 'pulse':
        // 脉冲动画
        container.innerHTML = `
          <div style="
            width:50px;
            height:50px;
            background:${color};
            border-radius:50%;
            animation:loading-pulse 1s ease-in-out infinite;
          "></div>
        `;
        this.addAnimation('loading-pulse', `
          0% { transform: scale(0.8); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(0.8); opacity: 1; }
        `);
        break;

      case 'ring':
        // 圆环动画
        container.innerHTML = `
          <div style="
            width:50px;
            height:50px;
            border:4px solid transparent;
            border-top-color:${color};
            border-radius:50%;
            animation:loading-spin 1s linear infinite;
          "></div>
        `;
        this.addAnimation('loading-spin', `
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        `);
        break;

      default:
        // 默认旋转动画
        container.innerHTML = `
          <div style="
            width:50px;
            height:50px;
            position:relative;
          ">
            <div style="
              position:absolute;
              width:100%;
              height:100%;
              border:4px solid rgba(255,255,255,0.3);
              border-top-color:${color};
              border-radius:50%;
              animation:loading-spin 0.8s linear infinite;
            "></div>
          </div>
        `;
        this.addAnimation('loading-spin', `
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        `);
    }

    return container;
  }

  /**
   * 添加动画样式
   */
  addAnimation(name, keyframes) {
    const styleId = 'loading-animations';
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    if (!style.textContent.includes(`@keyframes ${name}`)) {
      style.textContent += `@keyframes ${name} { ${keyframes} }`;
    }
  }

  /**
   * 显示 Loading
   * @param {string} message - 加载提示文字
   * @param {Object} options - 配置选项
   * @returns {Object} loading 实例控制对象
   */
  show(message = '加载中...', options = {}) {
    if (typeof document === 'undefined') return { close: () => {} };

    this.count++;

    // 如果已经显示，只更新文字
    if (this.overlay && this.count > 1) {
      const textElement = this.overlay.querySelector('div:last-child');
      if (textElement && message) {
        textElement.textContent = message;
      }
      return { close: () => this.hide() };
    }

    // 创建新的 loading
    this.overlay = this.createLoading(message, options);

    if (options.target) {
      options.target.appendChild(this.overlay);
    } else {
      document.body.appendChild(this.overlay);
    }

    // 禁止背景滚动（全屏模式）
    if (options.fullscreen !== false) {
      document.body.style.overflow = 'hidden';
    }

    // 显示动画
    requestAnimationFrame(() => {
      this.overlay.style.opacity = '1';
    });

    return { close: () => this.hide() };
  }

  /**
   * 隐藏 Loading
   */
  hide() {
    this.count = Math.max(0, this.count - 1);

    if (this.count > 0) return;

    if (!this.overlay) return;

    this.overlay.style.opacity = '0';

    setTimeout(() => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      // 恢复背景滚动
      document.body.style.overflow = '';
    }, 300);
  }

  /**
   * 显示全屏 Loading（便捷方法）
   * @param {string} message - 加载提示文字
   * @returns {Object} loading 实例控制对象
   */
  fullscreen(message = '加载中...') {
    return this.show(message, { fullscreen: true });
  }

  /**
   * 显示局部 Loading（便捷方法）
   * @param {HTMLElement} target - 目标容器元素
   * @param {string} message - 加载提示文字
   * @returns {Object} loading 实例控制对象
   */
  local(target, message = '加载中...') {
    return this.show(message, { fullscreen: false, target });
  }
}

// 创建单例实例
const loading = new Loading();

/**
 * 显示 Loading（便捷函数）
 * @param {string} message - 加载提示文字
 * @param {Object} options - 配置选项
 * @returns {Object} loading 实例控制对象
 */
function showLoading(message = '加载中...', options = {}) {
  return loading.show(message, options);
}

/**
 * 隐藏 Loading（便捷函数）
 */
function hideLoading() {
  loading.hide();
}

/**
 * 显示全屏 Loading（便捷函数）
 * @param {string} message - 加载提示文字
 * @returns {Object} loading 实例控制对象
 */
function showFullscreenLoading(message = '加载中...') {
  return loading.fullscreen(message);
}

/**
 * 显示局部 Loading（便捷函数）
 * @param {HTMLElement} target - 目标容器元素
 * @param {string} message - 加载提示文字
 * @returns {Object} loading 实例控制对象
 */
function showLocalLoading(target, message = '加载中...') {
  return loading.local(target, message);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Loading,
    loading,
    showLoading,
    hideLoading,
    showFullscreenLoading,
    showLocalLoading
  };
}

if (typeof window !== 'undefined') {
  window.Loading = Loading;
  window.loading = loading;
  window.showLoading = showLoading;
  window.hideLoading = hideLoading;
  window.showFullscreenLoading = showFullscreenLoading;
  window.showLocalLoading = showLocalLoading;
}
