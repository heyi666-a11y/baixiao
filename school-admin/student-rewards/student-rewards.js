const adminAPI = require('../../../utils/adminAPI');

Page({
  data: {
    students: [],
    selectedStudent: null,
    rewards: [],
    rewardCount: 0,
    punishmentCount: 0,
    rewardTypes: ['奖励', '惩罚'],
    rewardCategories: ['学习优秀', '品德优秀', '体育优秀', '劳动积极', '违纪', '迟到早退', '缺勤', '其他'],
    showAddModal: false,
    formData: {
      type: '奖励',
      category: '',
      content: '',
      date: ''
    }
  },

  onLoad() {
    const today = new Date().toISOString().split('T')[0];
    this.setData({
      'formData.date': today
    });
    this.loadStudents();
  },

  async loadStudents() {
    wx.showLoading({ title: '加载中...' });
    try {
      const result = await adminAPI.student.getStudents();
      if (result.success !== false) {
        this.setData({
          students: result.data || [],
          selectedStudent: result.data && result.data.length > 0 ? result.data[0] : null
        });
        if (this.data.selectedStudent) {
          this.loadRewards(this.data.selectedStudent.id);
        }
      }
    } catch (error) {
      console.error('加载学生列表失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  async loadRewards(studentId) {
    if (!studentId) return;

    wx.showLoading({ title: '加载记录...' });
    try {
      const result = await adminAPI.student.getStudentRewards(studentId);
      if (result.success !== false) {
        const rewards = result.data || [];
        const rewardCount = rewards.filter(r => r.type === '奖励').length;
        const punishmentCount = rewards.filter(r => r.type === '惩罚').length;
        this.setData({
          rewards,
          rewardCount,
          punishmentCount
        });
      }
    } catch (error) {
      console.error('加载奖惩记录失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  onStudentChange(e) {
    const index = e.detail.value;
    const student = this.data.students[index];
    this.setData({ selectedStudent: student });
    this.loadRewards(student.id);
  },

  showAddModal() {
    if (!this.data.selectedStudent) {
      wx.showToast({ title: '请先选择学生', icon: 'none' });
      return;
    }
    this.setData({
      showAddModal: true,
      formData: {
        type: '奖励',
        category: '',
        content: '',
        date: new Date().toISOString().split('T')[0]
      }
    });
  },

  closeModal() {
    this.setData({ showAddModal: false });
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  onTypeChange(e) {
    const type = this.data.rewardTypes[e.detail.value];
    this.setData({ 'formData.type': type });
  },

  onCategoryChange(e) {
    const category = this.data.rewardCategories[e.detail.value];
    this.setData({ 'formData.category': category });
  },

  async saveReward() {
    const { formData, selectedStudent } = this.data;

    if (!formData.category || !formData.content) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    try {
      const newReward = {
        id: `reward_${selectedStudent.id}_${Date.now()}`,
        student_id: selectedStudent.id,
        type: formData.type,
        category: formData.category,
        content: formData.content,
        date: formData.date,
        created_at: new Date().toISOString()
      };

      const rewards = [...this.data.rewards, newReward];
      const rewardCount = rewards.filter(r => r.type === '奖励').length;
      const punishmentCount = rewards.filter(r => r.type === '惩罚').length;

      this.setData({
        rewards,
        rewardCount,
        punishmentCount,
        showAddModal: false
      });

      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  async deleteReward(e) {
    const { id } = e.currentTarget.dataset;

    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      confirmColor: '#ff4d4f'
    });

    if (res.confirm) {
      const rewards = this.data.rewards.filter(r => r.id !== id);
      const rewardCount = rewards.filter(r => r.type === '奖励').length;
      const punishmentCount = rewards.filter(r => r.type === '惩罚').length;
      this.setData({
        rewards,
        rewardCount,
        punishmentCount
      });
      wx.showToast({ title: '删除成功', icon: 'success' });
    }
  },

  getRewardTypeClass(type) {
    return type === '奖励' ? 'type-reward' : 'type-punishment';
  },

  preventBubble() {}
});
