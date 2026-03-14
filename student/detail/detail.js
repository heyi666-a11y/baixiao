// 学生详情页面
(function() {
  // 页面数据
  const data = {
    studentId: '',
    student: null,
    loading: true,
    isAdmin: false
  };

  // 模拟学生数据
  const mockStudents = {
    '1': { id: '1', name: '张三', student_id: '202401001', class_name: '高一1班', gender: '男', parent_phone: '13800138001', birth_date: '2008-01-15', enrollment_date: '2024-09-01', address: '北京市海淀区', remark: '品学兼优', avatar: '' },
    '2': { id: '2', name: '李四', student_id: '202401002', class_name: '高一1班', gender: '女', parent_phone: '13800138002', birth_date: '2008-03-20', enrollment_date: '2024-09-01', address: '北京市朝阳区', remark: '学习认真', avatar: '' },
    '3': { id: '3', name: '王五', student_id: '202401003', class_name: '高一2班', gender: '男', parent_phone: '13800138003', birth_date: '2007-11-08', enrollment_date: '2024-09-01', address: '北京市东城区', remark: '', avatar: '' }
  };

  // 初始化页面
  function init() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    data.studentId = urlParams.get('id');
    
    if (!data.studentId) {
      showToast('学生ID不存在', 'error');
      setTimeout(() => {
        history.back();
      }, 1500);
      return;
    }
    
    checkAdminRole();
    loadStudentDetail();
  }

  // 检查管理员角色
  function checkAdminRole() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    data.isAdmin = userInfo.role === 'admin';
    const editBtn = document.getElementById('editBtn');
    if (editBtn) {
      editBtn.style.display = data.isAdmin ? 'block' : 'none';
    }
  }

  // 加载学生详情
  async function loadStudentDetail() {
    data.loading = true;
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('studentContent').style.display = 'none';
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const student = mockStudents[data.studentId];
      
      if (student) {
        data.student = student;
        renderStudentInfo();
      } else {
        throw new Error('学生不存在');
      }
    } catch (err) {
      console.error('加载学生详情失败:', err);
      showToast(err.message || '加载失败', 'error');
    } finally {
      data.loading = false;
      document.getElementById('loadingState').style.display = 'none';
      document.getElementById('studentContent').style.display = 'block';
    }
  }

  // 渲染学生信息
  function renderStudentInfo() {
    const student = data.student;
    if (!student) return;
    
    // 头像
    const avatarImg = document.getElementById('studentAvatar');
    const avatarPlaceholder = document.getElementById('avatarPlaceholder');
    const avatarText = document.getElementById('avatarText');
    
    if (student.avatar) {
      avatarImg.src = student.avatar;
      avatarImg.style.display = 'block';
      avatarPlaceholder.style.display = 'none';
    } else {
      avatarImg.style.display = 'none';
      avatarPlaceholder.style.display = 'flex';
      avatarText.textContent = student.name ? student.name[0] : '学';
    }
    
    // 性别
    const genderBadge = document.getElementById('genderBadge');
    const genderText = document.getElementById('genderText');
    genderText.textContent = student.gender || '未知';
    genderBadge.className = 'gender-badge ' + (student.gender === '女' ? 'female' : 'male');
    
    // 基本信息
    document.getElementById('studentName').textContent = student.name || '未知姓名';
    document.getElementById('studentClass').textContent = student.class_name || '-';
    document.getElementById('studentId').textContent = '学号: ' + (student.student_id || '-');
    
    // 联系方式
    const contactSection = document.getElementById('contactSection');
    if (student.parent_phone) {
      contactSection.style.display = 'block';
      document.getElementById('parentPhone').textContent = student.parent_phone;
    } else {
      contactSection.style.display = 'none';
    }
    
    // 更多信息
    document.getElementById('enrollmentDate').textContent = student.enrollment_date || '-';
    document.getElementById('birthDate').textContent = student.birth_date || '-';
    document.getElementById('address').textContent = student.address || '-';
    document.getElementById('remark').textContent = student.remark || '-';
  }

  // 页面跳转函数
  window.navigateTo = function(page) {
    const urls = {
      'grades': `../grades/grades.html?id=${data.studentId}`,
      'schedule': `../schedule/schedule.html?id=${data.studentId}`,
      'attendance': `../attendance/attendance.html?id=${data.studentId}`,
      'rewards': `../rewards/rewards.html?id=${data.studentId}`,
      'portfolio': `../portfolio/portfolio.html?id=${data.studentId}`,
      'leave': `../leave/leave.html?studentId=${data.studentId}&studentName=${encodeURIComponent(data.student?.name || '')}`,
      'ai-report': `../ai-report/ai-report.html?id=${data.studentId}`
    };
    
    if (urls[page]) {
      location.href = urls[page];
    }
  };

  // 编辑学生
  document.getElementById('editBtn')?.addEventListener('click', function() {
    location.href = `../edit/edit.html?mode=edit&id=${data.studentId}`;
  });

  // 拨打电话
  document.getElementById('phoneCall')?.addEventListener('click', function() {
    const phone = data.student?.parent_phone;
    if (phone) {
      window.location.href = `tel:${phone}`;
    } else {
      showToast('暂无联系电话', 'error');
    }
  });

  // 显示提示
  function showToast(message, type = 'info') {
    if (window.utils && window.utils.showToast) {
      window.utils.showToast(message, type);
    } else {
      alert(message);
    }
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);
})();
