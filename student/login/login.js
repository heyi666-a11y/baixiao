// 学生登录页面
(function() {
  const data = {
    studentId: '',
    studentName: '',
    loading: false
  };

  function init() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    data.studentId = urlParams.get('studentId') || '';
    data.studentName = urlParams.get('studentName') || '';
    
    // 如果有学号，自动填充
    if (data.studentId) {
      document.getElementById('studentIdInput').value = data.studentId;
    }
    
    // 检查是否记住密码
    checkRememberedCredentials();
    
    bindEvents();
  }

  function checkRememberedCredentials() {
    const remembered = localStorage.getItem('rememberedStudent');
    if (remembered) {
      try {
        const creds = JSON.parse(remembered);
        document.getElementById('studentIdInput').value = creds.studentId || '';
        document.getElementById('passwordInput').value = creds.password || '';
        document.getElementById('rememberMe').checked = true;
      } catch (e) {
        console.error('解析记住的凭据失败:', e);
      }
    }
  }

  function bindEvents() {
    // 登录按钮
    document.getElementById('loginBtn').addEventListener('click', onLogin);
    
    // 回车登录
    document.getElementById('passwordInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        onLogin();
      }
    });
    
    // 切换密码显示
    document.getElementById('togglePassword').addEventListener('click', function() {
      const input = document.getElementById('passwordInput');
      const type = input.type === 'password' ? 'text' : 'password';
      input.type = type;
      this.textContent = type === 'password' ? '👁️' : '🙈';
    });
    
    // 忘记密码
    document.getElementById('forgotPassword').addEventListener('click', function(e) {
      e.preventDefault();
      showToast('请联系班主任重置密码', 'info');
    });
    
    // 微信登录
    document.getElementById('wechatLogin').addEventListener('click', function() {
      showToast('微信登录功能开发中', 'info');
    });
    
    // 手机登录
    document.getElementById('phoneLogin').addEventListener('click', function() {
      showToast('手机登录功能开发中', 'info');
    });
  }

  async function onLogin() {
    const studentId = document.getElementById('studentIdInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!studentId) {
      showToast('请输入学号', 'error');
      return;
    }
    
    if (!password) {
      showToast('请输入密码', 'error');
      return;
    }
    
    data.loading = true;
    document.getElementById('loginBtn').disabled = true;
    document.getElementById('loginBtn').textContent = '登录中...';
    
    try {
      // 模拟登录API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟验证
      if (password.length < 6) {
        throw new Error('密码错误');
      }
      
      // 保存登录状态
      const userInfo = {
        studentId: studentId,
        name: data.studentName || '学生' + studentId,
        role: 'student',
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      localStorage.setItem('token', 'mock_token_' + Date.now());
      
      // 记住密码
      if (rememberMe) {
        localStorage.setItem('rememberedStudent', JSON.stringify({
          studentId: studentId,
          password: password
        }));
      } else {
        localStorage.removeItem('rememberedStudent');
      }
      
      showToast('登录成功', 'success');
      
      // 跳转到详情页
      setTimeout(() => {
        location.href = `../detail/detail.html?id=${studentId}`;
      }, 1000);
      
    } catch (err) {
      console.error('登录失败:', err);
      showToast(err.message || '登录失败', 'error');
    } finally {
      data.loading = false;
      document.getElementById('loginBtn').disabled = false;
      document.getElementById('loginBtn').textContent = '登 录';
    }
  }

  function showToast(message, type = 'info') {
    if (window.utils && window.utils.showToast) {
      window.utils.showToast(message, type);
    } else {
      alert(message);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
