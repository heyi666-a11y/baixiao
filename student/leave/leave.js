// 请假申请页面
(function() {
  const data = {
    studentId: '',
    student: null,
    leaveType: '',
    startTime: '',
    endTime: '',
    reason: '',
    history: [],
    loading: false
  };

  const mockStudents = {
    '1': { id: '1', name: '张三', class_name: '高一1班', avatar: '' }
  };

  const mockHistory = [
    { id: 1, type: 'sick', typeName: '病假', startTime: '2024-11-10 08:00', endTime: '2024-11-10 17:00', days: 1, reason: '感冒发烧', status: 'approved', statusName: '已批准' },
    { id: 2, type: 'personal', typeName: '事假', startTime: '2024-10-20 08:00', endTime: '2024-10-20 12:00', days: 0.5, reason: '家中有事', status: 'approved', statusName: '已批准' },
    { id: 3, type: 'sick', typeName: '病假', startTime: '2024-11-15 08:00', endTime: '2024-11-16 17:00', days: 2, reason: '去医院复查', status: 'pending', statusName: '审批中' }
  ];

  const typeMap = {
    'sick': '病假',
    'personal': '事假',
    'other': '其他'
  };

  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    data.studentId = urlParams.get('studentId') || '';
    
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
        loadHistory()
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

  async function loadHistory() {
    await new Promise(resolve => setTimeout(resolve, 200));
    data.history = mockHistory;
  }

  function renderPage() {
    renderStudentHeader();
    renderHistory();
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

  function renderHistory() {
    const list = document.getElementById('historyList');
    list.innerHTML = data.history.map(item => `
      <div class="history-item">
        <div class="history-header">
          <span class="history-type">${item.typeName}</span>
          <span class="history-status ${item.status}">${item.statusName}</span>
        </div>
        <div class="history-time">${item.startTime} 至 ${item.endTime} (${item.days}天)</div>
        <div class="history-reason">${item.reason}</div>
      </div>
    `).join('');
  }

  function calculateDays() {
    const start = document.getElementById('startTime').value;
    const end = document.getElementById('endTime').value;
    
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diffTime = endDate - startDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      document.getElementById('dayCount').textContent = diffDays > 0 ? diffDays + ' 天' : '0 天';
    }
  }

  function bindEvents() {
    document.getElementById('leaveType').addEventListener('change', function(e) {
      data.leaveType = e.target.value;
    });
    
    document.getElementById('startTime').addEventListener('change', function(e) {
      data.startTime = e.target.value;
      calculateDays();
    });
    
    document.getElementById('endTime').addEventListener('change', function(e) {
      data.endTime = e.target.value;
      calculateDays();
    });
    
    document.getElementById('leaveReason').addEventListener('input', function(e) {
      data.reason = e.target.value;
      document.getElementById('textareaCount').textContent = e.target.value.length + '/200';
    });
    
    document.getElementById('submitBtn').addEventListener('click', onSubmit);
  }

  async function onSubmit() {
    const leaveType = document.getElementById('leaveType').value;
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    const reason = document.getElementById('leaveReason').value;
    
    if (!leaveType) {
      showToast('请选择请假类型', 'error');
      return;
    }
    
    if (!startTime) {
      showToast('请选择开始时间', 'error');
      return;
    }
    
    if (!endTime) {
      showToast('请选择结束时间', 'error');
      return;
    }
    
    if (!reason.trim()) {
      showToast('请输入请假事由', 'error');
      return;
    }
    
    data.loading = true;
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').textContent = '提交中...';
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showToast('请假申请提交成功', 'success');
      
      // 清空表单
      document.getElementById('leaveType').value = '';
      document.getElementById('startTime').value = '';
      document.getElementById('endTime').value = '';
      document.getElementById('leaveReason').value = '';
      document.getElementById('dayCount').textContent = '0 天';
      document.getElementById('textareaCount').textContent = '0/200';
      
      // 刷新历史记录
      loadHistory().then(renderHistory);
      
    } catch (err) {
      console.error('提交失败:', err);
      showToast('提交失败', 'error');
    } finally {
      data.loading = false;
      document.getElementById('submitBtn').disabled = false;
      document.getElementById('submitBtn').textContent = '提交申请';
    }
  }

  function showToast(message, type = 'info') {
    if (window.utils && window.utils.showToast) {
      window.utils.showToast(message, type);
    } else {
      alert(message);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
