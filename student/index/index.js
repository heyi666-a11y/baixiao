// 学生列表页面
(function() {
  // 页面数据
  const data = {
    students: [],
    filteredStudents: [],
    classes: ['全部', '高一1班', '高一2班', '高一3班', '高一4班', '高一5班', '高一6班', '高一7班', '高一8班', '高一9班', '高一10班', '高二1班', '高二2班', '高二3班', '高二4班', '高二5班', '高二6班', '高二7班', '高二8班', '高二9班', '高二10班', '高三1班', '高三2班', '高三3班', '高三4班', '高三5班', '高三6班', '高三7班', '高三8班', '高三9班', '高三10班'],
    searchKeyword: '',
    selectedClass: '全部',
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    isAdmin: false
  };

  // 模拟学生数据
  const mockStudents = [
    { id: '1', name: '张三', student_id: '202401001', class_name: '高一1班', avatar: '' },
    { id: '2', name: '李四', student_id: '202401002', class_name: '高一1班', avatar: '' },
    { id: '3', name: '王五', student_id: '202401003', class_name: '高一2班', avatar: '' },
    { id: '4', name: '赵六', student_id: '202401004', class_name: '高一2班', avatar: '' },
    { id: '5', name: '钱七', student_id: '202401005', class_name: '高一3班', avatar: '' },
    { id: '6', name: '孙八', student_id: '202401006', class_name: '高一3班', avatar: '' },
    { id: '7', name: '周九', student_id: '202401007', class_name: '高一4班', avatar: '' },
    { id: '8', name: '吴十', student_id: '202401008', class_name: '高一4班', avatar: '' }
  ];

  // 初始化页面
  function init() {
    checkAdminRole();
    renderClassFilter();
    loadStudents();
    bindEvents();
  }

  // 检查管理员角色
  function checkAdminRole() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    data.isAdmin = userInfo.role === 'admin';
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
      addBtn.style.display = data.isAdmin ? 'flex' : 'none';
    }
  }

  // 渲染班级筛选器
  function renderClassFilter() {
    const container = document.getElementById('classFilter');
    if (!container) return;
    
    container.innerHTML = data.classes.map(className => `
      <div class="class-item ${data.selectedClass === className ? 'active' : ''}" data-class="${className}">
        ${className}
      </div>
    `).join('');
  }

  // 加载学生列表
  async function loadStudents() {
    if (data.loading) return;
    
    data.loading = true;
    document.getElementById('loadingMore').style.display = 'block';
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const start = (data.page - 1) * data.pageSize;
      const end = start + data.pageSize;
      const newStudents = mockStudents.slice(start, end);
      
      data.hasMore = newStudents.length === data.pageSize;
      
      if (data.page === 1) {
        data.students = newStudents;
      } else {
        data.students = [...data.students, ...newStudents];
      }
      
      filterStudents();
    } catch (err) {
      console.error('加载学生列表失败:', err);
      showToast('加载学生列表失败', 'error');
    } finally {
      data.loading = false;
      document.getElementById('loadingMore').style.display = 'none';
      updateLoadMoreStatus();
    }
  }

  // 筛选学生
  function filterStudents() {
    let filtered = [...data.students];
    
    if (data.searchKeyword) {
      const keyword = data.searchKeyword.toLowerCase();
      filtered = filtered.filter(student => 
        (student.name && student.name.toLowerCase().includes(keyword)) ||
        (student.student_id && student.student_id.toLowerCase().includes(keyword))
      );
    }
    
    if (data.selectedClass !== '全部') {
      filtered = filtered.filter(student => 
        student.class_name === data.selectedClass
      );
    }
    
    data.filteredStudents = filtered;
    renderStudentList();
  }

  // 渲染学生列表
  function renderStudentList() {
    const container = document.getElementById('studentList');
    const emptyState = document.getElementById('emptyState');
    
    if (!container) return;
    
    if (data.filteredStudents.length === 0) {
      container.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }
    
    emptyState.style.display = 'none';
    container.innerHTML = data.filteredStudents.map(student => `
      <div class="student-card" data-id="${student.id}" data-name="${student.name}">
        <div class="student-avatar">
          ${student.avatar ? `<img src="${student.avatar}" alt="${student.name}"/>` : `<span class="avatar-text">${student.name ? student.name[0] : '学'}</span>`}
        </div>
        <div class="student-info">
          <div class="student-name">${student.name || '未知姓名'}</div>
          <div class="student-meta">
            <span class="student-id">学号: ${student.student_id || '-'}</span>
            <span class="student-class">${student.class_name || '-'}</span>
          </div>
        </div>
        <div class="arrow-icon">
          <span class="arrow">›</span>
        </div>
      </div>
    `).join('');
  }

  // 更新加载更多状态
  function updateLoadMoreStatus() {
    const noMore = document.getElementById('noMore');
    if (noMore) {
      noMore.style.display = (!data.hasMore && data.filteredStudents.length > 0) ? 'block' : 'none';
    }
  }

  // 绑定事件
  function bindEvents() {
    // 搜索输入
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        data.searchKeyword = e.target.value;
        clearBtn.style.display = data.searchKeyword ? 'flex' : 'none';
        filterStudents();
      });
    }
    
    // 清除搜索
    if (clearBtn) {
      clearBtn.addEventListener('click', function() {
        data.searchKeyword = '';
        searchInput.value = '';
        clearBtn.style.display = 'none';
        filterStudents();
      });
    }
    
    // 班级筛选
    const classFilter = document.getElementById('classFilter');
    if (classFilter) {
      classFilter.addEventListener('click', function(e) {
        const item = e.target.closest('.class-item');
        if (item) {
          data.selectedClass = item.dataset.class;
          renderClassFilter();
          filterStudents();
        }
      });
    }
    
    // 学生卡片点击
    const studentList = document.getElementById('studentList');
    if (studentList) {
      studentList.addEventListener('click', function(e) {
        const card = e.target.closest('.student-card');
        if (card) {
          const id = card.dataset.id;
          const name = card.dataset.name;
          location.href = `../login/login.html?studentId=${id}&studentName=${encodeURIComponent(name)}`;
        }
      });
    }
    
    // 添加按钮
    const addBtn = document.getElementById('addBtn');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        location.href = '../edit/edit.html?mode=add';
      });
    }
    
    // 滚动加载更多
    window.addEventListener('scroll', function() {
      if (data.hasMore && !data.loading) {
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop;
        const clientHeight = document.documentElement.clientHeight;
        
        if (scrollTop + clientHeight >= scrollHeight - 100) {
          data.page++;
          loadStudents();
        }
      }
    });
  }

  // 显示提示
  function showToast(message, type = 'info') {
    if (window.utils && window.utils.showToast) {
      window.utils.showToast(message, type);
    } else {
      alert(message);
    }
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);
})();
