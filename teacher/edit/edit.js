// 编辑教师页面
let teacherId = null;
let isCreate = false;
let teachers = [];

// 页面加载
window.onload = function() {
  // 从URL获取教师ID
  const urlParams = new URLSearchParams(window.location.search);
  teacherId = urlParams.get('id');
  
  // 加载教师列表
  const stored = localStorage.getItem('teachers');
  if (stored) {
    teachers = JSON.parse(stored);
  }
  
  if (teacherId) {
    // 编辑模式
    isCreate = false;
    document.getElementById('pageTitle').textContent = '编辑教师';
    loadTeacherData();
  } else {
    // 创建模式
    isCreate = true;
    document.getElementById('pageTitle').textContent = '添加教师';
    document.getElementById('createSection').style.display = 'block';
    // 生成工号
    document.getElementById('teacherIdInput').value = 'T' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  }
};

// 加载教师数据
function loadTeacherData() {
  const teacher = teachers.find(t => t.id === teacherId);
  if (!teacher) {
    alert('教师不存在');
    goBack();
    return;
  }
  
  // 填充表单
  document.getElementById('nameInput').value = teacher.name;
  document.getElementById('genderMale').checked = teacher.gender === '男';
  document.getElementById('genderFemale').checked = teacher.gender === '女';
  document.getElementById('teacherIdInput').value = teacher.teacher_id || teacher.id;
  document.getElementById('subjectInput').value = teacher.subject;
  document.getElementById('titleSelect').value = teacher.title;
  document.getElementById('departmentInput').value = teacher.department;
  document.getElementById('hireDateInput').value = teacher.hire_date || '';
  document.getElementById('statusSelect').value = teacher.status || '在职';
  document.getElementById('phoneInput').value = teacher.phone;
  document.getElementById('emailInput').value = teacher.email || '';
}

// 保存教师
function saveTeacher() {
  const name = document.getElementById('nameInput').value.trim();
  const gender = document.querySelector('input[name="gender"]:checked').value;
  const subject = document.getElementById('subjectInput').value.trim();
  const title = document.getElementById('titleSelect').value;
  const department = document.getElementById('departmentInput').value.trim();
  const hireDate = document.getElementById('hireDateInput').value;
  const status = document.getElementById('statusSelect').value;
  const phone = document.getElementById('phoneInput').value.trim();
  const email = document.getElementById('emailInput').value.trim();
  
  // 表单验证
  if (!name) {
    alert('请输入教师姓名');
    return;
  }
  
  if (!subject) {
    alert('请输入教学科目');
    return;
  }
  
  if (!title) {
    alert('请选择职称');
    return;
  }
  
  if (!department) {
    alert('请输入所属部门');
    return;
  }
  
  if (!phone) {
    alert('请输入联系电话');
    return;
  }
  
  if (isCreate) {
    // 创建新教师
    const newTeacher = {
      id: Date.now().toString(),
      teacher_id: document.getElementById('teacherIdInput').value,
      name,
      gender,
      subject,
      title,
      phone,
      email,
      department,
      hire_date: hireDate || new Date().toISOString().split('T')[0],
      status
    };
    teachers.push(newTeacher);
    alert('添加成功');
  } else {
    // 更新教师
    const index = teachers.findIndex(t => t.id === teacherId);
    if (index !== -1) {
      teachers[index] = {
        ...teachers[index],
        name,
        gender,
        subject,
        title,
        phone,
        email,
        department,
        hire_date: hireDate || teachers[index].hire_date,
        status
      };
    }
    alert('修改成功');
  }
  
  // 保存到本地存储
  localStorage.setItem('teachers', JSON.stringify(teachers));
  
  // 返回详情页或列表页
  if (isCreate) {
    location.href = '../index/index.html';
  } else {
    location.href = '../detail/detail.html?id=' + teacherId;
  }
}

// 返回
function goBack() {
  if (isCreate) {
    location.href = '../index/index.html';
  } else {
    location.href = '../detail/detail.html?id=' + teacherId;
  }
}
