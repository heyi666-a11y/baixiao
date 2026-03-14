const adminAPI = require('../../../utils/adminAPI');

Page({
  data: {
    attendanceRecords: [],
    filteredRecords: [],
    teachers: [],
    currentDate: '',
    selectedTeacher: '',
    selectedStatus: '',
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
      const [attendanceRes, teachersRes] = await Promise.all([
        adminAPI.teacher.getAllAttendance(this.data.currentDate),
        adminAPI.teacher.getTeachers()
      ]);

      if (attendanceRes.success && teachersRes.success) {
        const records = attendanceRes.data.map(record => {
          const teacher = teachersRes.data.find(t => t.id === record.teacherId);
          return {
            ...record,
            teacherName: teacher ? teacher.name : '未知教师',
            department: teacher ? teacher.department : ''
          };
        });

        this.setData({
          attendanceRecords: records,
          filteredRecords: records,
          teachers: teachersRes.data
        });

        this.calculateStats(records);
      }
    } catch (error) {
      console.error('加载考勤数据失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
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
    this.loadData();
  },

  onTeacherFilter(e) {
    const teacherId = e.currentTarget.dataset.id;
    this.setData({ selectedTeacher: teacherId });
    this.filterRecords();
  },

  onStatusFilter(e) {
    const status = e.currentTarget.dataset.status;
    this.setData({ selectedStatus: status });
    this.filterRecords();
  },

  filterRecords() {
    let filtered = [...this.data.attendanceRecords];

    if (this.data.selectedTeacher) {
      filtered = filtered.filter(r => r.teacherId === this.data.selectedTeacher);
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

  async markAttendance(e) {
    const { id, status } = e.currentTarget.dataset;
    
    try {
      const result = await adminAPI.teacher.updateAttendance(id, {
        status,
        checkTime: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      if (result.success) {
        wx.showToast({ title: '标记成功', icon: 'success' });
        this.loadData();
      }
    } catch (error) {
      wx.showToast({ title: '操作失败', icon: 'error' });
    }
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
