// 教师详情页面
let teacherId = null;
let teacher = null;

// 页面加载
window.onload = function() {
  // 从URL获取教师ID
  const urlParams = new URLSearchParams(window.location.search);
  teacherId = urlParams.get('id');
  
  if (!teacherId) {
    showError();
    return;
  }
  
  loadTeacherDetail();
};

// 加载教师详情
function loadTeacherDetail() {
  const stored = localStorage.getItem('teachers');
  if (stored) {
    const teachers = JSON.parse(stored);
    teacher = teachers.find(t => t.id === teacherId);
  }
  
  if (!teacher) {
    showError();
    return;
  }
  
  renderTeacherDetail();
}

// 渲染教师详情
function renderTeacherDetail() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('teacherCard').style.display = 'block';
  
  // 设置头像文字
  document.getElementById('avatarText').textContent = teacher.name.charAt(0);
  
  // 基本信息
  document.getElementById('teacherName').textContent = teacher.name;
  document.getElementById('teacherTitle').textContent = teacher.title;
  document.getElementById('teacherId').textContent = teacher.teacher_id || teacher.id;
  document.getElementById('teacherGender').textContent = teacher.gender;
  document.getElementById('teacherSubject').textContent = teacher.subject;
  document.getElementById('teacherDept').textContent = teacher.department;
  document.getElementById('teacherPhone').textContent = teacher.phone;
  document.getElementById('teacherEmail').textContent = teacher.email || '未设置';
  document.getElementById('hireDate').textContent = teacher.hire_date || '未设置';
  document.getElementById('teacherStatus').textContent = teacher.status || '在职';
}

// 显示错误
function showError() {
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('teacherCard').style.display = 'none';
  document.getElementById('errorState').style.display = 'flex';
}

// 返回列表
function goBack() {
  location.href = '../index/index.html';
}

// 去编辑页面
function goToEdit() {
  location.href = '../edit/edit.html?id=' + teacherId;
}

// 查看课表
function viewSchedule() {
  location.href = '../schedule/schedule.html?teacherId=' + teacherId;
}

// 查看考勤
function viewAttendance() {
  location.href = '../attendance/attendance.html?teacherId=' + teacherId;
}

// 拨打电话
function makeCall() {
  if (teacher && teacher.phone) {
    window.location.href = 'tel:' + teacher.phone;
  } else {
    alert('电话号码不存在');
  }
}

// 发送邮件
function sendEmail() {
  if (teacher && teacher.email) {
    window.location.href = 'mailto:' + teacher.email;
  } else {
    alert('邮箱地址不存在');
  }
}
