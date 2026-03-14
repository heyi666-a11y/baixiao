// 成长档案页面
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
    { id: 1, type: 'honor', title: '数学竞赛一等奖', date: '2024-09-20', description: '在市级数学竞赛中表现优异，获得一等奖。', images: [], teacher: '刘老师', status: 'approved' },
    { id: 2, type: 'activity', title: '校园运动会', date: '2024-10-15', description: '参加校园运动会，获得100米短跑第三名。', images: [], teacher: '体育老师', status: 'approved' },
    { id: 3, type: 'work', title: '科技创新作品', date: '2024-11-01', description: '设计制作了一个智能垃圾分类装置，获得老师好评。', images: [], teacher: '科技老师', status: 'pending' },
    { id: 4, type: 'evaluation', title: '学期综合评价', date: '2024-11-15', description: '本学期学习态度端正，成绩稳步提升，希望继续保持。', images: [], teacher: '班主任', status: 'approved' }
  ];

  const typeMap = {
    'activity': { text: '活动参与', icon: '🎯' },
    'honor': { text: '荣誉奖项', icon: '🏆' },
    'work': { text: '作品展示', icon: '🎨' },
    'evaluation': { text: '综合评价', icon: '📝' }
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
        loadPortfolio()
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

  async function loadPortfolio() {
    await new Promise(resolve => setTimeout(resolve, 200));
    data.records = mockRecords;
  }

  function getFilteredRecords() {
    if (data.filterType === 'all') return data.records;
    return data.records.filter(r => r.type === data.filterType);
  }

  function renderPage() {
    renderStudentHeader();
    renderPortfolio();
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

  function renderPortfolio() {
    const list = document.getElementById('portfolioList');
    const emptyState = document.getElementById('emptyState');
    const filtered = getFilteredRecords();
    
    if (filtered.length === 0) {
      list.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }
    
    emptyState.style.display = 'none';
    list.innerHTML = filtered.map(item => {
      const typeInfo = typeMap[item.type];
      return `
        <div class="portfolio-item">
          <div class="portfolio-header">
            <div class="type-icon ${item.type}">
              <span>${typeInfo.icon}</span>
            </div>
            <div class="portfolio-title-info">
              <span class="portfolio-title">${item.title}</span>
              <span class="portfolio-date">${item.date}</span>
            </div>
            <span class="portfolio-type-tag ${item.type}">${typeInfo.text}</span>
          </div>
          <div class="portfolio-content">
            <p class="portfolio-description">${item.description}</p>
            ${item.images && item.images.length > 0 ? `
              <div class="portfolio-images">
                ${item.images.map(img => `<img class="portfolio-image" src="${img}" alt="作品图片"/>`).join('')}
              </div>
            ` : ''}
          </div>
          <div class="portfolio-footer">
            <span class="portfolio-teacher">记录人: ${item.teacher}</span>
            <span class="portfolio-status ${item.status}">${item.status === 'approved' ? '已审核' : '待审核'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function bindEvents() {
    document.getElementById('typeFilter').addEventListener('click', function(e) {
      const item = e.target.closest('.filter-item');
      if (item) {
        data.filterType = item.dataset.type;
        
        document.querySelectorAll('.filter-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        renderPortfolio();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
