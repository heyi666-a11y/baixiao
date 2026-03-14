/**
 * Toast 提示组件
 * 支持成功、错误、警告、加载等类型
 */
class Toast {
  constructor() {
    this.container = null;
    this.toastElement = null;
    this.hideTimer = null;
    this.init();
  }

  /**
   * 初始化 Toast 容器
   */
  init() {
    if (typeof document === 'undefined') return;
    
    // 检查是否已存在容器
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 9999;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
  }

  /**
   * 显示 Toast
   * @param {string} message - 提示消息
   * @param {string} type - 类型: 'success' | 'error' | 'warning' | 'loading' | 'info'
   * @param {number} duration - 显示时长(毫秒)，默认 2000ms，loading 类型默认不自动关闭
   * @returns {HTMLElement} toast 元素
   */
  show(message, type = 'info', duration = 2000) {
    if (typeof document === 'undefined') return null;

    // 清除之前的定时器
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }

    // 移除已存在的 toast
    if (this.toastElement) {
      this.toastElement.remove();
    }

    // 创建 toast 元素
    this.toastElement = document.createElement('div');
    
    // 类型配置
    const typeConfig = {
      success: { icon: '✓', color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f' },
      error: { icon: '✕', color: '#ff4d4f', bgColor: '#fff2f0', borderColor: '#ffccc7' },
      warning: { icon: '!', color: '#faad14', bgColor: '#fffbe6', borderColor: '#ffe58f' },
      info: { icon: 'i', color: '#1890ff', bgColor: '#e6f7ff', borderColor: '#91d5ff' },
      loading: { icon: '◌', color: '#1890ff', bgColor: '#e6f7ff', borderColor: '#91d5ff' }
    };

    const config = typeConfig[type] || typeConfig.info;

    this.toastElement.style.cssText = `
      display: flex;
      align-items: center;
      padding: 12px 24px;
      background: ${config.bgColor};
      border: 1px solid ${config.borderColor};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      font-size: 14px;
      color: #333;
      min-width: 120px;
      max-width: 300px;
      word-break: break-word;
      opacity: 0;
      transform: scale(0.9);
      transition: all 0.3s ease;
      pointer-events: auto;
    `;

    // 图标
    const iconElement = document.createElement('span');
    iconElement.textContent = config.icon;
    iconElement.style.cssText = `
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      margin-right: 8px;
      border-radius: 50%;
      background: ${config.color};
      color: white;
      font-size: 12px;
      font-weight: bold;
      flex-shrink: 0;
    `;

    // 加载动画
    if (type === 'loading') {
      iconElement.style.cssText += `
        animation: toast-spin 1s linear infinite;
      `;
      // 添加动画样式
      if (!document.getElementById('toast-animation')) {
        const style = document.createElement('style');
        style.id = 'toast-animation';
        style.textContent = `
          @keyframes toast-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    }

    // 消息文本
    const textElement = document.createElement('span');
    textElement.textContent = message;
    textElement.style.cssText = `
      flex: 1;
      line-height: 1.5;
    `;

    this.toastElement.appendChild(iconElement);
    this.toastElement.appendChild(textElement);
    this.container.appendChild(this.toastElement);

    // 显示动画
    requestAnimationFrame(() => {
      this.toastElement.style.opacity = '1';
      this.toastElement.style.transform = 'scale(1)';
    });

    // 自动关闭（loading 类型不自动关闭）
    if (type !== 'loading' && duration > 0) {
      this.hideTimer = setTimeout(() => {
        this.hide();
      }, duration);
    }

    return this.toastElement;
  }

  /**
   * 隐藏 Toast
   */
  hide() {
    if (!this.toastElement) return;

    this.toastElement.style.opacity = '0';
    this.toastElement.style.transform = 'scale(0.9)';

    setTimeout(() => {
      if (this.toastElement) {
        this.toastElement.remove();
        this.toastElement = null;
      }
    }, 300);
  }

  /**
   * 显示成功提示
   * @param {string} message - 提示消息
   * @param {number} duration - 显示时长
   */
  success(message, duration = 2000) {
    return this.show(message, 'success', duration);
  }

  /**
   * 显示错误提示
   * @param {string} message - 提示消息
   * @param {number} duration - 显示时长
   */
  error(message, duration = 3000) {
    return this.show(message, 'error', duration);
  }

  /**
   * 显示警告提示
   * @param {string} message - 提示消息
   * @param {number} duration - 显示时长
   */
  warning(message, duration = 2500) {
    return this.show(message, 'warning', duration);
  }

  /**
   * 显示信息提示
   * @param {string} message - 提示消息
   * @param {number} duration - 显示时长
   */
  info(message, duration = 2000) {
    return this.show(message, 'info', duration);
  }

  /**
   * 显示加载提示
   * @param {string} message - 提示消息
   * @returns {HTMLElement} toast 元素
   */
  loading(message = '加载中...') {
    return this.show(message, 'loading', 0);
  }
}

// 创建单例实例
const toast = new Toast();

/**
 * 显示 Toast 提示（便捷函数）
 * @param {string} message - 提示消息
 * @param {string} type - 类型
 * @param {number} duration - 显示时长
 */
function showToast(message, type = 'info', duration) {
  return toast.show(message, type, duration);
}

/**
 * 隐藏 Toast 提示（便捷函数）
 */
function hideToast() {
  toast.hide();
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Toast, toast, showToast, hideToast };
}

if (typeof window !== 'undefined') {
  window.Toast = Toast;
  window.toast = toast;
  window.showToast = showToast;
  window.hideToast = hideToast;
}
