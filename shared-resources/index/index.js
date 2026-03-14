// 资源共享 - 列表页

// 数据状态
const state = {
  resources: [],
  filteredResources: [],
  categories: ['全部', '试卷', '教案', '课件', '试题', '其他'],
  categoryIcons: {
    '试卷': '📝',
    '教案': '📖',
    '课件': '📊',
    '试题': '❓',
    '其他': '📎'
  },
  categoryClassMap: {
    '试卷': 'shijuan',
    '教案': 'jiaoan',
    '课件': 'kejian',
    '试题': 'shiti',
    '其他': 'qita'
  },
  searchKeyword: '',
  selectedCategory: '全部',
  loading: false,
  hasMore: true,
  page: 1,
  pageSize: 10
};

// 初始化
function init() {
  renderCategories();
  loadResources();
  bindEvents();
}

// 绑定事件
function bindEvents() {
  // 搜索输入
  const searchInput = document.getElementById('searchInput');
  const clearSearch = document.getElementById('clearSearch');
  
  searchInput.addEventListener('input', onSearchInput);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      onSearchConfirm();
    }
  });
  
  clearSearch.addEventListener('click', clearSearchHandler);
  
  // 上传按钮
  document.getElementById('goToUpload').addEventListener('click', goToUpload);
  
  // 滚动加载更多
  window.addEventListener('scroll', onScroll);
}

// 渲染分类
function renderCategories() {
  const container = document.getElementById('categoryScroll');
  container.innerHTML = state.categories.map(category => `
    <div class="category-item ${state.selectedCategory === category ? 'active' : ''}" 
         data-category="${category}">
      ${category}
    </div>
  `).join('');
  
  // 绑定分类点击事件
  container.querySelectorAll('.category-item').forEach(item => {
    item.addEventListener('click', onCategoryChange);
  });
}

// 加载资源
async function loadResources() {
  if (state.loading) return;

  state.loading = true;
  updateLoadingUI();

  try {
    console.log('开始加载资源列表，页码:', state.page);
    
    const options = {
      limit: state.pageSize,
      offset: (state.page - 1) * state.pageSize,
      order: { column: 'created_at', ascending: false }
    };

    if (state.selectedCategory !== '全部') {
      options.category = state.selectedCategory;
    }

    if (state.searchKeyword) {
      options.search = state.searchKeyword;
    }

    const { data, error } = await sharedResourcesAPI.getResources(options);

    console.log('加载资源列表结果:', { data, error });

    if (error) {
      console.error('加载资源列表错误:', error);
      throw new Error('加载资源失败: ' + (error.message || JSON.stringify(error)));
    }

    const resources = data || [];
    console.log('获取到的资源数量:', resources.length);
    
    const formattedResources = resources.map(item => ({
      ...item,
      created_at: formatDate(item.created_at),
      file_size: formatFileSize(item.file_size)
    }));

    state.hasMore = resources.length === state.pageSize;

    if (state.page === 1) {
      state.resources = formattedResources;
    } else {
      state.resources = [...state.resources, ...formattedResources];
    }

    state.loading = false;
    filterResources();
  } catch (err) {
    console.error('加载资源失败:', err);
    alert(err.message || '加载资源失败');
    state.loading = false;
    updateLoadingUI();
  }
}

// 过滤资源
function filterResources() {
  let filtered = [...state.resources];

  if (state.searchKeyword) {
    const keyword = state.searchKeyword.toLowerCase();
    filtered = filtered.filter(resource =>
      (resource.title && resource.title.toLowerCase().includes(keyword)) ||
      (resource.school_name && resource.school_name.toLowerCase().includes(keyword)) ||
      (resource.description && resource.description.toLowerCase().includes(keyword))
    );
  }

  if (state.selectedCategory !== '全部') {
    filtered = filtered.filter(resource =>
      resource.category === state.selectedCategory
    );
  }

  state.filteredResources = filtered;
  renderResources();
}

// 渲染资源列表
function renderResources() {
  const container = document.getElementById('resourceList');
  const emptyState = document.getElementById('emptyState');
  const loadMore = document.getElementById('loadMore');
  const noMore = document.getElementById('noMore');

  if (state.filteredResources.length === 0 && !state.loading) {
    container.innerHTML = '';
    emptyState.style.display = 'flex';
    loadMore.style.display = 'none';
    noMore.style.display = 'none';
    return;
  }

  emptyState.style.display = 'none';
  
  container.innerHTML = state.filteredResources.map(item => `
    <div class="resource-card" data-id="${item.id}">
      <div class="resource-icon ${state.categoryClassMap[item.category]}">
        <span>${state.categoryIcons[item.category] || '📄'}</span>
      </div>
      
      <div class="resource-info">
        <div class="resource-header">
          <span class="resource-title">${item.title}</span>
          <div class="type-tag ${state.categoryClassMap[item.category]}">${item.category}</div>
        </div>
        
        <div class="resource-meta">
          <span class="meta-item">
            <span class="meta-icon">🏫</span>
            ${item.school_name || '未知学校'}
          </span>
          <span class="meta-item">
            <span class="meta-icon">📅</span>
            ${item.created_at}
          </span>
        </div>
        
        <div class="resource-stats">
          <span class="stat-item">
            <span class="stat-icon">⬇️</span>
            ${item.download_count || 0} 次下载
          </span>
          <span class="stat-item">
            <span class="stat-icon">📦</span>
            ${item.file_size || '未知'}
          </span>
        </div>
      </div>
    </div>
  `).join('');

  // 绑定资源卡片点击事件
  container.querySelectorAll('.resource-card').forEach(card => {
    card.addEventListener('click', onResourceTap);
  });

  // 更新加载更多状态
  if (state.loading) {
    loadMore.style.display = 'none';
    noMore.style.display = 'none';
  } else if (state.hasMore && state.filteredResources.length > 0) {
    loadMore.style.display = 'block';
    noMore.style.display = 'none';
  } else if (!state.hasMore && state.filteredResources.length > 0) {
    loadMore.style.display = 'none';
    noMore.style.display = 'block';
  } else {
    loadMore.style.display = 'none';
    noMore.style.display = 'none';
  }
}

// 更新加载UI
function updateLoadingUI() {
  const loading = document.getElementById('loading');
  loading.style.display = state.loading ? 'flex' : 'none';
}

// 搜索输入
function onSearchInput(e) {
  state.searchKeyword = e.target.value;
  document.getElementById('clearSearch').style.display = state.searchKeyword ? 'block' : 'none';
  filterResources();
}

// 搜索确认
function onSearchConfirm() {
  state.page = 1;
  state.resources = [];
  loadResources();
}

// 清除搜索
function clearSearchHandler() {
  state.searchKeyword = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('clearSearch').style.display = 'none';
  state.page = 1;
  state.resources = [];
  loadResources();
}

// 分类切换
function onCategoryChange(e) {
  const category = e.target.dataset.category;
  state.selectedCategory = category;
  state.page = 1;
  state.resources = [];
  renderCategories();
  loadResources();
}

// 资源点击
function onResourceTap(e) {
  const card = e.currentTarget;
  const id = card.dataset.id;
  location.href = `../detail/detail.html?id=${id}`;
}

// 去上传页面
function goToUpload() {
  location.href = '../upload/upload.html';
}

// 滚动加载
function onScroll() {
  const scrollHeight = document.documentElement.scrollHeight;
  const scrollTop = document.documentElement.scrollTop;
  const clientHeight = document.documentElement.clientHeight;
  
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    if (state.hasMore && !state.loading) {
      state.page++;
      loadResources();
    }
  }
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '未知';
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return minutes < 1 ? '刚刚' : `${minutes}分钟前`;
  }
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`;
  }
  if (diff < 604800000) {
    return `${Math.floor(diff / 86400000)}天前`;
  }
  
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes) return '未知';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
