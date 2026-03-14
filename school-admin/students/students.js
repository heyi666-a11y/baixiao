// 学生管理页面
const adminAPI = require('../../../utils/adminAPI.js');

Page({
  data: {
    students: [],
    filteredStudents: [],
    searchKeyword: '',
    loading: false,
    showModal: false,
    isEdit: false,
    currentStudentId: null,
    formData: {
      name: '',
      student_id: '',
      class_name: '',
      gender: '男',
      phone: '',
      email: '',
      address: '',
      birthday: '',
      enrollment_date: '',
      status: '在读'
    }
  },

  onLoad() {
    this.loadStudents();
  },

  onShow() {
    this.loadStudents();
  },

  // 加载学生数据
  async loadStudents() {
    this.setData({ loading: true });
    
    try {
      const { data, error } = await adminAPI.student.getStudents();
      
      if (error) {
        throw new Error(error);
      }
      
      this.setData({
        students: data || [],
        filteredStudents: data || [],
        loading: false
      });
    } catch (err) {
      console.error('加载学生数据失败:', err);
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({ searchKeyword: keyword });
    this.filterStudents(keyword);
  },

  // 筛选学生
  filterStudents(keyword) {
    const { students } = this.data;
    
    if (!keyword.trim()) {
      this.setData({ filteredStudents: students });
      return;
    }
    
    const lowerKeyword = keyword.toLowerCase();
    const filtered = students.filter(student => 
      (student.name && student.name.toLowerCase().includes(lowerKeyword)) ||
      (student.student_id && student.student_id.toLowerCase().includes(lowerKeyword)) ||
      (student.class_name && student.class_name.toLowerCase().includes(lowerKeyword))
    );
    
    this.setData({ filteredStudents: filtered });
  },

  // 显示添加弹窗
  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      currentStudentId: null,
      formData: {
        name: '',
        student_id: '',
        class_name: '',
        gender: '男',
        phone: '',
        email: '',
        address: '',
        birthday: '',
        enrollment_date: '',
        status: '在读'
      }
    });
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const id = e.currentTarget.dataset.id;
    const student = this.data.students.find(s => s.id === id);
    
    if (!student) return;
    
    this.setData({
      showModal: true,
      isEdit: true,
      currentStudentId: id,
      formData: {
        name: student.name || '',
        student_id: student.student_id || '',
        class_name: student.class_name || '',
        gender: student.gender || '男',
        phone: student.phone || '',
        email: student.email || '',
        address: student.address || '',
        birthday: student.birthday || '',
        enrollment_date: student.enrollment_date || '',
        status: student.status || '在读'
      }
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({ showModal: false });
  },

  // 阻止冒泡
  preventBubble() {},

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`formData.${field}`]: value });
  },

  // 性别选择
  onGenderChange(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({ 'formData.gender': gender });
  },

  // 日期选择
  onDateChange(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    this.setData({ [`formData.${field}`]: value });
  },

  // 保存学生
  async saveStudent() {
    const { formData, isEdit, currentStudentId } = this.data;
    
    // 表单验证
    if (!formData.name.trim()) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!formData.student_id.trim()) {
      wx.showToast({ title: '请输入学号', icon: 'none' });
      return;
    }
    if (!formData.class_name.trim()) {
      wx.showToast({ title: '请输入班级', icon: 'none' });
      return;
    }
    
    try {
      let result;
      if (isEdit) {
        result = await adminAPI.student.updateStudent(currentStudentId, formData);
      } else {
        result = await adminAPI.student.addStudent(formData);
      }
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      wx.showToast({
        title: isEdit ? '修改成功' : '添加成功',
        icon: 'success'
      });
      
      this.hideModal();
      this.loadStudents();
    } catch (err) {
      wx.showToast({
        title: err.message || '操作失败',
        icon: 'none'
      });
    }
  },

  // 删除学生
  async deleteStudent(e) {
    const id = e.currentTarget.dataset.id;
    const student = this.data.students.find(s => s.id === id);
    
    if (!student) return;
    
    const res = await wx.showModal({
      title: '确认删除',
      content: `确定要删除学生 "${student.name}" 吗？`,
      confirmColor: '#ff4d4f'
    });
    
    if (res.confirm) {
      try {
        const result = await adminAPI.student.deleteStudent(id);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        });
        
        this.loadStudents();
      } catch (err) {
        wx.showToast({
          title: err.message || '删除失败',
          icon: 'none'
        });
      }
    }
  },

  // 查看学生详情
  viewStudentDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/school-admin/student-detail/student-detail?id=${id}`
    });
  }
});
