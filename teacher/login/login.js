// 教师登录页面

// 页面加载
window.onload = function() {
  // 检查是否已登录
  const teacherToken = localStorage.getItem('teacherToken');
  if (teacherToken) {
    // 已登录，跳转到首页
    location.href = '../index/index.html';
  }
  
  // 绑定回车事件
  document.getElementById('password').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      onLogin();
    }
  });
};

// 登录
function onLogin() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  
  // 表单验证
  if (!username) {
    alert('请输入教师工号');
    return;
  }
  
  if (!password) {
    alert('请输入密码');
    return;
  }
  
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.classList.add('loading');
  loginBtn.innerHTML = '<span>登录中...</span>';
  
  // 模拟登录验证
  setTimeout(() => {
    // 加载教师列表
    const stored = localStorage.getItem('teachers');
    let teachers = [];
    if (stored) {
      teachers = JSON.parse(stored);
    }
    
    // 查找教师
    const teacher = teachers.find(t => t.teacher_id === username);
    
    if (teacher && password === '123456') {
      // 登录成功
      localStorage.setItem('teacherToken', 'teacher_token_' + Date.now());
      localStorage.setItem('currentTeacher', JSON.stringify(teacher));
      
      alert('登录成功');
      location.href = '../index/index.html';
    } else if (username === 'admin' && password === 'admin123') {
      // 管理员登录
      localStorage.setItem('teacherToken', 'admin_token_' + Date.now());
      localStorage.setItem('isAdmin', 'true');
      
      alert('管理员登录成功');
      location.href = '../index/index.html';
    } else {
      // 登录失败
      alert('工号或密码错误');
      loginBtn.classList.remove('loading');
      loginBtn.innerHTML = '<span>登 录</span>';
    }
  }, 500);
}
