// 请假审批页面
let leaves = [];
let filteredLeaves = [];
let activeTab = 'pending';
let currentLeave = null;

// 页面加载
window.onload = function() {
  loadData();
};

// 加载数据
function loadData() {
  // 加载请假数据
  const stored = localStorage.getItem('leaves');
  if (stored) {
    leaves = JSON.parse(stored);
  } else {
    // 初始化示例数据
    leaves = [
      {
        id: '1',
        studentName: '王小明',
        studentClass: '三年级二班',
        studentId: '2024001',
        type: 'sick',
        start_date: '2024-03-15',
        end_date: '2024-03-16',
        apply_date: '2024-03-14',
        reason: '感冒发烧，需要休息两天',
        status: 'pending',
        approve_teacher: '',
        approve_date: '',
        reject_reason: ''
      },
      {
        id: '2',
        studentName: '李小红',
        studentClass: '四年级一班',
        studentId: '2024002',
        type: 'personal',
        start_date: '2024-03-18',
        end_date: '2024-03-18',
        apply_date: '2024-03-17',
        reason: '家中有事',
        status: 'pending',
        approve_teacher: '',
        approve_date: '',
        reject_reason: ''
      }
    ];
    localStorage.setItem('leaves', JSON.stringify(leaves));
  }
  
  filterLeaves();
}

// Tab切换
function onTabChange(tab) {
  activeTab = tab;
  
  // 更新UI
  document.querySelectorAll('.tab-item').forEach(item => {
    item.classList.remove('active');
  });
  event.target.classList.add('active');
  
  filterLeaves();
}

// 筛选请假记录
function filterLeaves() {
  switch (activeTab) {
    case 'pending':
      filteredLeaves = leaves.filter(l => l.status === 'pending');
      break;
    case 'approved':
      filteredLeaves = leaves.filter(l => l.status === 'approved');
      break;
    case 'rejected':
      filteredLeaves = leaves.filter(l => l.status === 'rejected');
      break;
    case 'all':
    default:
      filteredLeaves = leaves;
      break;
  }
  
  renderLeaveList();
}

// 渲染请假列表
function renderLeaveList() {
  const listEl = document.getElementById('leaveList');
  document.getElementById('leaveCount').textContent = filteredLeaves.length;
  
  if (filteredLeaves.length === 0) {
    listEl.innerHTML = '<div class="empty-state"><span class="empty-text">暂无请假申请</span></div>';
    return;
  }
  
  listEl.innerHTML = filteredLeaves.map(leave => `
    <div class="leave-card" onclick="showDetail('${leave.id}')">
      <div class="card-header">
        <div class="student-info">
          <span class="student-name">${leave.studentName}</span>
          <span class="student-class">${leave.studentClass}</span>
        </div>
        <span class="status-badge ${getStatusClass(leave.status)}">
          ${getStatusText(leave.status)}
        </span>
      </div>
      <div class="card-body">
        <div class="info-row">
          <span class="info-label">请假类型</span>
          <span class="info-value">${getLeaveTypeText(leave.type)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">请假时间</span>
          <span class="info-value">${leave.start_date} 至 ${leave.end_date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">申请时间</span>
          <span class="info-value">${leave.apply_date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">请假原因</span>
          <span class="info-value reason">${leave.reason}</span>
        </div>
      </div>
      ${leave.status === 'pending' ? `
        <div class="card-footer">
          <div class="action-btn approve" onclick="event.stopPropagation(); quickApprove('${leave.id}')">通过</div>
          <div class="action-btn reject" onclick="event.stopPropagation(); quickReject('${leave.id}')">拒绝</div>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  };
  return statusMap[status] || status;
}

// 获取状态样式类
function getStatusClass(status) {
  const classMap = {
    pending: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected'
  };
  return classMap[status] || '';
}

// 获取请假类型文本
function getLeaveTypeText(type) {
  const typeMap = {
    sick: '病假',
    personal: '事假',
    other: '其他'
  };
  return typeMap[type] || type;
}

// 显示详情
function showDetail(id) {
  currentLeave = leaves.find(l => l.id === id);
  if (!currentLeave) return;
  
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="detail-section">
      <div class="section-title">学生信息</div>
      <div class="detail-row">
        <span class="detail-label">姓名</span>
        <span class="detail-value">${currentLeave.studentName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">学号</span>
        <span class="detail-value">${currentLeave.studentId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">班级</span>
        <span class="detail-value">${currentLeave.studentClass}</span>
      </div>
    </div>

    <div class="detail-section">
      <div class="section-title">请假信息</div>
      <div class="detail-row">
        <span class="detail-label">请假类型</span>
        <span class="detail-value">${getLeaveTypeText(currentLeave.type)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">开始日期</span>
        <span class="detail-value">${currentLeave.start_date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">结束日期</span>
        <span class="detail-value">${currentLeave.end_date}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">申请时间</span>
        <span class="detail-value">${currentLeave.apply_date}</span>
      </div>
      <div class="detail-row vertical">
        <span class="detail-label">请假原因</span>
        <span class="detail-value reason-text">${currentLeave.reason}</span>
      </div>
    </div>

    ${currentLeave.status !== 'pending' ? `
      <div class="detail-section">
        <div class="section-title">审批信息</div>
        <div class="detail-row">
          <span class="detail-label">审批状态</span>
          <span class="status-badge ${getStatusClass(currentLeave.status)}">
            ${getStatusText(currentLeave.status)}
          </span>
        </div>
        <div class="detail-row">
          <span class="detail-label">审批人</span>
          <span class="detail-value">${currentLeave.approve_teacher || '-'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">审批时间</span>
          <span class="detail-value">${currentLeave.approve_date || '-'}</span>
        </div>
        ${currentLeave.reject_reason ? `
          <div class="detail-row vertical">
            <span class="detail-label">拒绝原因</span>
            <span class="detail-value reason-text">${currentLeave.reject_reason}</span>
          </div>
        ` : ''}
      </div>
    ` : ''}

    ${currentLeave.status === 'pending' ? `
      <div class="approval-section">
        <div class="section-title">审批操作</div>
        <div class="form-item">
          <span class="form-label">拒绝原因（拒绝时必填）</span>
          <textarea class="form-textarea" placeholder="请输入拒绝原因..." id="rejectReason"></textarea>
        </div>
      </div>
    ` : ''}
  `;
  
  // 显示/隐藏底部按钮
  document.getElementById('modalFooter').style.display = currentLeave.status === 'pending' ? 'flex' : 'none';
  
  document.getElementById('modalOverlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
}

// 关闭详情
function closeDetail() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('detailModal').classList.remove('show');
  currentLeave = null;
}

// 快速通过
function quickApprove(id) {
  currentLeave = leaves.find(l => l.id === id);
  if (!currentLeave) return;
  approveLeave();
}

// 快速拒绝
function quickReject(id) {
  currentLeave = leaves.find(l => l.id === id);
  if (!currentLeave) return;
  
  const reason = prompt('请输入拒绝原因：');
  if (reason === null) return;
  
  if (!reason.trim()) {
    alert('请输入拒绝原因');
    return;
  }
  
  document.getElementById('rejectReason').value = reason;
  rejectLeave();
}

// 通过请假
function approveLeave() {
  if (!currentLeave) return;
  
  if (!confirm(`确定批准 ${currentLeave.studentName} 的请假申请吗？`)) return;
  
  const index = leaves.findIndex(l => l.id === currentLeave.id);
  if (index !== -1) {
    leaves[index].status = 'approved';
    leaves[index].approve_teacher = '管理员';
    leaves[index].approve_date = new Date().toISOString().split('T')[0];
    
    localStorage.setItem('leaves', JSON.stringify(leaves));
    
    alert('审批通过');
    closeDetail();
    filterLeaves();
  }
}

// 拒绝请假
function rejectLeave() {
  if (!currentLeave) return;
  
  const rejectReason = document.getElementById('rejectReason')?.value.trim() || '';
  
  if (!rejectReason) {
    alert('请输入拒绝原因');
    return;
  }
  
  if (!confirm(`确定拒绝 ${currentLeave.studentName} 的请假申请吗？`)) return;
  
  const index = leaves.findIndex(l => l.id === currentLeave.id);
  if (index !== -1) {
    leaves[index].status = 'rejected';
    leaves[index].approve_teacher = '管理员';
    leaves[index].approve_date = new Date().toISOString().split('T')[0];
    leaves[index].reject_reason = rejectReason;
    
    localStorage.setItem('leaves', JSON.stringify(leaves));
    
    alert('已拒绝');
    closeDetail();
    filterLeaves();
  }
}

// 返回
function goBack() {
  history.back();
}
