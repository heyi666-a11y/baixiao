// 系统配置
const systems = {
  canteen: {
    name: '饭堂预点餐系统',
    url: '',
    status: 'developing'
  },
  finance: {
    name: '财务系统',
    url: '/pages/finance/login/login.html',
    status: 'available'
  },
  teacher: {
    name: '教师系统',
    url: '',
    status: 'developing'
  },
  student: {
    name: '学生系统',
    url: '',
    status: 'developing'
  },
  library: {
    name: '图书馆系统',
    url: '/pages/library/entry/entry.html',
    status: 'available'
  }
};

// 页面加载
window.onload = function() {
  console.log('Systems page loaded');
};

// 显示提示信息
function showToast(message, duration = 2000) {
  // 创建提示元素
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    white-space: nowrap;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);

  // 自动移除
  setTimeout(() => {
    toast.remove();
  }, duration);
}

// 系统点击事件
function onSystemTap(id) {
  const system = systems[id];

  if (!system) {
    showToast('系统不存在');
    return;
  }

  // 如果系统可用且有URL，则跳转
  if (system.status === 'available' && system.url) {
    window.location.href = system.url;
  } else {
    // 系统开发中
    showToast(`${system.name}开发中`, 2000);
  }
}
