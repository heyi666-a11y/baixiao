// 引入mock数据
const { mockStudents } = require('../../../../utils/mockData.js');

// 本地存储键名
const STORAGE_KEY = 'school_students_data';

Page({
  data: {
    // 学生列表
    students: [],
    filteredStudents: [],
    // 搜索关键词
    searchKeyword: '',
    // 弹窗显示状态
    showModal: false,
    showDeleteModal: false,
    // 是否为编辑模式
    isEdit: false,
    // 当前编辑的学生ID
    currentStudentId: null,
    // 删除相关
    deleteStudentId: null,
    deleteStudentName: '',
    // 表单数据
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
  loadStudents() {
    // 尝试从本地存储加载
    const storedData = wx.getStorageSync(STORAGE_KEY);
    let students = [];
    
    if (storedData && storedData.length > 0) {
      students = storedData;
    } else {
      // 首次加载使用mock数据
      students = [...mockStudents];
      // 保存到本地存储
      wx.setStorageSync(STORAGE_KEY, students);
    }
    
    this.setData({
      students: students,
      filteredStudents: students
    });
  },

  // 保存学生数据到本地存储
  saveToStorage(students) {
    wx.setStorageSync(STORAGE_KEY, students);
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
  },

  // 执行搜索
  onSearch() {
    const keyword = this.data.searchKeyword.trim().toLowerCase();
    const { students } = this.data;
    
    if (!keyword) {
      this.setData({
        filteredStudents: students
      });
      return;
    }
    
    const filtered = students.filter(student => {
      return student.name.toLowerCase().includes(keyword) ||
             student.student_id.toLowerCase().includes(keyword) ||
             student.class_name.toLowerCase().includes(keyword);
    });
    
    this.setData({
      filteredStudents: filtered
    });
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
    
    if (!student) {
      wx.showToast({
        title: '学生不存在',
        icon: 'none'
      });
      return;
    }
    
    this.setData({
      showModal: true,
      isEdit: true,
      currentStudentId: id,
      formData: {
        name: student.name,
        student_id: student.student_id,
        class_name: student.class_name,
        gender: student.gender,
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
    this.setData({
      showModal: false
    });
  },

  // 阻止事件冒泡
  preventHide() {
    // 什么都不做，只是阻止冒泡
  },

  // 表单输入
  onFormInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 性别选择
  onGenderSelect(e) {
    const gender = e.currentTarget.dataset.gender;
    this.setData({
      'formData.gender': gender
    });
  },

  // 出生日期选择
  onBirthdayChange(e) {
    this.setData({
      'formData.birthday': e.detail.value
    });
  },

  // 入学日期选择
  onEnrollmentChange(e) {
    this.setData({
      'formData.enrollment_date': e.detail.value
    });
  },

  // 保存学生
  saveStudent() {
    const { formData, isEdit, currentStudentId, students } = this.data;
    
    // 表单验证
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.student_id.trim()) {
      wx.showToast({
        title: '请输入学号',
        icon: 'none'
      });
      return;
    }
    
    if (!formData.class_name.trim()) {
      wx.showToast({
        title: '请输入班级',
        icon: 'none'
      });
      return;
    }
    
    let newStudents = [...students];
    
    if (isEdit) {
      // 编辑模式
      const index = newStudents.findIndex(s => s.id === currentStudentId);
      if (index !== -1) {
        // 检查学号是否与其他学生重复
        const duplicate = newStudents.find(s => s.student_id === formData.student_id && s.id !== currentStudentId);
        if (duplicate) {
          wx.showToast({
            title: '学号已存在',
            icon: 'none'
          });
          return;
        }
        
        newStudents[index] = {
          ...newStudents[index],
          ...formData
        };
      }
    } else {
      // 添加模式
      // 检查学号是否重复
      const duplicate = newStudents.find(s => s.student_id === formData.student_id);
      if (duplicate) {
        wx.showToast({
          title: '学号已存在',
          icon: 'none'
        });
        return;
      }
      
      // 生成新ID
      const newId = String(Math.max(...newStudents.map(s => parseInt(s.id)), 0) + 1);
      
      newStudents.push({
        id: newId,
        ...formData
      });
    }
    
    // 保存到本地存储
    this.saveToStorage(newStudents);
    
    // 更新页面数据
    this.setData({
      students: newStudents,
      filteredStudents: newStudents,
      showModal: false
    });
    
    wx.showToast({
      title: isEdit ? '修改成功' : '添加成功',
      icon: 'success'
    });
  },

  // 显示删除确认弹窗
  showDeleteConfirm(e) {
    const id = e.currentTarget.dataset.id;
    const student = this.data.students.find(s => s.id === id);
    
    if (!student) {
      return;
    }
    
    this.setData({
      showDeleteModal: true,
      deleteStudentId: id,
      deleteStudentName: student.name
    });
  },

  // 隐藏删除弹窗
  hideDeleteModal() {
    this.setData({
      showDeleteModal: false,
      deleteStudentId: null,
      deleteStudentName: ''
    });
  },

  // 确认删除
  confirmDelete() {
    const { deleteStudentId, students } = this.data;
    
    if (!deleteStudentId) {
      return;
    }
    
    const newStudents = students.filter(s => s.id !== deleteStudentId);
    
    // 保存到本地存储
    this.saveToStorage(newStudents);
    
    // 更新页面数据
    this.setData({
      students: newStudents,
      filteredStudents: newStudents,
      showDeleteModal: false,
      deleteStudentId: null,
      deleteStudentName: ''
    });
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  }
});
