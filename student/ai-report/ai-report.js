// AI 分析报告页面
(function() {
  const data = {
    studentId: '',
    student: null,
    report: null,
    loading: true
  };

  const mockStudents = {
    '1': { id: '1', name: '张三', class_name: '高一1班', avatar: '' }
  };

  const mockReport = {
    overallScore: 85,
    classRank: 5,
    abilities: [
      { name: '学习能力', score: 85 },
      { name: '课堂表现', score: 78 },
      { name: '作业完成', score: 92 },
      { name: '考试成绩', score: 80 },
      { name: '综合素质', score: 88 }
    ],
    subjects: [
      { name: '语文', score: 85, trend: 'up' },
      { name: '数学', score: 92, trend: 'up' },
      { name: '英语', score: 78, trend: 'down' },
      { name: '物理', score: 88, trend: 'stable' },
      { name: '化学', score: 75, trend: 'up' }
    ],
    suggestions: [
      { title: '加强英语学习', desc: '英语成绩有下滑趋势，建议每天增加30分钟英语阅读和听力练习。' },
      { title: '保持数学优势', desc: '数学成绩优异，建议参加数学竞赛，进一步提升能力。' },
      { title: '提高课堂参与度', desc: '课堂表现评分较低，建议积极参与课堂讨论，多向老师提问。' }
    ],
    trend: [
      { month: '9月', score: 78 },
      { month: '10月', score: 82 },
      { month: '11月', score: 85 }
    ]
  };

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
        loadReport()
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

  async function loadReport() {
    await new Promise(resolve => setTimeout(resolve, 500));
    data.report = mockReport;
  }

  function renderPage() {
    renderStudentHeader();
    renderReport();
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

  function renderReport() {
    if (!data.report) return;
    
    // 综合评分
    document.getElementById('overallScore').textContent = data.report.overallScore;
    document.getElementById('classRank').textContent = '第' + data.report.classRank + '名';
    
    // 报告日期
    document.getElementById('reportDate').textContent = '生成时间: ' + new Date().toISOString().split('T')[0];
    
    // 学科分析
    renderSubjects();
    
    // AI 建议
    renderSuggestions();
    
    // 学习趋势
    renderTrend();
  }

  function renderSubjects() {
    const list = document.getElementById('subjectList');
    list.innerHTML = data.report.subjects.map(subject => {
      const scoreClass = getScoreClass(subject.score);
      const trendIcon = subject.trend === 'up' ? '↑' : subject.trend === 'down' ? '↓' : '→';
      const trendColor = subject.trend === 'up' ? '#27ae60' : subject.trend === 'down' ? '#e74c3c' : '#95a5a6';
      
      return `
        <div class="subject-item">
          <span class="subject-name">${subject.name}</span>
          <div class="subject-bar">
            <div class="subject-progress ${scoreClass}" style="width: ${subject.score}%;">
              <span class="subject-score-text">${subject.score}</span>
            </div>
          </div>
          <span class="subject-trend" style="color: ${trendColor};">${trendIcon}</span>
        </div>
      `;
    }).join('');
  }

  function renderSuggestions() {
    const list = document.getElementById('suggestionList');
    list.innerHTML = data.report.suggestions.map((suggestion, index) => `
      <div class="suggestion-item">
        <div class="suggestion-icon">
          <span>${index + 1}</span>
        </div>
        <div class="suggestion-content">
          <div class="suggestion-title">${suggestion.title}</div>
          <div class="suggestion-desc">${suggestion.desc}</div>
        </div>
      </div>
    `).join('');
  }

  function renderTrend() {
    const bars = document.getElementById('trendBars');
    const maxScore = Math.max(...data.report.trend.map(t => t.score));
    
    bars.innerHTML = data.report.trend.map(item => `
      <div class="trend-bar-item">
        <div class="bar-wrapper">
          <div class="bar" style="height: ${(item.score / maxScore) * 100}%;"></div>
        </div>
        <span class="bar-label">${item.month}</span>
        <span class="bar-value">${item.score}</span>
      </div>
    `).join('');
  }

  function getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'average';
    return 'weak';
  }

  function bindEvents() {
    document.getElementById('generateBtn').addEventListener('click', async function() {
      this.disabled = true;
      this.textContent = '生成中...';
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        showToast('报告生成成功', 'success');
      } catch (err) {
        showToast('生成失败', 'error');
      } finally {
        this.disabled = false;
        this.textContent = '重新生成报告';
      }
    });
  }

  function showToast(message, type = 'info') {
    if (window.utils && window.utils.showToast) {
      window.utils.showToast(message, type);
    } else {
      alert(message);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
