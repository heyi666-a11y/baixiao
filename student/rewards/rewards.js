// 奖惩记录页面
(function() {
  const data = {
    studentId: '',
    student: null,
    records: [],
    filterType: 'all',
    loading: true
  };

  const mockStudents = {
    '1': { id: '1', name: '张三', class_name: '高一1班', avatar: '' }
  };

  const mockRecords = [
    { id: 1, type: 'reward', title: '三好学生', date: '2024-11-01', score: 5, reason: '学习成绩优异，表现突出', teacher: '王老师' },
    { id: 2, type: 'reward', title: '优秀班干部', date: '2024-10-15', score: 3, reason: '工作认真负责', teacher: '李老师' },
    { id: 3, type: 'punishment', title: '迟到警告', date: '2024-10-10', score: -1, reason: '上课迟到5分钟', teacher: '张老师' },
    { id: 4, type: 'reward', title: '数学竞赛一等奖', date: '2024-09-20', score: 10, reason: '获得市级数学竞赛一等奖', teacher: '刘老师' },
    { id: 5, type: 'punishment', title: '课堂违纪', date: '2024-09-05', score: -2, reason: '上课说话影响课堂秩序', teacher: '陈老师' }
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
        loadRecords()
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

  async function loadRecords() {
    await new Promise(resolve => setTimeout(resolve, 200));
    data.records = mockRecords;
  }

  function getFilteredRecords() {
    if (data.filterType === 'all') return data.records;
    return data.records.filter(r => r.type === data.filterType);
  }

  function renderPage() {
    renderStudentHeader();
    renderStats();
    renderRecords();
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

  function renderStats() {
    const rewardCount = data.records.filter(r => r.type === 'reward').reduce((sum, r) => sum + r.score, 0);
    const punishmentCount = data.records.filter(r => r.type === 'punishment').reduce((sum, r) => sum + Math.abs(r.score), 0);
    
    document.getElementById('rewardCount').textContent = rewardCount;
    document.getElementById('punishmentCount').textContent = punishmentCount;
  }

  function renderRecords() {
    const list = document.getElementById('recordsList');
    const emptyState = document.getElementById('emptyState');
    const filtered = getFilteredRecords();
    
    if (filtered.length === 0) {
      list.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }
    
    emptyState.style.display = 'none';
    list.innerHTML = filtered.map(item => {
      const isReward = item.type === 'reward';
      return `
        <div class="record-item">
          <div class="record-header">
            <div class="record-icon ${item.type}">
              <span>${isReward ? '🏆' : '⚠️'}</span>
            </div>
            <div class="record-info">
              <span class="record-title">${item.title}</span>
              <span class="record-date">${item.date}</span>
            </div>
            <span class="record-score ${item.type}">${isReward ? '+' : ''}${item.score}分</span>
          </div>
          <div class="record-content">
            <p class="record-reason">${item.reason}</p>
          </div>
          <div class="record-teacher">记录人: ${item.teacher}</div>
        </div>
      `;
    }).join('');
  }

  function bindEvents() {
    document.getElementById('typeFilter').addEventListener('click', function(e) {
      const tab = e.target.closest('.filter-tab');
      if (tab) {
        data.filterType = tab.dataset.type;
        
        document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        renderRecords();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
