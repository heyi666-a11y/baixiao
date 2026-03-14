// 考勤记录页面
(function() {
  const data = {
    studentId: '',
    student: null,
    attendance: [],
    months: [],
    selectedMonth: '',
    stats: { present: 0, absent: 0, late: 0, leave: 0 },
    loading: true
  };

  const mockStudents = {
    '1': { id: '1', name: '张三', class_name: '高一1班', avatar: '' }
  };

  const mockAttendance = [
    { id: 1, date: '2024-11-15', status: 'present', type: '正常出勤', time: '07:45', remark: '' },
    { id: 2, date: '2024-11-14', status: 'present', type: '正常出勤', time: '07:50', remark: '' },
    { id: 3, date: '2024-11-13', status: 'late', type: '迟到', time: '08:15', remark: '交通堵塞' },
    { id: 4, date: '2024-11-12', status: 'present', type: '正常出勤', time: '07:48', remark: '' },
    { id: 5, date: '2024-11-11', status: 'leave', type: '请假', time: '-', remark: '病假' },
    { id: 6, date: '2024-11-08', status: 'present', type: '正常出勤', time: '07:42', remark: '' },
    { id: 7, date: '2024-11-07', status: 'present', type: '正常出勤', time: '07:55', remark: '' },
    { id: 8, date: '2024-11-06', status: 'absent', type: '缺勤', time: '-', remark: '无故缺勤' },
    { id: 9, date: '2024-11-05', status: 'present', type: '正常出勤', time: '07:50', remark: '' },
    { id: 10, date: '2024-11-04', status: 'present', type: '正常出勤', time: '07:45', remark: '' }
  ];

  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    data.studentId = urlParams.get('id');
    
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
        loadAttendance()
      ]);
      
      generateMonths();
      calculateStats();
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

  async function loadAttendance() {
    await new Promise(resolve => setTimeout(resolve, 200));
    data.attendance = mockAttendance;
  }

  function generateMonths() {
    const now = new Date();
    const months = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      months.push(monthStr);
    }
    data.months = months;
    data.selectedMonth = months[0];
  }

  function calculateStats() {
    const filtered = getFilteredAttendance();
    data.stats = {
      present: filtered.filter(a => a.status === 'present').length,
      absent: filtered.filter(a => a.status === 'absent').length,
      late: filtered.filter(a => a.status === 'late').length,
      leave: filtered.filter(a => a.status === 'leave').length
    };
  }

  function getFilteredAttendance() {
    if (!data.selectedMonth) return data.attendance;
    return data.attendance.filter(a => a.date.startsWith(data.selectedMonth));
  }

  function renderPage() {
    renderStudentHeader();
    renderStats();
    renderMonthFilter();
    renderAttendanceList();
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

  function renderStats() {
    document.getElementById('presentCount').textContent = data.stats.present;
    document.getElementById('absentCount').textContent = data.stats.absent;
    document.getElementById('lateCount').textContent = data.stats.late;
    document.getElementById('leaveCount').textContent = data.stats.leave;
  }

  function renderMonthFilter() {
    const filter = document.getElementById('monthFilter');
    filter.innerHTML = data.months.map(month => {
      const [year, m] = month.split('-');
      return `
        <div class="month-item ${data.selectedMonth === month ? 'active' : ''}" data-month="${month}">
          ${year}年${m}月
        </div>
      `;
    }).join('');
  }

  function renderAttendanceList() {
    const list = document.getElementById('attendanceList');
    const emptyState = document.getElementById('emptyState');
    const filtered = getFilteredAttendance();
    
    if (filtered.length === 0) {
      list.innerHTML = '';
      emptyState.style.display = 'flex';
      return;
    }
    
    emptyState.style.display = 'none';
    list.innerHTML = filtered.map(item => {
      const date = new Date(item.date);
      const statusMap = {
        'present': { text: '出勤', class: 'present' },
        'absent': { text: '缺勤', class: 'absent' },
        'late': { text: '迟到', class: 'late' },
        'leave': { text: '请假', class: 'leave' }
      };
      const status = statusMap[item.status];
      
      return `
        <div class="attendance-item">
          <div class="attendance-date">
            <span class="date-day">${date.getDate()}</span>
            <span class="date-month">${date.getMonth() + 1}月</span>
          </div>
          <div class="attendance-info">
            <div class="attendance-status">
              <span class="status-badge ${status.class}">${status.text}</span>
              <span class="attendance-type">${item.type}</span>
            </div>
            ${item.time !== '-' ? `<span class="attendance-time">打卡时间: ${item.time}</span>` : ''}
            ${item.remark ? `<span class="attendance-remark">备注: ${item.remark}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  function bindEvents() {
    document.getElementById('monthFilter').addEventListener('click', function(e) {
      const item = e.target.closest('.month-item');
      if (item) {
        data.selectedMonth = item.dataset.month;
        calculateStats();
        renderPage();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
