const adminAPI = require('../../../utils/adminAPI');

Page({
  data: {
    students: [],
    attendanceRecords: [],
    filteredRecords: [],
    currentDate: '',
    selectedClass: '',
    selectedStatus: '',
    classes: [],
    stats: {
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      leave: 0
    },
    showDetailModal: false,
    currentRecord: null
  },

  onLoad() {
    const today = new Date().toISOString().split('T')[0];
    this.setData({ currentDate: today });
    this.loadData();
  },

  async loadData() {
    wx.showLoading({ title: '加载中...' });
    try {
      const result = await adminAPI.student.getStudents();
      if (result.success !== false) {
        const students = result.data || [];
        
        // 提取所有班级
        const classSet = new Set(students.map(s => s.class_name).filter(Boolean));
        const classes = Array.from(classSet).sort();

        this.setData({
          students: students,
          classes: classes
        });

        this.generateAttendanceRecords();
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  generateAttendanceRecords() {
    const { students, currentDate } = this.data;
    
    const records = students.map(student => {
      // 模拟生成考勤记录
      const random = Math.random();
      let status = 'present';
      if (random > 0.9) status = 'absent';
      else if (random > 0.8) status = 'late';
      else if (random > 0.75) status = 'leave';

      return {
        id: `att_${student.id}_${currentDate}`,
        studentId: student.id,
        studentName: student.name,
        className: student.class_name,
        date: currentDate,
        status: status,
        checkTime: status === 'present' ? '08:15' : (status === 'late' ? '08:45' : null),
        remark: ''
      };
    });

    this.setData({
      attendanceRecords: records,
      filteredRecords: records
    });

    this.calculateStats(records);
  },

  calculateStats(records) {
    const stats = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      leave: records.filter(r => r.status === 'leave').length
    };
    this.setData({ stats });
  },

  onDateChange(e) {
    this.setData({ currentDate: e.detail.value });
    this.generateAttendanceRecords();
  },

  onClassFilter(e) {
    const className = e.currentTarget.dataset.class;
    this.setData({ selectedClass: className === this.data.selectedClass ? '' : className });
    this.filterRecords();
  },

  onStatusFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ selectedStatus: status === this.data.selectedStatus ? '' : status });
    this.filterRecords();
  },

  filterRecords() {
    let filtered = [...this.data.attendanceRecords];

    if (this.data.selectedClass) {
      filtered = filtered.filter(r => r.className === this.data.selectedClass);
    }

    if (this.data.selectedStatus) {
      filtered = filtered.filter(r => r.status === this.data.selectedStatus);
    }

    this.setData({ filteredRecords: filtered });
  },

  showDetail(e) {
    const record = e.currentTarget.dataset.record;
    this.setData({
      showDetailModal: true,
      currentRecord: record
    });
  },

  closeDetail() {
    this.setData({ showDetailModal: false, currentRecord: null });
  },

  markAttendance(e) {
    const { id, status } = e.currentTarget.dataset;
    const records = this.data.attendanceRecords.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status,
          checkTime: status === 'present' ? new Date().toTimeString().slice(0, 5) : (status === 'late' ? '08:45' : null)
        };
      }
      return r;
    });

    this.setData({ attendanceRecords: records });
    this.filterRecords();
    this.calculateStats(records);
    
    wx.showToast({ title: '标记成功', icon: 'success' });
  },

  getStatusText(status) {
    const statusMap = {
      present: '正常',
      absent: '缺勤',
      late: '迟到',
      leave: '请假'
    };
    return statusMap[status] || status;
  },

  getStatusClass(status) {
    const classMap = {
      present: 'status-present',
      absent: 'status-absent',
      late: 'status-late',
      leave: 'status-leave'
    };
    return classMap[status] || '';
  }
});
