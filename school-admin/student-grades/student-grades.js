const adminAPI = require('../../../utils/adminAPI');

Page({
  data: {
    students: [],
    selectedStudent: null,
    grades: [],
    subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理', '政治'],
    examTypes: ['期中考试', '期末考试', '月考', '周测'],
    currentExam: '期中考试',
    showAddModal: false,
    formData: {
      subject: '',
      score: '',
      exam_type: '期中考试',
      exam_date: ''
    }
  },

  onLoad() {
    const today = new Date().toISOString().split('T')[0];
    this.setData({
      'formData.exam_date': today
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
          this.loadGrades(this.data.selectedStudent.id);
        }
      }
    } catch (error) {
      console.error('加载学生列表失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  async loadGrades(studentId) {
    if (!studentId) return;

    wx.showLoading({ title: '加载成绩...' });
    try {
      const result = await adminAPI.student.getStudentGrades(studentId);
      if (result.success !== false) {
        this.setData({ grades: result.data || [] });
      }
    } catch (error) {
      console.error('加载成绩失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  onStudentChange(e) {
    const index = e.detail.value;
    const student = this.data.students[index];
    this.setData({ selectedStudent: student });
    this.loadGrades(student.id);
  },

  onExamChange(e) {
    const examType = this.data.examTypes[e.detail.value];
    this.setData({ currentExam: examType });
  },

  getFilteredGrades() {
    return this.data.grades.filter(g => g.exam_type === this.data.currentExam);
  },

  calculateStats() {
    const filteredGrades = this.getFilteredGrades();
    if (filteredGrades.length === 0) return { total: 0, average: 0, highest: 0, lowest: 0 };

    const scores = filteredGrades.map(g => parseFloat(g.score) || 0);
    const total = scores.reduce((sum, s) => sum + s, 0);
    const average = (total / scores.length).toFixed(1);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    return { total: filteredGrades.length, average, highest, lowest };
  },

  showAddModal() {
    if (!this.data.selectedStudent) {
      wx.showToast({ title: '请先选择学生', icon: 'none' });
      return;
    }
    this.setData({
      showAddModal: true,
      formData: {
        subject: '',
        score: '',
        exam_type: this.data.currentExam,
        exam_date: new Date().toISOString().split('T')[0]
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

  onSubjectChange(e) {
    const subject = this.data.subjects[e.detail.value];
    this.setData({ 'formData.subject': subject });
  },

  onExamTypeChange(e) {
    const examType = this.data.examTypes[e.detail.value];
    this.setData({ 'formData.exam_type': examType });
  },

  async saveGrade() {
    const { formData, selectedStudent } = this.data;

    if (!formData.subject || !formData.score) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    const score = parseFloat(formData.score);
    if (isNaN(score) || score < 0 || score > 100) {
      wx.showToast({ title: '请输入0-100的有效分数', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中...' });
    try {
      const newGrade = {
        id: `grade_${selectedStudent.id}_${Date.now()}`,
        student_id: selectedStudent.id,
        subject: formData.subject,
        score: score,
        exam_type: formData.exam_type,
        exam_date: formData.exam_date,
        created_at: new Date().toISOString()
      };

      const grades = [...this.data.grades];
      const existingIndex = grades.findIndex(g =>
        g.student_id === selectedStudent.id &&
        g.subject === formData.subject &&
        g.exam_type === formData.exam_type
      );

      if (existingIndex !== -1) {
        grades[existingIndex] = newGrade;
      } else {
        grades.push(newGrade);
      }

      this.setData({
        grades,
        showAddModal: false
      });

      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  async deleteGrade(e) {
    const { id } = e.currentTarget.dataset;

    const res = await wx.showModal({
      title: '确认删除',
      content: '确定要删除这条成绩记录吗？',
      confirmColor: '#ff4d4f'
    });

    if (res.confirm) {
      const grades = this.data.grades.filter(g => g.id !== id);
      this.setData({ grades });
      wx.showToast({ title: '删除成功', icon: 'success' });
    }
  },

  getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 60) return 'score-pass';
    return 'score-fail';
  },

  preventBubble() {}
});
