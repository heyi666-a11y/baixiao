// 登录页面
(function() {
  // 页面数据
  let password = '';
  let showError = false;
  let errorMsg = '';

  // 密码输入
  window.onPasswordInput = function(value) {
    password = value;
    showError = false;
    updateErrorDisplay();
  };

  // 登录
  window.onLogin = function() {
    if (!password) {
      showError = true;
      errorMsg = '请输入密码';
      updateErrorDisplay();
      return;
    }

    if (password === '888888') {
      localStorage.setItem('finance_auth', 'true');
      location.href = 'index.html';
    } else {
      showError = true;
      errorMsg = '密码错误，请重试';
      updateErrorDisplay();
    }
  };

  // 更新错误显示
  function updateErrorDisplay() {
    const errorEl = document.getElementById('errorMessage');
    if (showError) {
      errorEl.textContent = errorMsg;
      errorEl.style.display = 'block';
    } else {
      errorEl.style.display = 'none';
    }
  }
})();
