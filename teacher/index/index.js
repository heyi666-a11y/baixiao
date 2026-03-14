// 教师列表页面
let teachers = [];
let filteredTeachers = [];
let searchKeyword = '';
let selectedSubject = '全部';
let loading = false;
let hasMore = true;
let page = 1;
const pageSize = 10;
let isAdmin = false;

// 页面加载
window.onload = function() {
  loadTeachers();
  checkAdminRole();
  initScrollEvent();
};

// 初始化滚动事件
function initScrollEvent() {
  window.addEventListener('scroll', function() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 100) {
      if (hasMore && !loading) {
        loadMoreTeachers();
      }
    }
  });
}

// 检查是否为管理员
function checkAdminRole() {
  const userInfo = getStorage('userInfo');
  if (userInfo && userInfo.role === 'admin') {
    isAdmin = true;
    document.getElementById('addBtn').style.display = 'flex';
  } else {
    isAdmin = false;
    document.getElementById('addBtn').style.display = 'none';
  }
}

// 加载教师列表
async function loadTeachers() {
  if (loading) return;
  
  loading = true;
  showLoading();
  
  try {
    console.log('开始加载教师列表，页码:', page);
    
    // 使用 Supabase API
    let result;
    if (typeof supabaseAPI !== 'undefined' && supabaseAPI.teachersAPI && supabaseAPI.teachersAPI.getTeachers) {
      result = await supabaseAPI.teachersAPI.getTeachers({
        limit: pageSize,
        offset: (page - 1) * pageSize
      });
    } else {
      // 使用本地模拟数据
      result = getMockTeachers();
    }
    
    console.log('加载教师列表结果:', result);
    
    if (result.error) {
      throw new Error('加载教师列表失败: ' + (result.error.message || JSON.stringify(result.error)));
    }
    
    const teacherList = result.data || [];
    console.log('获取到的教师数量:', teacherList.length);
    hasMore = teacherList.length === pageSize;
    
    if (page === 1) {
      teachers = teacherList;
    } else {
      teachers = [...teachers, ...teacherList];
    }
    
    filterTeachers();
  } catch (err) {
    console.error('加载教师列表失败:', err);
    showToast(err.message || '加载教师列表失败');
  } finally {
    loading = false;
    hideLoading();
  }
}

// 加载更多教师
function loadMoreTeachers() {
  if (hasMore && !loading) {
    page++;
    loadTeachers();
  }
}

// 搜索输入
function onSearchInput(event) {
  searchKeyword = event.target.value;
  filterTeachers();
  
  // 显示/隐藏清除按钮
  const searchClear = document.getElementById('searchClear');
  if (searchKeyword) {
    searchClear.style.display = 'block';
  } else {
    searchClear.style.display = 'none';
  }
}

// 清除搜索
function clearSearch() {
  searchKeyword = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchClear').style.display = 'none';
  filterTeachers();
}

// 科目切换
function onSubjectChange(event) {
  const subject = event.currentTarget.dataset.subject;
  selectedSubject = subject;
  
  // 更新筛选按钮状态
  document.querySelectorAll('.filter-item').forEach(item => {
    item.classList.remove('active');
  });
  event.currentTarget.classList.add('active');
  
  filterTeachers();
}

// 筛选教师
function filterTeachers() {
  let filtered = [...teachers];
  
  // 搜索过滤
  if (searchKeyword) {
    const keyword = searchKeyword.toLowerCase();
    filtered = filtered.filter(teacher => 
      (teacher.name && teacher.name.toLowerCase().includes(keyword)) ||
      (teacher.subject && teacher.subject.toLowerCase().includes(keyword))
    );
  }
  
  // 科目过滤
  if (selectedSubject !== '全部') {
    filtered = filtered.filter(teacher => 
      teacher.subject === selectedSubject
    );
  }
  
  filteredTeachers = filtered;
  renderTeacherList();
}

// 渲染教师列表
function renderTeacherList() {
  const listEl = document.getElementById('teacherList');
  const loadMoreEl = document.getElementById('loadMore');
  
  if (filteredTeachers.length === 0) {
    listEl.innerHTML = '<div class="empty-state"><span class="empty-text">暂无教师数据</span></div>';
    loadMoreEl.style.display = 'none';
    return;
  }
  
  listEl.innerHTML = filteredTeachers.map(teacher => {
    const avatarClass = getAvatarClass(teacher.name);
    const surname = getSurname(teacher.name);
    
    return `
      <div class="teacher-card" onclick="onTeacherTap('${teacher.id}', '${teacher.name}')">
        <div class="teacher-avatar ${avatarClass}">
          <span class="avatar-text">${surname}</span>
        </div>
        <div class="teacher-info">
          <div class="info-row">
            <span class="teacher-name">${teacher.name}</span>
            <span class="teacher-title">${teacher.title || ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">科目：</span>
            <span class="info-value">${teacher.subject}</span>
          </div>
          <div class="info-row">
            <span class="info-label">部门：</span>
            <span class="info-value">${teacher.department || ''}</span>
          </div>
        </div>
        <div class="teacher-arrow">
          <span>→</span>
        </div>
      </div>
    `;
  }).join('');
  
  loadMoreEl.style.display = hasMore ? 'flex' : 'none';
}

// 获取姓氏头像样式类
function getAvatarClass(name) {
  if (!name) return 'bg-0';
  const code = name.charCodeAt(0);
  return `bg-${code % 5}`;
}

// 获取姓氏
function getSurname(name) {
  return name ? name.charAt(0) : '教';
}

// 点击教师卡片
function onTeacherTap(id, name) {
  // 跳转到密码验证页面
  window.location.href = `../login/login.html?teacherId=${id}&teacherName=${encodeURIComponent(name)}`;
}

// 添加教师
function onAddTeacher() {
  window.location.href = `../edit/edit.html?mode=add`;
}

// 返回
function goBack() {
  window.history.back();
}

// 显示加载中
function showLoading() {
  document.getElementById('loading').style.display = 'flex';
}

// 隐藏加载中
function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

// 显示提示
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 9999;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 2000);
}

// 获取本地存储
function getStorage(key, defaultValue = null) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    console.error('Storage get error:', e);
    return defaultValue;
  }
}

// 模拟教师数据
function getMockTeachers() {
  const mockData = [
    {
      id: '1',
      name: '张老师',
      subject: '数学',
      title: '高级教师',
      department: '数学教研组',
      phone: '13800138001',
      email: 'zhang@school.com',
      gender: '男',
      hire_date: '2020-09-01',
      status: '在职'
    },
    {
      id: '2',
      name: '李老师',
      subject: '语文',
      title: '一级教师',
      department: '语文教研组',
      phone: '13800138002',
      email: 'li@school.com',
      gender: '女',
      hire_date: '2019-09-01',
      status: '在职'
    },
    {
      id: '3',
      name: '王老师',
      subject: '英语',
      title: '二级教师',
      department: '英语教研组',
      phone: '13800138003',
      email: 'wang@school.com',
      gender: '女',
      hire_date: '2021-09-01',
      status: '在职'
    },
    {
      id: '4',
      name: '刘老师',
      subject: '物理',
      title: '高级教师',
      department: '物理教研组',
      phone: '13800138004',
      email: 'liu@school.com',
      gender: '男',
      hire_date: '2018-09-01',
      status: '在职'
    },
    {
      id: '5',
      name: '陈老师',
      subject: '化学',
      title: '一级教师',
      department: '化学教研组',
      phone: '13800138005',
      email: 'chen@school.com',
      gender: '男',
      hire_date: '2020-09-01',
      status: '在职'
    }
  ];
  
  return {
    data: mockData,
    error: null
  };
}
