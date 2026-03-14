// 资源共享 - 详情页

// 数据状态
const state = {
  resourceId: null,
  resource: null,
  relatedResources: [],
  loading: true,
  downloading: false,
  downloadProgress: 0,
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
  }
};

// 初始化
function init() {
  // 获取URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get('id');
  
  if (!id) {
    alert('资源ID无效');
    history.back();
    return;
  }

  state.resourceId = id;
  loadResourceDetail();
  bindEvents();
}

// 绑定事件
function bindEvents() {
  // 下载按钮
  document.getElementById('downloadBtn').addEventListener('click', onDownload);
  
  // 返回列表
  document.getElementById('goToList').addEventListener('click', goToList);
  
  // 重新加载
  document.getElementById('retryBtn').addEventListener('click', loadResourceDetail);
}

// 加载资源详情
async function loadResourceDetail() {
  state.loading = true;
  updateUI();

  try {
    console.log('开始加载资源详情，ID:', state.resourceId);
    
    const { data, error } = await sharedResourcesAPI.getResource(state.resourceId);

    console.log('获取资源详情结果:', { data, error });

    if (error) {
      console.error('获取资源详情错误:', error);
      throw new Error('获取资源详情失败');
    }

    if (!data || data.length === 0) {
      throw new Error('资源不存在');
    }

    const resource = data[0];
    
    resource.created_at = formatDate(resource.created_at);
    resource.file_size = formatFileSize(resource.file_size);

    state.resource = resource;
    state.loading = false;

    updateUI();

    // 加载相关资源
    loadRelatedResources(resource.category, resource.id);
  } catch (err) {
    console.error('加载资源详情失败:', err);
    alert(err.message || '加载失败');
    state.loading = false;
    state.resource = null;
    updateUI();
  }
}

// 加载相关资源
async function loadRelatedResources(category, excludeId) {
  try {
    console.log('开始加载相关资源，分类:', category);
    
    const { data, error } = await sharedResourcesAPI.getResources({
      category: category,
      limit: 5,
      order: { column: 'download_count', ascending: false }
    });

    if (error) {
      console.error('获取相关资源错误:', error);
      return;
    }

    const relatedResources = (data || [])
      .filter(item => item.id !== excludeId)
      .slice(0, 4)
      .map(item => ({
        ...item,
        file_size: formatFileSize(item.file_size)
      }));

    state.relatedResources = relatedResources;
    updateRelatedResourcesUI();
  } catch (err) {
    console.error('加载相关资源失败:', err);
  }
}

// 更新UI
function updateUI() {
  const loadingState = document.getElementById('loadingState');
  const resourceContent = document.getElementById('resourceContent');
  const errorState = document.getElementById('errorState');

  if (state.loading) {
    loadingState.style.display = 'flex';
    resourceContent.style.display = 'none';
    errorState.style.display = 'none';
    return;
  }

  if (!state.resource) {
    loadingState.style.display = 'none';
    resourceContent.style.display = 'none';
    errorState.style.display = 'flex';
    return;
  }

  loadingState.style.display = 'none';
  resourceContent.style.display = 'block';
  errorState.style.display = 'none';

  const resource = state.resource;
  const className = state.categoryClassMap[resource.category];

  // 更新头部信息
  const typeIcon = document.getElementById('typeIcon');
  const resourceTypeIcon = document.getElementById('resourceTypeIcon');
  const resourceTitle = document.getElementById('resourceTitle');
  const typeTag = document.getElementById('typeTag');

  typeIcon.textContent = state.categoryIcons[resource.category] || '📄';
  resourceTypeIcon.className = `resource-type-icon ${className}`;
  resourceTitle.textContent = resource.title;
  typeTag.textContent = resource.category;
  typeTag.className = `type-tag ${className}`;

  // 更新上传者信息
  document.getElementById('schoolName').textContent = resource.school_name || '未知学校';
  document.getElementById('uploaderName').textContent = resource.uploader_name || '匿名用户';
  document.getElementById('createdAt').textContent = resource.created_at;

  // 更新资源描述
  const descriptionSection = document.getElementById('descriptionSection');
  const descriptionText = document.getElementById('descriptionText');
  if (resource.description) {
    descriptionText.textContent = resource.description;
    descriptionSection.style.display = 'block';
  } else {
    descriptionSection.style.display = 'none';
  }

  // 更新文件信息
  document.getElementById('fileFormat').textContent = resource.file_format || '未知';
  document.getElementById('fileSize').textContent = resource.file_size || '未知';
  document.getElementById('downloadCount').textContent = (resource.download_count || 0) + ' 次';

  // 更新下载按钮
  updateDownloadButton();
}

// 更新相关资源UI
function updateRelatedResourcesUI() {
  const relatedResources = document.getElementById('relatedResources');
  const relatedList = document.getElementById('relatedList');

  if (state.relatedResources.length === 0) {
    relatedResources.style.display = 'none';
    return;
  }

  relatedResources.style.display = 'block';
  
  relatedList.innerHTML = state.relatedResources.map(item => {
    const className = state.categoryClassMap[item.category];
    return `
      <div class="related-item" data-id="${item.id}">
        <div class="related-icon ${className}">
          <span>${state.categoryIcons[item.category] || '📄'}</span>
        </div>
        <div class="related-info">
          <span class="related-title">${item.title}</span>
          <div class="related-meta">
            <span class="related-type ${className}">${item.category}</span>
            <span class="related-downloads">⬇️ ${item.download_count || 0}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 绑定点击事件
  relatedList.querySelectorAll('.related-item').forEach(item => {
    item.addEventListener('click', onRelatedResourceTap);
  });
}

// 更新下载按钮
function updateDownloadButton() {
  const downloadBtn = document.getElementById('downloadBtn');
  const downloadBtnText = document.getElementById('downloadBtnText');

  if (state.downloading) {
    downloadBtn.disabled = true;
    downloadBtnText.textContent = `下载中 ${state.downloadProgress}%...`;
  } else {
    downloadBtn.disabled = false;
    downloadBtnText.textContent = '⬇️ 立即下载';
  }
}

// 下载资源
async function onDownload() {
  const resource = state.resource;
  
  if (!resource) {
    alert('资源信息无效');
    return;
  }

  // 模拟下载过程
  state.downloading = true;
  state.downloadProgress = 0;
  updateDownloadButton();

  // 模拟下载进度
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      
      setTimeout(() => {
        state.downloading = false;
        state.downloadProgress = 0;
        updateDownloadButton();
        
        incrementDownloadCount();
        
        alert('下载成功');
      }, 500);
    }
    state.downloadProgress = Math.floor(progress);
    updateDownloadButton();
  }, 200);
}

// 增加下载次数
async function incrementDownloadCount() {
  try {
    const { error } = await sharedResourcesAPI.incrementDownload(state.resourceId);
    
    if (error) {
      console.error('增加下载次数错误:', error);
      return;
    }

    const resource = state.resource;
    resource.download_count = (resource.download_count || 0) + 1;
    document.getElementById('downloadCount').textContent = resource.download_count + ' 次';
    
    console.log('下载次数已更新');
  } catch (err) {
    console.error('增加下载次数失败:', err);
  }
}

// 相关资源点击
function onRelatedResourceTap(e) {
  const item = e.currentTarget;
  const id = item.dataset.id;
  location.href = `detail.html?id=${id}`;
}

// 返回列表
function goToList() {
  history.back();
}

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '未知';
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (!bytes) return '未知';
  if (typeof bytes === 'string') return bytes;
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
