// 教师考勤页面
let teachers = [];
let attendanceRecords = [];
let filteredRecords = [];
let currentDate = '';
let selectedStatus = '';
let currentRecord = null;

// 页面加载
window.onload = function() {
  // 设置今天日期
  currentDate = new Date().toISOString().split('T')[0];
  document.getElementById('datePicker').value = currentDate;
  
  loadData();
};

// 加载数据
function loadData() {
  // 加载教师列表
  const storedTeachers = localStorage.getItem('teachers');
  if (storedTeachers) {
    teachers = JSON.parse(storedTeachers);
  }
  
  // 加载考勤记录
  const storedAttendance = localStorage.getItem('attendance_' + currentDate);
  if (storedAttendance) {
    attendanceRecords = JSON.parse(storedAttendance);
  } else {
    // 生成默认考勤记录
    generateDefaultAttendance();
  }
  
  filterRecords();
  calculateStats();
}

// 生成默认考勤记录
function generateDefaultAttendance() {
  attendanceRecords = teachers.map(teacher => ({
    id: Date.now().toString() + '_' + teacher.id,
    teacherId: teacher.id,
    teacherName: teacher.name,
    department: teacher.department,
    date: currentDate,
    status: 'present',
    checkTime: '08:30',
    remark: ''
  }));
  
  // 保存到本地存储
  localStorage.setItem('attendance_' + currentDate, JSON.stringify(attendanceRecords));
}

// 计算统计
function calculateStats() {
  const stats = {
    total: attendanceRecords.length,
    present: attendanceRecords.filter(r => r.status === 'present').length,
    absent: attendanceRecords.filter(r => r.status === 'absent').length,
    late: attendanceRecords.filter(r => r.status === 'late').length,
    leave: attendanceRecords.filter(r => r.status === 'leave').length
  };
  
  document.getElementById('statTotal').textContent = stats.total;
  document.getElementById('statPresent').textContent = stats.present;
  document.getElementById('statAbsent').textContent = stats.absent;
  document.getElementById('statLate').textContent = stats.late;
  document.getElementById('statLeave').textContent = stats.leave;
}

// 日期变化
function onDateChange() {
  currentDate = document.getElementById('datePicker').value;
  loadData();
}

// 状态筛选
function onStatusFilter(status) {
  selectedStatus = status;
  
  // 更新UI
  document.querySelectorAll('.filter-option').forEach(opt => {
    opt.classList.remove('active');
  });
  event.target.classList.add('active');
  
  filterRecords();
}

// 筛选记录
function filterRecords() {
  filteredRecords = [...attendanceRecords];
  
  if (selectedStatus) {
    filteredRecords = filteredRecords.filter(r => r.status === selectedStatus);
  }
  
  renderAttendanceList();
}

// 渲染考勤列表
function renderAttendanceList() {
  const listEl = document.getElementById('attendanceList');
  document.getElementById('recordCount').textContent = filteredRecords.length;
  
  if (filteredRecords.length === 0) {
    listEl.innerHTML = '<div class="empty-state"><span class="empty-text">暂无考勤记录</span></div>';
    return;
  }
  
  listEl.innerHTML = filteredRecords.map(record => `
    <div class="attendance-card" onclick="showDetail('${record.id}')">
      <div class="card-header">
        <div class="teacher-info">
          <span class="teacher-name">${record.teacherName}</span>
          <span class="teacher-dept">${record.department}</span>
        </div>
        <span class="status-badge ${getStatusClass(record.status)}">
          ${getStatusText(record.status)}
        </span>
      </div>
      <div class="card-body">
        <div class="info-row">
          <span class="info-label">打卡时间</span>
          <span class="info-value">${record.checkTime || '未打卡'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">备注</span>
          <span class="info-value">${record.remark || '无'}</span>
        </div>
      </div>
      <div class="card-actions">
        <div class="action-btn present" onclick="event.stopPropagation(); markAttendance('${record.id}', 'present')">正常</div>
        <div class="action-btn late" onclick="event.stopPropagation(); markAttendance('${record.id}', 'late')">迟到</div>
        <div class="action-btn absent" onclick="event.stopPropagation(); markAttendance('${record.id}', 'absent')">缺勤</div>
        <div class="action-btn leave" onclick="event.stopPropagation(); markAttendance('${record.id}', 'leave')">请假</div>
      </div>
    </div>
  `).join('');
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    present: '正常',
    absent: '缺勤',
    late: '迟到',
    leave: '请假'
  };
  return statusMap[status] || status;
}

// 获取状态样式类
function getStatusClass(status) {
  const classMap = {
    present: 'status-present',
    absent: 'status-absent',
    late: 'status-late',
    leave: 'status-leave'
  };
  return classMap[status] || '';
}

// 标记考勤
function markAttendance(id, status) {
  const index = attendanceRecords.findIndex(r => r.id === id);
  if (index !== -1) {
    attendanceRecords[index].status = status;
    attendanceRecords[index].checkTime = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    // 保存到本地存储
    localStorage.setItem('attendance_' + currentDate, JSON.stringify(attendanceRecords));
    
    filterRecords();
    calculateStats();
    alert('标记成功');
  }
}

// 显示详情
function showDetail(id) {
  currentRecord = attendanceRecords.find(r => r.id === id);
  if (!currentRecord) return;
  
  const modalBody = document.getElementById('modalBody');
  modalBody.innerHTML = `
    <div class="detail-row">
      <span class="detail-label">教师姓名</span>
      <span class="detail-value">${currentRecord.teacherName}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">所属部门</span>
      <span class="detail-value">${currentRecord.department}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">考勤状态</span>
      <span class="status-badge ${getStatusClass(currentRecord.status)}">
        ${getStatusText(currentRecord.status)}
      </span>
    </div>
    <div class="detail-row">
      <span class="detail-label">打卡时间</span>
      <span class="detail-value">${currentRecord.checkTime || '未打卡'}</span>
    </div>
    <div class="detail-row">
      <span class="detail-label">备注信息</span>
      <span class="detail-value">${currentRecord.remark || '无'}</span>
    </div>
  `;
  
  document.getElementById('modalOverlay').classList.add('show');
  document.getElementById('detailModal').classList.add('show');
}

// 关闭详情
function closeDetail() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('detailModal').classList.remove('show');
  currentRecord = null;
}

// 返回
function goBack() {
  history.back();
}
