// 成绩查询页面
(function() {
  const data = {
    studentId: '',
    student: null,
    grades: [],
    selectedExamType: '全部',
    loading: true,
    currentExam: null,
    trendData: []
  };

  const mockStudents = {
    '1': { id: '1', name: '张三', class_name: '高一1班', avatar: '' }
  };

  const mockGrades = [
    { exam_name: '期中考试', exam_date: '2024-11-15', subjects: [{ name: '语文', score: 85, classAvg: 82, gradeAvg: 80 }, { name: '数学', score: 92, classAvg: 85, gradeAvg: 83 }, { name: '英语', score: 88, classAvg: 86, gradeAvg: 84 }], total_score: 265, class_rank: 5, grade_rank: 25 },
    { exam_name: '月考', exam_date: '2024-10-20', subjects: [{ name: '语文', score: 82, classAvg: 80, gradeAvg: 78 }, { name: '数学', score: 90, classAvg: 82, gradeAvg: 80 }, { name: '英语', score: 85, classAvg: 83, gradeAvg: 81 }], total_score: 257, class_rank: 8, grade_rank: 32 },
    { exam_name: '月考', exam_date: '2024-09-15', subjects: [{ name: '语文', score: 80, classAvg: 78, gradeAvg: 76 }, { name: '数学', score: 88, classAvg: 80, gradeAvg: 78 }, { name: '英语', score: 83, classAvg: 81, gradeAvg: 79 }], total_score: 251, class_rank: 10, grade_rank: 38 }
  ];

  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    data.studentId = urlParams.get('id');
    
    if (data.studentId) {
      loadData();
    }
    
    bindEvents();
  }

  async function loadData() {
    data.loading = true;
    document.getElementById('loadingState').style.display = 'flex';
    document.getElementById('content').style.display = 'none';
    
    try {
      await Promise.all([
        loadStudentInfo(),
        loadGrades()
      ]);
      
      renderPage();
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      data.loading = false;
      document.getElementById('loadingState').style.display = 'none';
      document.getElementById('content').style.display = 'block';
    }
  }

  async function loadStudentInfo() {
    await new Promise(resolve => setTimeout(resolve, 200));
    data.student = mockStudents[data.studentId] || { name: '未知', class_name: '-', avatar: '' };
  }

  async function loadGrades() {
    await new Promise(resolve => setTimeout(resolve, 200));
    data.grades = mockGrades;
    data.currentExam = data.grades[0] || null;
    calculateTrend();
  }

  function calculateTrend() {
    data.trendData = data.grades.slice(0, 5).map((grade, index) => ({
      index: 5 - index,
      name: grade.exam_name || `考试${5 - index}`,
      total: grade.total_score,
      rank: grade.grade_rank
    })).reverse();
  }

  function renderPage() {
    renderStudentHeader();
    renderOverview();
    renderSubjects();
    renderTrend();
    renderHistory();
    checkEmpty();
  }

  function renderStudentHeader() {
    if (!data.student) return;
    
    const avatarImg = document.getElementById('headerAvatar');
    const avatarPlaceholder = document.getElementById('headerAvatarPlaceholder');
    
    if (data.student.avatar) {
      avatarImg.src = data.student.avatar;
      avatarImg.style.display = 'block';
      avatarPlaceholder.style.display = 'none';
    } else {
      avatarImg.style.display = 'none';
      avatarPlaceholder.style.display = 'flex';
      document.getElementById('headerAvatarText').textContent = data.student.name ? data.student.name[0] : '学';
    }
    
    document.getElementById('headerName').textContent = data.student.name;
    document.getElementById('headerClass').textContent = data.student.class_name;
  }

  function renderOverview() {
    const card = document.getElementById('overviewCard');
    if (!data.currentExam) {
      card.style.display = 'none';
      return;
    }
    
    card.style.display = 'block';
    document.getElementById('examName').textContent = data.currentExam.exam_name || '最新考试';
    document.getElementById('examDate').textContent = data.currentExam.exam_date || '-';
    document.getElementById('totalScore').textContent = data.currentExam.total_score || 0;
    document.getElementById('classRank').textContent = data.currentExam.class_rank || '-';
    document.getElementById('gradeRank').textContent = data.currentExam.grade_rank || '-';
  }

  function renderSubjects() {
    const section = document.getElementById('subjectsSection');
    const list = document.getElementById('subjectsList');
    
    if (!data.currentExam || !data.currentExam.subjects || data.currentExam.subjects.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    list.innerHTML = data.currentExam.subjects.map(subject => {
      const scoreClass = getScoreClass(subject.score);
      const progressWidth = Math.min(subject.score, 100);
      
      return `
        <div class="subject-item">
          <div class="subject-header">
            <span class="subject-name">${subject.name}</span>
            <span class="subject-score ${scoreClass}">${subject.score}分</span>
          </div>
          <div class="score-bar">
            <div class="score-progress ${scoreClass}" style="width: ${progressWidth}%;"></div>
          </div>
          <div class="subject-avg">
            <span class="avg-item">班平均: ${subject.classAvg || '-'}</span>
            <span class="avg-item">年平均: ${subject.gradeAvg || '-'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderTrend() {
    const section = document.getElementById('trendSection');
    const bars = document.getElementById('trendBars');
    
    if (data.trendData.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    bars.innerHTML = data.trendData.map(item => `
      <div class="trend-bar-item">
        <div class="bar-wrapper">
          <div class="bar" style="height: ${(item.total / 300) * 100}%;"></div>
        </div>
        <span class="bar-label">${item.name}</span>
        <span class="bar-value">${item.total}</span>
      </div>
    `).join('');
  }

  function renderHistory() {
    const section = document.getElementById('historySection');
    const list = document.getElementById('historyList');
    
    if (data.grades.length === 0) {
      section.style.display = 'none';
      return;
    }
    
    section.style.display = 'block';
    list.innerHTML = data.grades.map((grade, index) => `
      <div class="history-item ${data.currentExam && data.currentExam.exam_name === grade.exam_name ? 'active' : ''}" data-index="${index}">
        <div class="history-info">
          <span class="history-name">${grade.exam_name || '-'}</span>
          <span class="history-date">${grade.exam_date || '-'}</span>
        </div>
        <div class="history-score">
          <span class="score-value">${grade.total_score || 0}分</span>
          <span class="rank-value">年排${grade.grade_rank || '-'}</span>
        </div>
      </div>
    `).join('');
  }

  function checkEmpty() {
    const emptyState = document.getElementById('emptyState');
    const hasData = data.grades.length > 0;
    emptyState.style.display = hasData ? 'none' : 'flex';
  }

  function getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'pass';
    return 'fail';
  }

  function bindEvents() {
    document.getElementById('examSelect').addEventListener('change', function(e) {
      data.selectedExamType = e.target.value;
      filterGrades();
    });
    
    document.getElementById('historyList').addEventListener('click', function(e) {
      const item = e.target.closest('.history-item');
      if (item) {
        const index = parseInt(item.dataset.index);
        data.currentExam = data.grades[index];
        renderPage();
      }
    });
  }

  function filterGrades() {
    if (data.selectedExamType === '全部') {
      data.currentExam = data.grades[0] || null;
    } else {
      const filtered = data.grades.filter(g => g.exam_name.includes(data.selectedExamType));
      data.currentExam = filtered[0] || null;
    }
    renderPage();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
