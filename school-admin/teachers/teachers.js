const supabaseAPI = require('../../../utils/supabaseAPI');

Page({
  data: {
    teachers: [],
    showModal: false,
    showDeleteModal: false,
    isEdit: false,
    editId: null,
    deleteId: null,
    deleteTeacherName: '',
    titleOptions: ['高级教师', '一级教师', '二级教师', '三级教师', '特级教师'],
    titleIndex: 0,
    formData: {
      name: '',
      gender: '男',
      subject: '',
      title: '',
      phone: '',
      email: '',
      department: ''
    }
  },

  onLoad() {
    this.loadTeachers();
  },

  onShow() {
    this.loadTeachers();
  },

  // 从Supabase加载教师列表
  async loadTeachers() {
    wx.showLoading({ title: '加载中...' });
    try {
      const result = await supabaseAPI.getTeachers();
      if (result.error) {
        throw new Error(result.error.message || '加载失败');
      }
      this.setData({ teachers: result.data || [] });
    } catch (err) {
      console.error('加载教师列表失败:', err);
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      editId: null,
      titleIndex: 0,
      formData: {
        name: '',
        gender: '男',
        subject: '',
        title: '',
        phone: '',
        email: '',
        department: ''
      }
    });
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const id = e.currentTarget.dataset.id;
    const teacher = this.data.teachers.find(t => t.id === id);
    
    if (!teacher) {
      wx.showToast({
        title: '教师不存在',
        icon: 'none'
      });
      return;
    }

    const titleIndex = this.data.titleOptions.indexOf(teacher.title);
    
    this.setData({
      showModal: true,
      isEdit: true,
      editId: id,
      titleIndex: titleIndex >= 0 ? titleIndex : 0,
      formData: {
        name: teacher.name,
        gender: teacher.gender,
        subject: teacher.subject,
        title: teacher.title,
        phone: teacher.phone,
        email: teacher.email,
        department: teacher.department
      }
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    });
  },

  // 显示删除确认弹窗
  showDeleteConfirm(e) {
    const id = e.currentTarget.dataset.id;
    const name = e.currentTarget.dataset.name;
    
    this.setData({
      showDeleteModal: true,
      deleteId: id,
      deleteTeacherName: name
    });
  },

  // 隐藏删除确认弹窗
  hideDeleteModal() {
    this.setData({
      showDeleteModal: false,
      deleteId: null,
      deleteTeacherName: ''
    });
  },

  // 保存教师（添加或编辑）
  async saveTeacher() {
    const { formData, isEdit, editId } = this.data;
    
    // 表单验证
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入教师姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.subject.trim()) {
      wx.showToast({
        title: '请输入教学科目',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.title) {
      wx.showToast({
        title: '请选择职称',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.phone.trim()) {
      wx.showToast({
        title: '请输入联系电话',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '保存中...' });

    try {
      if (isEdit) {
        // 编辑模式 - 更新Supabase
        const result = await supabaseAPI.updateTeacher(editId, {
          name: formData.name,
          gender: formData.gender,
          subject: formData.subject,
          title: formData.title,
          phone: formData.phone,
          email: formData.email,
          department: formData.department
        });
        
        if (result.error) {
          throw new Error(result.error.message || '修改失败');
        }
        
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        });
      } else {
        // 添加模式 - 插入Supabase
        const newTeacher = {
          teacher_id: 'T' + new Date().getFullYear() + String(Math.floor(Math.random() * 1000)).padStart(3, '0'),
          name: formData.name,
          gender: formData.gender,
          subject: formData.subject,
          title: formData.title,
          phone: formData.phone,
          email: formData.email,
          department: formData.department,
          hire_date: new Date().toISOString().split('T')[0],
          status: '在职'
        };
        
        const result = await supabaseAPI.createTeacher(newTeacher);
        
        if (result.error) {
          throw new Error(result.error.message || '添加失败');
        }
        
        wx.showToast({
          title: '添加成功',
          icon: 'success'
        });
      }
      
      // 重新加载列表
      await this.loadTeachers();
      this.setData({ showModal: false });
    } catch (err) {
      console.error('保存教师失败:', err);
      wx.showToast({
        title: err.message || '保存失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 删除教师
  async deleteTeacher() {
    const { deleteId } = this.data;
    
    if (!deleteId) return;
    
    wx.showLoading({ title: '删除中...' });
    
    try {
      const result = await supabaseAPI.deleteTeacher(deleteId);
      
      if (result.error) {
        throw new Error(result.error.message || '删除失败');
      }
      
      await this.loadTeachers();
      
      this.setData({
        showDeleteModal: false,
        deleteId: null,
        deleteTeacherName: ''
      });
      
      wx.showToast({
        title: '删除成功',
        icon: 'success'
      });
    } catch (err) {
      console.error('删除教师失败:', err);
      wx.showToast({
        title: err.message || '删除失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 表单输入处理
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    });
  },

  onGenderChange(e) {
    this.setData({
      'formData.gender': e.detail.value
    });
  },

  onSubjectInput(e) {
    this.setData({
      'formData.subject': e.detail.value
    });
  },

  onTitleChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      titleIndex: index,
      'formData.title': this.data.titleOptions[index]
    });
  },

  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    });
  },

  onEmailInput(e) {
    this.setData({
      'formData.email': e.detail.value
    });
  },

  onDepartmentInput(e) {
    this.setData({
      'formData.department': e.detail.value
    });
  }
});
