// 学校列表页
(function() {
  const schoolList = [
    {
      id: 1,
      name: '广东北江中学',
      description: '广东省首批国家级示范性普通高中',
      logo: '/wangye/images/new-school-logo.jpg',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      tags: ['示范高中', '省重点'],
      isTest: false
    },
    {
      id: 2,
      name: '测试学校1',
      description: '联盟测试学校，敬请期待',
      logo: '/wangye/images/new-school-logo.jpg',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      tags: ['测试中'],
      isTest: true
    },
    {
      id: 3,
      name: '测试学校2',
      description: '联盟测试学校，敬请期待',
      logo: '/wangye/images/new-school-logo.jpg',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      tags: ['测试中'],
      isTest: true
    },
    {
      id: 4,
      name: '测试学校3',
      description: '联盟测试学校，敬请期待',
      logo: '/wangye/images/new-school-logo.jpg',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      tags: ['测试中'],
      isTest: true
    }
  ];

  function init() {
    console.log('学校列表页加载');
    renderSchoolList();
  }

  function renderSchoolList() {
    const container = document.getElementById('schoolsList');
    const countEl = document.getElementById('schoolCount');
    
    if (countEl) {
      countEl.textContent = schoolList.length;
    }
    
    if (!container) return;
    
    container.innerHTML = schoolList.map(item => `
      <div class="school-card ${item.isTest ? 'test-school' : ''}" 
           onclick="enterSchool(${item.id}, ${item.isTest})"
           data-id="${item.id}"
           data-istest="${item.isTest}">
        <div class="school-card-bg" style="background: ${item.gradient}"></div>
        <div class="school-card-content">
          <img class="school-logo" src="${item.logo}" alt="${item.name}"/>
          <div class="school-info">
            <div class="school-name-wrapper">
              <span class="school-name">${item.name}</span>
              ${item.isTest ? '<span class="test-badge">测试</span>' : ''}
            </div>
            <span class="school-desc">${item.description}</span>
            <div class="school-tags">
              ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
          <div class="enter-btn">
            <span class="enter-text">进入</span>
            <span class="enter-arrow">→</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // 进入学校系统
  window.enterSchool = function(id, isTest) {
    if (isTest) {
      if (window.showToast) {
        window.showToast('测试学校，敬请期待');
      } else {
        alert('测试学校，敬请期待');
      }
      return;
    }

    console.log('进入学校系统:', id);
    location.href = '../school/index/index.html';
  };

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
