// 模拟联考API
const jointExamsAPI = {
  getExams: (filter = 'all') => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockExams = [
          {
            id: 1,
            name: '2024年春季学期期中联考',
            status: 'ongoing',
            statusText: '进行中',
            schoolCount: 12,
            examDate: '2024-04-15 至 2024-04-17',
            subjects: ['语文', '数学', '英语', '物理', '化学'],
            updateTime: '2024-04-10 09:30'
          },
          {
            id: 2,
            name: '2024年高三一模联考',
            status: 'ended',
            statusText: '已结束',
            schoolCount: 15,
            examDate: '2024-03-01 至 2024-03-03',
            subjects: ['语文', '数学', '英语', '物理', '化学', '生物'],
            updateTime: '2024-03-05 16:45'
          },
          {
            id: 3,
            name: '2024年高二年级期末联考',
            status: 'upcoming',
            statusText: '未开始',
            schoolCount: 10,
            examDate: '2024-06-20 至 2024-06-22',
            subjects: ['语文', '数学', '英语', '物理', '化学', '生物', '历史', '地理'],
            updateTime: '2024-04-08 14:20'
          },
          {
            id: 4,
            name: '2024年高一年级月考联考',
            status: 'ended',
            statusText: '已结束',
            schoolCount: 8,
            examDate: '2024-03-20 至 2024-03-21',
            subjects: ['语文', '数学', '英语'],
            updateTime: '2024-03-25 10:15'
          },
          {
            id: 5,
            name: '2024年高三二模联考',
            status: 'upcoming',
            statusText: '未开始',
            schoolCount: 15,
            examDate: '2024-05-10 至 2024-05-12',
            subjects: ['语文', '数学', '英语', '物理', '化学', '生物'],
            updateTime: '2024-04-05 11:00'
          }
        ];

        let filteredExams = mockExams;
        if (filter !== 'all') {
          filteredExams = mockExams.filter(exam => exam.status === filter);
        }

        resolve({
          code: 200,
          data: filteredExams,
          message: 'success'
        });
      }, 500);
    });
  }
};

// 数据状态
let currentFilter = 'all';
let exams = [];
let loading = false;
let isAdmin = true; // 假设当前用户是管理员

// 页面加载
function init() {
  loadExams();
}

// 加载联考列表
async function loadExams() {
  loading = true;
  document.getElementById('loading').style.display = 'block';
  document.getElementById('emptyState').style.display = 'none';
  
  try {
    const res = await jointExamsAPI.getExams(currentFilter);
    if (res.code === 200) {
      exams = res.data;
      loading = false;
      renderExams();
    }
  } catch (error) {
    console.error('加载联考列表失败:', error);
    alert('加载失败');
    loading = false;
  }
  document.getElementById('loading').style.display = 'none';
}

// 渲染联考列表
function renderExams() {
  const examListEl = document.getElementById('examList');
  
  if (exams.length === 0 && !loading) {
    examListEl.innerHTML = '';
    document.getElementById('emptyState').style.display = 'flex';
    document.getElementById('emptySubtext').textContent = 
      currentFilter === 'all' ? '还没有发起任何联考' : '该状态下暂无联考';
    return;
  }
  
  document.getElementById('emptyState').style.display = 'none';
  
  examListEl.innerHTML = exams.map(item => `
    <div class="exam-card" data-id="${item.id}" onclick="goToDetail(${item.id})">
      <div class="exam-header">
        <span class="exam-name">${item.name}</span>
        <div class="status-badge status-${item.status}">
          ${item.statusText}
        </div>
      </div>
      <div class="exam-info">
        <div class="info-item">
          <span class="info-icon">🏫</span>
          <span class="info-text">${item.schoolCount}所学校参与</span>
        </div>
        <div class="info-item">
          <span class="info-icon">📅</span>
          <span class="info-text">${item.examDate}</span>
        </div>
        <div class="info-item">
          <span class="info-icon">📚</span>
          <span class="info-text">${item.subjects.join('、')}</span>
        </div>
      </div>
      <div class="exam-footer">
        <span class="update-time">更新于 ${item.updateTime}</span>
        <span class="arrow">></span>
      </div>
    </div>
  `).join('');
}

// 筛选切换
function onFilterChange(element) {
  const filter = element.dataset.filter;
  currentFilter = filter;
  
  // 更新UI
  document.querySelectorAll('.filter-item').forEach(item => {
    item.classList.remove('active');
  });
  element.classList.add('active');
  
  loadExams();
}

// 跳转到详情页
function goToDetail(examId) {
  location.href = `../detail/detail.html?id=${examId}`;
}

// 跳转到创建页
function goToCreate() {
  location.href = '../create/create.html';
}

// 初始化
init();
