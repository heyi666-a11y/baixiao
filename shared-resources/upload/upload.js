// 资源共享 - 上传页

// 数据状态
const state = {
  formData: {
    title: '',
    category: '',
    description: '',
    schoolName: '',
    uploaderName: ''
  },
  selectedFile: null,
  categories: ['试卷', '教案', '课件', '试题', '其他'],
  categoryIcons: {
    '试卷': '📝',
    '教案': '📖',
    '课件': '📊',
    '试题': '❓',
    '其他': '📎'
  },
  fileIcons: {
    'pdf': '📕',
    'doc': '📘',
    'docx': '📘',
    'ppt': '📙',
    'pptx': '📙',
    'xls': '📗',
    'xlsx': '📗',
    'zip': '📦',
    'rar': '📦'
  },
  uploading: false,
  uploadProgress: 0,
  isFormValid: false
};

// 初始化
function init() {
  console.log('上传页面加载');
  renderTypeSelector();
  bindEvents();
}

// 渲染类型选择器
function renderTypeSelector() {
  const container = document.getElementById('typeSelector');
  container.innerHTML = state.categories.map(category => `
    <div class="type-option ${state.formData.category === category ? 'active' : ''}" 
         data-category="${category}">
      <span class="type-icon">${state.categoryIcons[category]}</span>
      <span class="type-name">${category}</span>
    </div>
  `).join('');

  // 绑定点击事件
  container.querySelectorAll('.type-option').forEach(option => {
    option.addEventListener('click', onCategorySelect);
  });
}

// 绑定事件
function bindEvents() {
  // 文件上传区域
  document.getElementById('fileUploadArea').addEventListener('click', chooseFile);
  document.getElementById('removeFile').addEventListener('click', (e) => {
    e.stopPropagation();
    removeFile();
  });

  // 输入框
  document.getElementById('titleInput').addEventListener('input', (e) => {
    state.formData.title = e.target.value;
    validateForm();
  });

  document.getElementById('schoolNameInput').addEventListener('input', (e) => {
    state.formData.schoolName = e.target.value;
    validateForm();
  });

  document.getElementById('uploaderNameInput').addEventListener('input', (e) => {
    state.formData.uploaderName = e.target.value;
    validateForm();
  });

  // 文本域
  const descriptionInput = document.getElementById('descriptionInput');
  descriptionInput.addEventListener('input', (e) => {
    state.formData.description = e.target.value;
    document.getElementById('charCount').textContent = `${e.target.value.length}/500`;
    validateForm();
  });

  // 提交按钮
  document.getElementById('submitBtn').addEventListener('click', onSubmit);
}

// 选择文件
function chooseFile() {
  if (state.selectedFile) return;

  // 模拟文件选择
  const options = ['从聊天记录选择', '从本地选择', '拍照或录像'];
  const choice = confirm('选择文件来源:\n1. 从聊天记录选择\n2. 从本地选择\n3. 拍照或录像');
  
  if (choice) {
    simulateFileSelection();
  }
}

// 模拟文件选择
function simulateFileSelection() {
  const mockFiles = [
    { name: '2024年期中数学试卷.pdf', size: '2.5 MB', format: 'pdf' },
    { name: '高中物理教案模板.docx', size: '856 KB', format: 'docx' },
    { name: '化学实验课件.pptx', size: '15.2 MB', format: 'pptx' },
    { name: '英语听力试题.mp3', size: '8.7 MB', format: 'mp3' }
  ];
  
  const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
  
  state.selectedFile = randomFile;
  updateFileUI();
  validateForm();
  
  alert('已选择文件');
}

// 更新文件UI
function updateFileUI() {
  const filePlaceholder = document.getElementById('filePlaceholder');
  const selectedFile = document.getElementById('selectedFile');
  const fileIcon = document.getElementById('fileIcon');
  const fileName = document.getElementById('fileName');
  const fileSize = document.getElementById('fileSize');

  if (state.selectedFile) {
    filePlaceholder.style.display = 'none';
    selectedFile.style.display = 'flex';
    fileIcon.textContent = state.fileIcons[state.selectedFile.format] || '📄';
    fileName.textContent = state.selectedFile.name;
    fileSize.textContent = state.selectedFile.size;
  } else {
    filePlaceholder.style.display = 'block';
    selectedFile.style.display = 'none';
  }
}

// 移除已选文件
function removeFile() {
  state.selectedFile = null;
  updateFileUI();
  validateForm();
}

// 选择分类
function onCategorySelect(e) {
  const option = e.currentTarget;
  const category = option.dataset.category;
  
  state.formData.category = category;
  renderTypeSelector();
  validateForm();
}

// 验证表单
function validateForm() {
  const { formData, selectedFile } = state;
  const isValid = selectedFile && 
                 formData.title.trim() && 
                 formData.category &&
                 formData.schoolName.trim();
  
  state.isFormValid = isValid;
  
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = !isValid || state.uploading;
}

// 提交表单
async function onSubmit() {
  if (!state.isFormValid || state.uploading) {
    return;
  }

  const { formData, selectedFile } = state;
  
  // 开始上传
  state.uploading = true;
  state.uploadProgress = 0;
  updateSubmitButton();
  validateForm();

  // 显示上传进度
  document.getElementById('uploadProgress').style.display = 'block';

  // 模拟上传进度
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 20;
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
      
      setTimeout(() => {
        saveResourceData();
      }, 500);
    }
    state.uploadProgress = Math.floor(progress);
    updateProgressUI();
  }, 300);
}

// 更新进度UI
function updateProgressUI() {
  document.getElementById('progressFill').style.width = `${state.uploadProgress}%`;
  document.getElementById('progressText').textContent = `上传中 ${state.uploadProgress}%`;
}

// 更新提交按钮
function updateSubmitButton() {
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');

  if (state.uploading) {
    submitBtnText.textContent = '上传中...';
  } else {
    submitBtnText.textContent = '确认上传';
  }
}

// 保存资源数据
async function saveResourceData() {
  try {
    const { formData, selectedFile } = state;

    const resourceData = {
      title: formData.title.trim(),
      category: formData.category,
      description: formData.description.trim(),
      file_name: selectedFile.name,
      file_size: selectedFile.size,
      file_format: selectedFile.format,
      file_url: '',
      school_name: formData.schoolName.trim(),
      uploader_name: formData.uploaderName.trim() || '匿名用户',
      download_count: 0,
      created_at: new Date().toISOString()
    };

    console.log('准备保存资源数据:', resourceData);

    // 保存到数据库
    const { data, error } = await supabase.post('shared_resources', resourceData);

    if (error) {
      console.error('保存资源失败:', error);
      throw new Error('保存资源失败: ' + (error.message || '未知错误'));
    }

    console.log('资源保存成功:', data);

    state.uploading = false;
    updateSubmitButton();

    alert('上传成功');

    // 返回列表页
    setTimeout(() => {
      history.back();
    }, 1500);

  } catch (err) {
    console.error('保存资源失败:', err);
    state.uploading = false;
    updateSubmitButton();
    validateForm();
    
    alert(err.message || '上传失败');
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
