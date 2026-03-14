// 编辑学生页面
(function() {
  // 页面数据
  const data = {
    mode: 'add',
    studentId: '',
    form: {
      name: '',
      student_id: '',
      class_name: '',
      gender: '男',
      parent_phone: '',
      birth_date: '',
      address: '',
      avatar: '',
      remark: ''
    },
    classes: ['高一1班', '高一2班', '高一3班', '高一4班', '高一5班', '高一6班', '高一7班', '高一8班', '高一9班', '高一10班', '高二1班', '高二2班', '高二3班', '高二4班', '高二5班', '高二6班', '高二7班', '高二8班', '高二9班', '高二10班', '高三1班', '高三2班', '高三3班', '高三4班', '高三5班', '高三6班', '高三7班', '高三8班', '高三9班', '高三10班'],
    loading: false
  };

  // 模拟学生数据
  const mockStudents = {
    '1': { id: '1', name: '张三', student_id: '202401001', class_name: '高一1班', gender: '男', parent_phone: '13800138001', birth_date: '2008-01-15', address: '北京市海淀区', remark: '品学兼优', avatar: '' }
  };

  // 初始化页面
  function init() {
    // 获取URL参数
    const urlParams = new URLSearchParams(window.location.search);
    data.mode = urlParams.get('mode') || 'add';
    data.studentId = urlParams.get('id') || '';
    
    renderClassOptions();
    
    if (data.mode === 'edit' && data.studentId) {
      loadStudentData();
      document.getElementById('deleteBtn').style.display = 'block';
      document.title = '编辑学生';
    } else {
      document.title = '添加学生';
      document.getElementById('saveBtn').textContent = '添加学生';
    }
    
    bindEvents();
  }

  // 渲染班级选项
  function renderClassOptions() {
    const select = document.getElementById('classSelect');
    data.classes.forEach(className => {
      const option = document.createElement('option');
      option.value = className;
      option.textContent = className;
      select.appendChild(option);
    });
  }

  // 加载学生数据
  async function loadStudentData() {
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const student = mockStudents[data.studentId];
      if (student) {
        data.form = { ...student };
        fillForm();
      }
    } catch (err) {
      console.error('加载学生数据失败:', err);
      showToast('加载失败', 'error');
    }
  }

  // 填充表单
  function fillForm() {
    document.getElementById('nameInput').value = data.form.name;
    document.getElementById('studentIdInput').value = data.form.student_id;
    document.getElementById('classSelect').value = data.form.class_name;
    document.getElementById('genderSelect').value = data.form.gender;
    document.getElementById('birthDateInput').value = data.form.birth_date;
    document.getElementById('parentPhoneInput').value = data.form.parent_phone;
    document.getElementById('addressInput').value = data.form.address;
    document.getElementById('remarkInput').value = data.form.remark;
    document.getElementById('textareaCount').textContent = (data.form.remark?.length || 0) + '/200';
    
    // 头像
    if (data.form.avatar) {
      document.getElementById('avatarImage').src = data.form.avatar;
      document.getElementById('avatarImage').style.display = 'block';
      document.getElementById('avatarPlaceholder').style.display = 'none';
      document.getElementById('avatarEdit').style.display = 'flex';
    }
  }

  // 绑定事件
  function bindEvents() {
    // 头像上传
    document.getElementById('avatarUpload').addEventListener('click', function() {
      document.getElementById('avatarInput').click();
    });
    
    document.getElementById('avatarInput').addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          data.form.avatar = e.target.result;
          document.getElementById('avatarImage').src = e.target.result;
          document.getElementById('avatarImage').style.display = 'block';
          document.getElementById('avatarPlaceholder').style.display = 'none';
          document.getElementById('avatarEdit').style.display = 'flex';
        };
        reader.readAsDataURL(file);
      }
    });
    
    // 表单输入
    document.getElementById('nameInput').addEventListener('input', function(e) {
      data.form.name = e.target.value;
    });
    
    document.getElementById('studentIdInput').addEventListener('input', function(e) {
      data.form.student_id = e.target.value;
    });
    
    document.getElementById('classSelect').addEventListener('change', function(e) {
      data.form.class_name = e.target.value;
    });
    
    document.getElementById('genderSelect').addEventListener('change', function(e) {
      data.form.gender = e.target.value;
    });
    
    document.getElementById('birthDateInput').addEventListener('change', function(e) {
      data.form.birth_date = e.target.value;
    });
    
    document.getElementById('parentPhoneInput').addEventListener('input', function(e) {
      data.form.parent_phone = e.target.value;
    });
    
    document.getElementById('addressInput').addEventListener('input', function(e) {
      data.form.address = e.target.value;
    });
    
    document.getElementById('remarkInput').addEventListener('input', function(e) {
      data.form.remark = e.target.value;
      document.getElementById('textareaCount').textContent = e.target.value.length + '/200';
    });
    
    // 保存按钮
    document.getElementById('saveBtn').addEventListener('click', onSave);
    
    // 删除按钮
    document.getElementById('deleteBtn').addEventListener('click', onDelete);
  }

  // 验证表单
  function validateForm() {
    if (!data.form.name.trim()) {
      showToast('请输入姓名', 'error');
      return false;
    }
    
    if (!data.form.student_id.trim()) {
      showToast('请输入学号', 'error');
      return false;
    }
    
    if (!data.form.class_name) {
      showToast('请选择班级', 'error');
      return false;
    }
    
    return true;
  }

  // 保存
  async function onSave() {
    if (!validateForm()) return;
    
    data.loading = true;
    document.getElementById('saveBtn').disabled = true;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showToast(data.mode === 'add' ? '添加成功' : '保存成功', 'success');
      
      setTimeout(() => {
        history.back();
      }, 1500);
    } catch (err) {
      console.error('保存失败:', err);
      showToast('保存失败', 'error');
    } finally {
      data.loading = false;
      document.getElementById('saveBtn').disabled = false;
    }
  }

  // 删除
  async function onDelete() {
    if (!confirm('确定要删除该学生吗？此操作不可恢复。')) return;
    
    data.loading = true;
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      showToast('删除成功', 'success');
      
      setTimeout(() => {
        location.href = '../index/index.html';
      }, 1500);
    } catch (err) {
      console.error('删除失败:', err);
      showToast('删除失败', 'error');
    } finally {
      data.loading = false;
    }
  }

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
