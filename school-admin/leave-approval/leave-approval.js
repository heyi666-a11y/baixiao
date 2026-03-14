const adminAPI = require('../../../utils/adminAPI');

Page({
  data: {
    leaves: [],
    filteredLeaves: [],
    activeTab: 'pending',
    tabs: [
      { key: 'pending', label: '待审批' },
      { key: 'approved', label: '已通过' },
      { key: 'rejected', label: '已拒绝' },
      { key: 'all', label: '全部' }
    ],
    students: [],
    showDetailModal: false,
    currentLeave: null,
    rejectReason: ''
  },

  onLoad() {
    this.loadData();
  },

  onShow() {
    this.loadData();
  },

  async loadData() {
    wx.showLoading({ title: '加载中...' });
    try {
      const [leavesRes, studentsRes] = await Promise.all([
        adminAPI.leave.getAllLeaves(),
        adminAPI.student.getStudents()
      ]);

      if (leavesRes.success !== false && studentsRes.success !== false) {
        const students = studentsRes.data || [];
        const leaves = (leavesRes.data || []).map(leave => {
          const student = students.find(s => s.id === leave.student_id);
          return {
            ...leave,
            studentName: student ? student.name : '未知学生',
            studentClass: student ? student.class_name : '',
            studentId: student ? student.student_id : ''
          };
        });

        this.setData({
          leaves: leaves,
          students: students
        });

        this.filterLeaves();
      }
    } catch (error) {
      console.error('加载请假数据失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    this.filterLeaves();
  },

  filterLeaves() {
    const { leaves, activeTab } = this.data;
    let filtered = [];

    switch (activeTab) {
      case 'pending':
        filtered = leaves.filter(l => l.status === 'pending');
        break;
      case 'approved':
        filtered = leaves.filter(l => l.status === 'approved');
        break;
      case 'rejected':
        filtered = leaves.filter(l => l.status === 'rejected');
        break;
      case 'all':
      default:
        filtered = leaves;
        break;
    }

    this.setData({ filteredLeaves: filtered });
  },

  showDetail(e) {
    const leave = e.currentTarget.dataset.leave;
    this.setData({
      showDetailModal: true,
      currentLeave: leave,
      rejectReason: ''
    });
  },

  closeDetail() {
    this.setData({
      showDetailModal: false,
      currentLeave: null,
      rejectReason: ''
    });
  },

  onRejectReasonInput(e) {
    this.setData({ rejectReason: e.detail.value });
  },

  async approveLeave() {
    const { currentLeave } = this.data;
    if (!currentLeave) return;

    const res = await wx.showModal({
      title: '确认通过',
      content: `确定批准 ${currentLeave.studentName} 的请假申请吗？`,
      confirmColor: '#52c41a'
    });

    if (res.confirm) {
      wx.showLoading({ title: '处理中...' });
      try {
        const result = await adminAPI.leave.approveLeave(currentLeave.id, '管理员');
        if (result.success !== false) {
          wx.showToast({ title: '审批通过', icon: 'success' });
          this.closeDetail();
          this.loadData();
        } else {
          wx.showToast({ title: result.error || '操作失败', icon: 'error' });
        }
      } catch (error) {
        wx.showToast({ title: '操作失败', icon: 'error' });
      } finally {
        wx.hideLoading();
      }
    }
  },

  async rejectLeave() {
    const { currentLeave, rejectReason } = this.data;
    if (!currentLeave) return;

    if (!rejectReason.trim()) {
      wx.showToast({ title: '请输入拒绝原因', icon: 'none' });
      return;
    }

    const res = await wx.showModal({
      title: '确认拒绝',
      content: `确定拒绝 ${currentLeave.studentName} 的请假申请吗？`,
      confirmColor: '#ff4d4f'
    });

    if (res.confirm) {
      wx.showLoading({ title: '处理中...' });
      try {
        const result = await adminAPI.leave.rejectLeave(currentLeave.id, '管理员', rejectReason);
        if (result.success !== false) {
          wx.showToast({ title: '已拒绝', icon: 'success' });
          this.closeDetail();
          this.loadData();
        } else {
          wx.showToast({ title: result.error || '操作失败', icon: 'error' });
        }
      } catch (error) {
        wx.showToast({ title: '操作失败', icon: 'error' });
      } finally {
        wx.hideLoading();
      }
    }
  },

  getStatusText(status) {
    const statusMap = {
      pending: '待审批',
      approved: '已通过',
      rejected: '已拒绝'
    };
    return statusMap[status] || status;
  },

  getStatusClass(status) {
    const classMap = {
      pending: 'status-pending',
      approved: 'status-approved',
      rejected: 'status-rejected'
    };
    return classMap[status] || '';
  },

  getLeaveTypeText(type) {
    const typeMap = {
      sick: '病假',
      personal: '事假',
      other: '其他'
    };
    return typeMap[type] || type;
  },

  preventBubble() {}
});
