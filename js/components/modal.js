/**
 * Modal 弹窗组件
 * 支持确认/取消按钮、自定义内容
 */
class Modal {
  constructor() {
    this.overlay = null;
    this.modalElement = null;
    this.resolvePromise = null;
    this.rejectPromise = null;
  }

  /**
   * 创建遮罩层
   */
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    return overlay;
  }

  /**
   * 创建 Modal 内容
   * @param {Object} options - 配置选项
   */
  createModalContent(options) {
    const {
      title = '提示',
      content = '',
      confirmText = '确定',
      cancelText = '取消',
      showCancel = true,
      showClose = true,
      confirmColor = '#1890ff',
      cancelColor = '#666',
      width = '400px',
      onConfirm,
      onCancel,
      onClose
    } = options;

    const modal = document.createElement('div');
    modal.className = 'modal-container';
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      width: ${width};
      max-width: 90%;
      max-height: 80vh;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      transform: scale(0.9);
      transition: transform 0.3s ease;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    `;

    // 头部
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #f0f0f0;
    `;

    const titleElement = document.createElement('h3');
    titleElement.textContent = title;
    titleElement.style.cssText = `
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    `;

    header.appendChild(titleElement);

    // 关闭按钮
    if (showClose) {
      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '×';
      closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 24px;
        color: #999;
        cursor: pointer;
        padding: 0;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: all 0.2s;
      `;
      closeBtn.onmouseover = () => {
        closeBtn.style.background = '#f5f5f5';
        closeBtn.style.color = '#666';
      };
      closeBtn.onmouseout = () => {
        closeBtn.style.background = 'none';
        closeBtn.style.color = '#999';
      };
      closeBtn.onclick = () => {
        if (onClose) onClose();
        this.close(false);
      };
      header.appendChild(closeBtn);
    }

    modal.appendChild(header);

    // 内容区域
    const body = document.createElement('div');
    body.style.cssText = `
      padding: 20px;
      font-size: 14px;
      color: #666;
      line-height: 1.6;
      overflow-y: auto;
      flex: 1;
    `;

    if (typeof content === 'string') {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }

    modal.appendChild(body);

    // 底部按钮区域
    const footer = document.createElement('div');
    footer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid #f0f0f0;
    `;

    // 取消按钮
    if (showCancel) {
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = cancelText;
      cancelBtn.style.cssText = `
        padding: 8px 20px;
        border: 1px solid #d9d9d9;
        background: white;
        color: ${cancelColor};
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.2s;
      `;
      cancelBtn.onmouseover = () => {
        cancelBtn.style.borderColor = cancelColor;
        cancelBtn.style.color = cancelColor;
      };
      cancelBtn.onmouseout = () => {
        cancelBtn.style.borderColor = '#d9d9d9';
        cancelBtn.style.color = cancelColor;
      };
      cancelBtn.onclick = () => {
        if (onCancel) onCancel();
        this.close(false);
      };
      footer.appendChild(cancelBtn);
    }

    // 确认按钮
    const confirmBtn = document.createElement('button');
    confirmBtn.textContent = confirmText;
    confirmBtn.style.cssText = `
      padding: 8px 20px;
      border: none;
      background: ${confirmColor};
      color: white;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
    `;
    confirmBtn.onmouseover = () => {
      confirmBtn.style.opacity = '0.85';
    };
    confirmBtn.onmouseout = () => {
      confirmBtn.style.opacity = '1';
    };
    confirmBtn.onclick = () => {
      if (onConfirm) onConfirm();
      this.close(true);
    };
    footer.appendChild(confirmBtn);

    modal.appendChild(footer);

    return modal;
  }

  /**
   * 显示 Modal
   * @param {Object} options - 配置选项
   * @returns {Promise<boolean>} 点击确认返回 true，取消返回 false
   */
  show(options = {}) {
    if (typeof document === 'undefined') return Promise.resolve(false);

    // 关闭已存在的 Modal
    this.close(false);

    return new Promise((resolve, reject) => {
      this.resolvePromise = resolve;
      this.rejectPromise = reject;

      // 创建遮罩和 Modal
      this.overlay = this.createOverlay();
      this.modalElement = this.createModalContent(options);

      this.overlay.appendChild(this.modalElement);
      document.body.appendChild(this.overlay);

      // 点击遮罩关闭
      if (options.closeOnOverlay !== false) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) {
            if (options.onClose) options.onClose();
            this.close(false);
          }
        });
      }

      // ESC 键关闭
      const handleEsc = (e) => {
        if (e.key === 'Escape') {
          if (options.onClose) options.onClose();
          this.close(false);
          document.removeEventListener('keydown', handleEsc);
        }
      };
      document.addEventListener('keydown', handleEsc);
      this._handleEsc = handleEsc;

      // 显示动画
      requestAnimationFrame(() => {
        this.overlay.style.opacity = '1';
        this.modalElement.style.transform = 'scale(1)';
      });

      // 禁止背景滚动
      document.body.style.overflow = 'hidden';
    });
  }

  /**
   * 关闭 Modal
   * @param {boolean} result - 返回结果
   */
  close(result) {
    if (!this.overlay) return;

    // 移除 ESC 监听
    if (this._handleEsc) {
      document.removeEventListener('keydown', this._handleEsc);
      this._handleEsc = null;
    }

    // 关闭动画
    this.overlay.style.opacity = '0';
    if (this.modalElement) {
      this.modalElement.style.transform = 'scale(0.9)';
    }

    setTimeout(() => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
        this.modalElement = null;
      }
      // 恢复背景滚动
      document.body.style.overflow = '';

      // 解析 Promise
      if (this.resolvePromise) {
        this.resolvePromise(result);
        this.resolvePromise = null;
        this.rejectPromise = null;
      }
    }, 300);
  }

  /**
   * 显示确认对话框（便捷方法）
   * @param {string} content - 提示内容
   * @param {string} title - 标题
   * @returns {Promise<boolean>}
   */
  confirm(content, title = '确认') {
    return this.show({
      title,
      content,
      showCancel: true
    });
  }

  /**
   * 显示警告对话框（便捷方法）
   * @param {string} content - 提示内容
   * @param {string} title - 标题
   * @returns {Promise<boolean>}
   */
  alert(content, title = '提示') {
    return this.show({
      title,
      content,
      showCancel: false,
      confirmText: '知道了'
    });
  }

  /**
   * 显示成功对话框（便捷方法）
   * @param {string} content - 提示内容
   * @param {string} title - 标题
   * @returns {Promise<boolean>}
   */
  success(content, title = '成功') {
    return this.show({
      title,
      content: `<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:24px;color:#52c41a;">✓</span><span>${content}</span></div>`,
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#52c41a'
    });
  }

  /**
   * 显示错误对话框（便捷方法）
   * @param {string} content - 提示内容
   * @param {string} title - 标题
   * @returns {Promise<boolean>}
   */
  error(content, title = '错误') {
    return this.show({
      title,
      content: `<div style="display:flex;align-items:center;gap:10px;"><span style="font-size:24px;color:#ff4d4f;">✕</span><span>${content}</span></div>`,
      showCancel: false,
      confirmText: '确定',
      confirmColor: '#ff4d4f'
    });
  }
}

// 创建单例实例
const modal = new Modal();

/**
 * 显示 Modal 弹窗（便捷函数）
 * @param {Object} options - 配置选项
 * @returns {Promise<boolean>}
 */
function showModal(options = {}) {
  return modal.show(options);
}

/**
 * 显示确认对话框（便捷函数）
 * @param {string} content - 提示内容
 * @param {string} title - 标题
 * @returns {Promise<boolean>}
 */
function showConfirm(content, title = '确认') {
  return modal.confirm(content, title);
}

/**
 * 显示提示对话框（便捷函数）
 * @param {string} content - 提示内容
 * @param {string} title - 标题
 * @returns {Promise<boolean>}
 */
function showAlert(content, title = '提示') {
  return modal.alert(content, title);
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Modal, modal, showModal, showConfirm, showAlert };
}

if (typeof window !== 'undefined') {
  window.Modal = Modal;
  window.modal = modal;
  window.showModal = showModal;
  window.showConfirm = showConfirm;
  window.showAlert = showAlert;
}
