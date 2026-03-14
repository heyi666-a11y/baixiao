// 教师课表页面
let teachers = [];
let selectedTeacher = null;
let schedule = [];
const weekDays = ['周一', '周二', '周三', '周四', '周五'];
const timeSlots = [
  { time: '08:00-08:45', label: '第1节' },
  { time: '08:55-09:40', label: '第2节' },
  { time: '10:00-10:45', label: '第3节' },
  { time: '10:55-11:40', label: '第4节' },
  { time: '14:00-14:45', label: '第5节' },
  { time: '14:55-15:40', label: '第6节' },
  { time: '16:00-16:45', label: '第7节' },
  { time: '16:55-17:40', label: '第8节' }
];

let editingSchedule = null;
let currentDay = 0;
let currentPeriod = 0;

// 页面加载
window.onload = function() {
  loadTeachers();
  
  // 检查URL参数
  const urlParams = new URLSearchParams(window.location.search);
  const teacherId = urlParams.get('teacherId');
  if (teacherId) {
    document.getElementById('teacherSelect').value = teacherId;
    onTeacherChange();
  }
};

// 加载教师列表
function loadTeachers() {
  const stored = localStorage.getItem('teachers');
  if (stored) {
    teachers = JSON.parse(stored);
  }
  
  const select = document.getElementById('teacherSelect');
  teachers.forEach(teacher => {
    const option = document.createElement('option');
    option.value = teacher.id;
    option.textContent = teacher.name;
    select.appendChild(option);
  });
}

// 教师选择变化
function onTeacherChange() {
  const teacherId = document.getElementById('teacherSelect').value;
  
  if (!teacherId) {
    document.getElementById('scheduleContainer').classList.remove('show');
    document.getElementById('emptyState').style.display = 'block';
    return;
  }
  
  selectedTeacher = teachers.find(t => t.id === teacherId);
  
  // 加载该教师的课表
  const scheduleKey = 'schedule_' + teacherId;
  const stored = localStorage.getItem(scheduleKey);
  if (stored) {
    schedule = JSON.parse(stored);
  } else {
    schedule = [];
  }
  
  renderSchedule();
  document.getElementById('scheduleContainer').classList.add('show');
  document.getElementById('emptyState').style.display = 'none';
}

// 渲染课表
function renderSchedule() {
  const body = document.getElementById('scheduleBody');
  body.innerHTML = '';
  
  timeSlots.forEach((slot, periodIndex) => {
    const row = document.createElement('div');
    row.className = 'schedule-row';
    
    // 时间列
    const timeCell = document.createElement('div');
    timeCell.className = 'time-cell';
    timeCell.innerHTML = `
      <span class="period-label">${slot.label}</span>
      <span class="period-time">${slot.time}</span>
    `;
    row.appendChild(timeCell);
    
    // 每天的课程
    for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
      const cell = document.createElement('div');
      const item = getScheduleItem(dayIndex, periodIndex);
      
      cell.className = 'schedule-cell' + (item ? ' has-class' : '');
      cell.onclick = () => onScheduleTap(dayIndex, periodIndex);
      
      if (item) {
        cell.innerHTML = `
          <span class="subject-name">${item.subject}</span>
          <span class="class-info">${item.className}</span>
          <span class="room-info">${item.classroom}</span>
        `;
      } else {
        cell.innerHTML = '<span class="empty-slot">+</span>';
      }
      
      row.appendChild(cell);
    }
    
    body.appendChild(row);
  });
}

// 获取课程项
function getScheduleItem(day, period) {
  return schedule.find(s => s.day === day && s.period === period) || null;
}

// 点击课程格子
function onScheduleTap(day, period) {
  currentDay = day;
  currentPeriod = period;
  editingSchedule = getScheduleItem(day, period);
  
  document.getElementById('modalTitle').textContent = editingSchedule ? '编辑课程' : '添加课程';
  document.getElementById('dayValue').textContent = weekDays[day];
  document.getElementById('periodValue').textContent = timeSlots[period].label + ' (' + timeSlots[period].time + ')';
  
  if (editingSchedule) {
    document.getElementById('subjectInput').value = editingSchedule.subject || '';
    document.getElementById('classNameInput').value = editingSchedule.className || '';
    document.getElementById('classroomInput').value = editingSchedule.classroom || '';
    document.getElementById('deleteBtn').style.display = 'block';
  } else {
    document.getElementById('subjectInput').value = '';
    document.getElementById('classNameInput').value = '';
    document.getElementById('classroomInput').value = '';
    document.getElementById('deleteBtn').style.display = 'none';
  }
  
  document.getElementById('modalOverlay').classList.add('show');
  document.getElementById('editModal').classList.add('show');
}

// 关闭弹窗
function closeModal() {
  document.getElementById('modalOverlay').classList.remove('show');
  document.getElementById('editModal').classList.remove('show');
  editingSchedule = null;
}

// 保存课程
function saveSchedule() {
  const subject = document.getElementById('subjectInput').value.trim();
  const className = document.getElementById('classNameInput').value.trim();
  const classroom = document.getElementById('classroomInput').value.trim();
  
  if (!subject) {
    alert('请输入课程名称');
    return;
  }
  
  const newItem = {
    id: editingSchedule ? editingSchedule.id : Date.now().toString(),
    day: currentDay,
    period: currentPeriod,
    subject,
    className,
    classroom,
    teacherId: selectedTeacher.id
  };
  
  const index = schedule.findIndex(s => s.day === currentDay && s.period === currentPeriod);
  
  if (index !== -1) {
    schedule[index] = newItem;
  } else {
    schedule.push(newItem);
  }
  
  // 保存到本地存储
  const scheduleKey = 'schedule_' + selectedTeacher.id;
  localStorage.setItem(scheduleKey, JSON.stringify(schedule));
  
  renderSchedule();
  closeModal();
  alert('保存成功');
}

// 删除课程
function deleteSchedule() {
  if (!editingSchedule) return;
  
  if (!confirm('确定要删除这节课吗？')) return;
  
  schedule = schedule.filter(s => !(s.day === currentDay && s.period === currentPeriod));
  
  // 保存到本地存储
  const scheduleKey = 'schedule_' + selectedTeacher.id;
  localStorage.setItem(scheduleKey, JSON.stringify(schedule));
  
  renderSchedule();
  closeModal();
  alert('删除成功');
}

// 返回
function goBack() {
  history.back();
}
