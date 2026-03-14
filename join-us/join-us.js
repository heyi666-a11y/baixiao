// 加入我们页面
(function() {
  function init() {
    console.log('加入我们页面加载');
  }

  // 复制电话号码
  window.copyPhone = function() {
    const phone = '19388112925';
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(phone).then(function() {
        if (window.showToast) {
          window.showToast('电话已复制');
        } else {
          alert('电话已复制');
        }
      }).catch(function(err) {
        console.error('复制失败:', err);
        fallbackCopy(phone);
      });
    } else {
      fallbackCopy(phone);
    }
  };

  function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
      document.execCommand('copy');
      if (window.showToast) {
        window.showToast('电话已复制');
      } else {
        alert('电话已复制');
      }
    } catch (err) {
      console.error('复制失败:', err);
    }
    
    document.body.removeChild(textarea);
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
