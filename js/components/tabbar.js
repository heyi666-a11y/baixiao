/**
 * 底部导航栏组件
 * 模拟小程序的 tabBar 功能
 */

// TabBar 配置 - 与小程序 app.json 中的 tabBar 保持一致
const TABBAR_CONFIG = {
  color: '#999999',
  selectedColor: '#667eea',
  backgroundColor: '#ffffff',
  borderStyle: 'black',
  list: [
    {
      pagePath: 'pages/index/index.html',
      text: '首页',
      iconPath: 'images/tabbar/home.png',
      selectedIconPath: 'images/tabbar/home-active.png'
    },
    {
      pagePath: 'pages/shared-resources/index/index.html',
      text: '资源',
      iconPath: 'images/tabbar/resource.png',
      selectedIconPath: 'images/tabbar/resource-active.png'
    },
    {
      pagePath: 'pages/join-us/join-us.html',
      text: '加入我们',
      iconPath: 'images/tabbar/join.png',
      selectedIconPath: 'images/tabbar/join-active.png'
    }
  ]
};

/**
 * 获取当前页面相对于网站根目录的路径
 * @returns {string} 相对路径，如 'pages/index/index.html'
 */
function getCurrentPagePath() {
  const path = window.location.pathname;
  console.log('当前路径:', path);
  
  // 处理不同的路径格式
  if (path.includes('pages/')) {
    // 提取 pages/ 开始的部分
    const pagesIndex = path.indexOf('pages/');
    return path.substring(pagesIndex);
  } else if (path.endsWith('index.html') && path.includes('wangye')) {
    // 处理根目录的 index.html
    return 'pages/index/index.html';
  }

  // 默认返回首页
  return 'pages/index/index.html';
}

/**
 * 计算从当前页面到目标页面的相对路径
 * @param {string} targetPath - 目标页面路径 (如 'pages/index/index.html')
 * @param {string} currentPath - 当前页面路径 (如 'pages/shared-resources/index/index.html')
 * @returns {string} 相对路径
 */
function getRelativePath(targetPath, currentPath) {
  // 分割路径
  const targetParts = targetPath.split('/');
  const currentParts = currentPath.split('/');

  // 找到共同前缀的长度
  let commonLength = 0;
  for (let i = 0; i < Math.min(targetParts.length - 1, currentParts.length - 1); i++) {
    if (targetParts[i] === currentParts[i]) {
      commonLength++;
    } else {
      break;
    }
  }

  // 计算需要回退的层数
  const backCount = currentParts.length - 1 - commonLength;

  // 构建相对路径
  let relativePath = '';
  for (let i = 0; i < backCount; i++) {
    relativePath += '../';
  }

  // 添加目标路径的剩余部分
  for (let i = commonLength; i < targetParts.length; i++) {
    relativePath += targetParts[i];
    if (i < targetParts.length - 1) {
      relativePath += '/';
    }
  }

  return relativePath || './';
}

/**
 * 计算从当前页面到图片的相对路径
 * @param {string} imagePath - 图片路径 (如 'images/tabbar/home.png')
 * @param {string} currentPath - 当前页面路径
 * @returns {string} 相对路径
 */
function getImageRelativePath(imagePath, currentPath) {
  const currentParts = currentPath.split('/');
  // 当前页面深度（减去文件名）
  const depth = currentParts.length - 1;

  // 根据深度添加 ../
  let prefix = '';
  for (let i = 0; i < depth; i++) {
    prefix += '../';
  }

  return prefix + imagePath;
}

/**
 * 创建 TabBar HTML
 * @param {string} currentPage - 当前页面路径，用于高亮当前 tab
 * @returns {string} TabBar HTML 字符串
 */
function createTabBarHTML(currentPage) {
  const items = TABBAR_CONFIG.list.map(item => {
    // 判断当前页面是否匹配这个 tab
    const isActive = currentPage.includes(item.pagePath.replace('.html', '')) ||
                    (currentPage === '' && item.pagePath.includes('index/index')) ||
                    (currentPage === 'index.html' && item.pagePath.includes('index/index'));

    // 计算图片和链接的正确路径
    const iconSrc = getImageRelativePath(
      isActive ? item.selectedIconPath : item.iconPath,
      currentPage
    );
    const linkPath = getRelativePath(item.pagePath, currentPage);

    const textColor = isActive ? TABBAR_CONFIG.selectedColor : TABBAR_CONFIG.color;
    const activeClass = isActive ? 'active' : '';

    return `
      <a href="${linkPath}" class="tabbar-item ${activeClass}" data-page="${item.pagePath}">
        <img src="${iconSrc}" class="tabbar-icon" alt="${item.text}">
        <span class="tabbar-text" style="color: ${textColor}">${item.text}</span>
      </a>
    `;
  }).join('');

  return `<nav class="tabbar">${items}</nav>`;
}

/**
 * 初始化 TabBar
 * @param {string} containerSelector - 容器选择器，默认为 'body'
 * @param {string} currentPage - 当前页面路径（可选，自动检测）
 */
function initTabBar(containerSelector = 'body', currentPage = '') {
  // 如果没有提供当前页面路径，自动检测
  if (!currentPage) {
    currentPage = getCurrentPagePath();
  }

  // 创建 TabBar HTML
  const tabBarHTML = createTabBarHTML(currentPage);

  // 插入到页面
  const container = document.querySelector(containerSelector);
  if (container) {
    // 检查是否已存在 tabbar
    const existingTabBar = container.querySelector('.tabbar');
    if (existingTabBar) {
      existingTabBar.remove();
    }

    // 插入 TabBar
    container.insertAdjacentHTML('beforeend', tabBarHTML);
  }
}

/**
 * 切换 Tab
 * @param {number} index - Tab 索引
 */
function tabBarSwitchTab(index) {
  if (index >= 0 && index < TABBAR_CONFIG.list.length) {
    const currentPage = getCurrentPagePath();
    const targetPath = TABBAR_CONFIG.list[index].pagePath;
    const relativePath = getRelativePath(targetPath, currentPage);
    window.location.href = relativePath;
  }
}

/**
 * 获取当前激活的 Tab 索引
 * @param {string} currentPage - 当前页面路径
 * @returns {number} 当前激活的 Tab 索引，如果没有匹配返回 -1
 */
function getActiveTabIndex(currentPage) {
  if (!currentPage) {
    currentPage = getCurrentPagePath();
  }

  return TABBAR_CONFIG.list.findIndex(item =>
    currentPage.includes(item.pagePath.replace('.html', '')) ||
    (currentPage === '' && item.pagePath.includes('index/index')) ||
    (currentPage === 'index.html' && item.pagePath.includes('index/index'))
  );
}

// 导出到全局
window.TabBar = {
  config: TABBAR_CONFIG,
  init: initTabBar,
  switchTab: tabBarSwitchTab,
  getActiveIndex: getActiveTabIndex,
  createHTML: createTabBarHTML,
  getCurrentPage: getCurrentPagePath,
  getRelativePath: getRelativePath
};

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', function() {
  // 立即执行，确保导航栏加载
  console.log('初始化 TabBar...');
  initTabBar('body');
});
