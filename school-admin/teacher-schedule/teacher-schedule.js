const adminAPI = require('../../../utils/adminAPI');

Page({
  data: {
    teachers: [],
    selectedTeacher: null,
    schedule: [],
    weekDays: ['周一', '周二', '周三', '周四', '周五'],
    timeSlots: [
      { time: '08:00-08:45', label: '第1节' },
      { time: '08:55-09:40', label: '第2节' },
      { time: '10:00-10:45', label: '第3节' },
      { time: '10:55-11:40', label: '第4节' },
      { time: '14:00-14:45', label: '第5节' },
      { time: '14:55-15:40', label: '第6节' },
      { time: '16:00-16:45', label: '第7节' },
      { time: '16:55-17:40', label: '第8节' }
    ],
    showEditModal: false,
    editingSchedule: null,
    formData: {
      day: 0,
      period: 0,
      subject: '',
      className: '',
      classroom: ''
    }
  },

  onLoad() {
    this.loadTeachers();
  },

  async loadTeachers() {
    wx.showLoading({ title: '加载中...' });
    try {
      const result = await adminAPI.teacher.getTeachers();
      if (result.success !== false) {
        this.setData({ 
          teachers: result.data || [],
          selectedTeacher: result.data && result.data.length > 0 ? result.data[0] : null
        });
        if (this.data.selectedTeacher) {
          this.loadSchedule(this.data.selectedTeacher.id);
        }
      }
    } catch (error) {
      console.error('加载教师列表失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  async loadSchedule(teacherId) {
    if (!teacherId) return;
    
    wx.showLoading({ title: '加载课表...' });
    try {
      const result = await adminAPI.teacher.getTeacherSchedule(teacherId);
      if (result.success !== false) {
        this.setData({ schedule: result.data || [] });
      }
    } catch (error) {
      console.error('加载课表失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  onTeacherChange(e) {
    const index = e.detail.value;
    const teacher = this.data.teachers[index];
    this.setData({ selectedTeacher: teacher });
    this.loadSchedule(teacher.id);
  },

  getScheduleItem(day, period) {
    return this.data.schedule.find(s => s.day === day && s.period === period) || null;
  },

  onScheduleTap(e) {
    const { day, period } = e.currentTarget.dataset;
    const existing = this.getScheduleItem(parseInt(day), parseInt(period));
    
    this.setData({
      showEditModal: true,
      editingSchedule: existing,
      formData: existing ? {
        day: existing.day,
        period: existing.period,
        subject: existing.subject || '',
        className: existing.className || '',
        classroom: existing.classroom || ''
      } : {
        day: parseInt(day),
        period: parseInt(period),
        subject: '',
        className: '',
        classroom: ''
      }
    });
  },

  closeModal() {
    this.setData({ 
      showEditModal: false, 
      editingSchedule: null,
      formData: { day: 0, period: 0, subject: '', className: '', classroom: '' }
    });
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  async saveSchedule() {
    const { formData, selectedTeacher, editingSchedule } = this.data;
    
    if (!formData.subject.trim()) {
      wx.showToast({ title: '请输入课程名称', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    try {
      // 更新本地schedule数据
      let schedule = [...this.data.schedule];
      const index = schedule.findIndex(s => s.day === formData.day && s.period === formData.period);
      
      const newItem = {
        id: editingSchedule ? editingSchedule.id : `sch_${selectedTeacher.id}_${formData.day}_${formData.period}`,
        day: formData.day,
        period: formData.period,
        subject: formData.subject,
        className: formData.className,
        classroom: formData.classroom,
        teacherId: selectedTeacher.id
      };

      if (index !== -1) {
        schedule[index] = newItem;
      } else {
        schedule.push(newItem);
      }

      this.setData({ 
        schedule,
        showEditModal: false,
        editingSchedule: null,
        formData: { day: 0, period: 0, subject: '', className: '', classroom: '' }
      });

      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  async deleteSchedule() {
    const { editingSchedule } = this.data;
    if (!editingSchedule) return;

    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这节课吗？',
      confirmColor: '#ff4d4f'
    });

    if (res.confirm) {
      let schedule = this.data.schedule.filter(s => 
        !(s.day === editingSchedule.day && s.period === editingSchedule.period)
      );
      
      this.setData({ 
        schedule,
        showEditModal: false,
        editingSchedule: null,
        formData: { day: 0, period: 0, subject: '', className: '', classroom: '' }
      });
      
      wx.showToast({ title: '删除成功', icon: 'success' });
    }
  },

  preventBubble() {
    // 阻止事件冒泡
  }
});
