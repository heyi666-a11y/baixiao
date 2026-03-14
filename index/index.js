// 首页数据
const pageData = {
  // 学校列表
  schoolList: [
    {
      id: 1,
      name: '广东北江中学',
      description: '广东省首批国家级示范性普通高中',
      logo: '../../images/new-school-logo.jpg',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      tags: ['示范高中', '省重点']
    }
  ],
  // 资源列表
  resourceList: [],
  // 最新动态
  newsList: [],
  // 加载状态
  loadingResources: true,
  loadingNews: true,
  // 统计数据
  stats: {
    schoolCount: 1,
    resourceCount: 0,
    examCount: 6,
    userCount: '2.5k'
  }
};

// 页面加载时执行
document.addEventListener('DOMContentLoaded', function() {
  loadData();
  loadResources();
  loadNews();
});

// 加载数据
function loadData() {
  console.log('加载百校联盟首页数据');
  renderSchools();
  updateStats();
}

// 渲染学校列表
function renderSchools() {
  const schoolsListEl = document.getElementById('schoolsList');
  if (!schoolsListEl || pageData.schoolList.length === 0) return;

  const html = pageData.schoolList.map(item => {
    const tagsHtml = item.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    return `
      <div class="school-card" onclick="enterSchool(${item.id})" data-id="${item.id}">
        <div class="school-card-bg" style="background: ${item.gradient}"></div>
        <div class="school-card-content">
          <img class="school-logo" src="${item.logo}" alt="${item.name}"/>
          <div class="school-info">
            <span class="school-name">${item.name}</span>
            <span class="school-desc">${item.description}</span>
            <div class="school-tags">
              ${tagsHtml}
            </div>
          </div>
          <div class="enter-btn">
            <span class="enter-text">进入</span>
            <span class="enter-arrow">→</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  schoolsListEl.innerHTML = html;
}

// 更新统计数据
function updateStats() {
  document.getElementById('statSchoolCount').textContent = pageData.stats.schoolCount;
  document.getElementById('statResourceCount').textContent = pageData.stats.resourceCount;
  document.getElementById('statExamCount').textContent = pageData.stats.examCount;
  document.getElementById('statUserCount').textContent = pageData.stats.userCount;
}

// 加载资源列表
async function loadResources() {
  pageData.loadingResources = true;
  updateResourcesUI();

  try {
    // 检查 supabaseAPI 是否可用
    if (typeof supabaseAPI !== 'undefined' && supabaseAPI.sharedResourcesAPI && supabaseAPI.sharedResourcesAPI.getResources) {
      const result = await supabaseAPI.sharedResourcesAPI.getResources({ limit: 4 });
      console.log('加载资源结果:', result);

      if (result.data && Array.isArray(result.data)) {
        pageData.resourceList = result.data;
        pageData.stats.resourceCount = result.data.length;
      } else {
        pageData.resourceList = [];
        pageData.stats.resourceCount = 0;
      }
    } else {
      console.log('supabaseAPI 不可用，使用空数据');
      pageData.resourceList = [];
      pageData.stats.resourceCount = 0;
    }
  } catch (err) {
    console.error('加载资源失败:', err);
    pageData.resourceList = [];
    pageData.stats.resourceCount = 0;
  } finally {
    pageData.loadingResources = false;
    updateResourcesUI();
    updateStats();
  }
}

// 更新资源列表UI
function updateResourcesUI() {
  const loadingEl = document.getElementById('resourcesLoading');
  const listEl = document.getElementById('resourcesList');
  const emptyEl = document.getElementById('resourcesEmpty');

  if (pageData.loadingResources) {
    loadingEl.style.display = 'flex';
    listEl.style.display = 'none';
    emptyEl.style.display = 'none';
  } else if (pageData.resourceList.length > 0) {
    loadingEl.style.display = 'none';
    listEl.style.display = 'flex';
    emptyEl.style.display = 'none';
    renderResources();
  } else {
    loadingEl.style.display = 'none';
    listEl.style.display = 'none';
    emptyEl.style.display = 'flex';
  }
}

// 渲染资源列表
function renderResources() {
  const listEl = document.getElementById('resourcesList');
  if (!listEl) return;

  const html = pageData.resourceList.map(item => `
    <div class="resource-item" onclick="downloadResource(${item.id})" data-id="${item.id}">
      <div class="resource-icon-wrapper" style="background: ${item.iconBg || '#e3f2fd'}">
        <span class="resource-icon">${item.icon || '📄'}</span>
      </div>
      <div class="resource-info">
        <span class="resource-title">${item.title}</span>
        <div class="resource-meta">
          <span class="resource-school">${item.uploader || '学校管理员'}</span>
          <span class="resource-dot">·</span>
          <span class="resource-time">${item.created_at}</span>
        </div>
      </div>
      <div class="resource-download">
        <span class="download-icon">⬇️</span>
        <span class="download-count">${item.download_count || 0}</span>
      </div>
    </div>
  `).join('');

  listEl.innerHTML = html;
}

// 加载最新动态
async function loadNews() {
  pageData.loadingNews = true;
  updateNewsUI();

  try {
    // 检查 supabaseAPI 是否可用
    if (typeof supabaseAPI !== 'undefined' && supabaseAPI.getNews) {
      const result = await supabaseAPI.getNews({ limit: 3 });
      console.log('加载新闻结果:', result);

      if (result.data && Array.isArray(result.data)) {
        pageData.newsList = result.data;
      } else {
        pageData.newsList = [];
      }
    } else {
      console.log('supabaseAPI 不可用，使用空数据');
      pageData.newsList = [];
    }
  } catch (err) {
    console.error('加载新闻失败:', err);
    pageData.newsList = [];
  } finally {
    pageData.loadingNews = false;
    updateNewsUI();
  }
}

// 更新新闻列表UI
function updateNewsUI() {
  const loadingEl = document.getElementById('newsLoading');
  const listEl = document.getElementById('newsList');
  const emptyEl = document.getElementById('newsEmpty');

  if (pageData.loadingNews) {
    loadingEl.style.display = 'flex';
    listEl.style.display = 'none';
    emptyEl.style.display = 'none';
  } else if (pageData.newsList.length > 0) {
    loadingEl.style.display = 'none';
    listEl.style.display = 'flex';
    emptyEl.style.display = 'none';
    renderNews();
  } else {
    loadingEl.style.display = 'none';
    listEl.style.display = 'none';
    emptyEl.style.display = 'flex';
  }
}

// 渲染新闻列表
function renderNews() {
  const listEl = document.getElementById('newsList');
  if (!listEl) return;

  const html = pageData.newsList.map(item => {
    const thumbHtml = item.cover_image
      ? `<img class="news-thumb" src="${item.cover_image}" alt="${item.title}"/>`
      : `<div class="news-thumb news-thumb-placeholder"><span class="news-thumb-icon">📰</span></div>`;

    return `
      <div class="news-item" onclick="viewNewsDetail(${item.id})" data-id="${item.id}">
        ${thumbHtml}
        <div class="news-info">
          <span class="news-title">${item.title}</span>
          <span class="news-summary">${item.summary}</span>
          <div class="news-meta">
            <span class="news-date">${item.published_at || item.created_at}</span>
            <span class="news-views">👁 ${item.view_count || 0}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  listEl.innerHTML = html;
}

// 进入学校系统
function enterSchool(schoolId) {
  console.log('进入学校系统:', schoolId);
  location.href = '../school/index/index.html';
}

// 查看全部学校
function viewAllSchools() {
  console.log('进入学校列表页');
  location.href = '../schools/list/list.html';
}

// 进入联考管理
function enterExamManage() {
  location.href = '../joint-exam/index/index.html';
}

// 查看全部资源
function viewAllResources() {
  location.href = '../resources/list/list.html';
}

// 下载资源
function downloadResource(resourceId) {
  const resource = pageData.resourceList.find(item => item.id === resourceId);
  if (resource) {
    location.href = `../resources/detail/detail.html?id=${resourceId}`;
  }
}

// 查看更多新闻
function viewAllNews() {
  location.href = '../news/list/list.html';
}

// 查看新闻详情
function viewNewsDetail(id) {
  location.href = `../news/detail/detail.html?id=${id}`;
}
