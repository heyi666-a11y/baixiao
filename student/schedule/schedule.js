// 课程表页面
(function() {
  const data = {
    studentId: '',
    student: null,
    schedule: [],
    weekdays: ['周一', '周二', '周三', '周四', '周五'],
    currentDay: 0,
    loading: true
  };

  const mockStudents = {
    '1': { id: '1', name: '张三', class_name: '高一1班', avatar: '' }
  };

  const subjectColors = {
    '语文': '#e74c3c',
    '数学': '#3498db',
    '英语': '#9b59b6',
    '物理': '#1abc9c',
    '化学': '#f39c12',
    '生物': '#27ae60',
    '历史': '#e67e22',
    '地理': '#16a085',
    '政治': '#2c3e50',
    '体育': '#e91e63',
    '音乐': '#ff5722',
    '美术': '#795548',
    '信息技术': '#607d8b'
  };

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
        loadSchedule()
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

  async function loadSchedule() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // 模拟课程表数据
    data.schedule = [
      {
        day: '周一',
        courses: [
          { id: 1, period: 1, time: '08:00-08:45', subject: '语文', teacher: '王老师', classroom: '101教室', color: subjectColors['语文'] },
          { id: 2, period: 2, time: '08:55-09:40', subject: '数学', teacher: '李老师', classroom: '102教室', color: subjectColors['数学'] },
          { id: 3, period: 3, time: '10:00-10:45', subject: '英语', teacher: '张老师', classroom: '103教室', color: subjectColors['英语'] },
          { id: 4, period: 4, time: '10:55-11:40', subject: '物理', teacher: '刘老师', classroom: '104教室', color: subjectColors['物理'] }
        ]
      },
      {
        day: '周二',
        courses: [
          { id: 5, period: 1, time: '08:00-08:45', subject: '数学', teacher: '李老师', classroom: '102教室', color: subjectColors['数学'] },
          { id: 6, period: 2, time: '08:55-09:40', subject: '化学', teacher: '陈老师', classroom: '105教室', color: subjectColors['化学'] },
          { id: 7, period: 3, time: '10:00-10:45', subject: '语文', teacher: '王老师', classroom: '101教室', color: subjectColors['语文'] },
          { id: 8, period: 4, time: '10:55-11:40', subject: '体育', teacher: '赵老师', classroom: '操场', color: subjectColors['体育'] }
        ]
      },
      {
        day: '周三',
        courses: [
          { id: 9, period: 1, time: '08:00-08:45', subject: '英语', teacher: '张老师', classroom: '103教室', color: subjectColors['英语'] },
          { id: 10, period: 2, time: '08:55-09:40', subject: '生物', teacher: '孙老师', classroom: '106教室', color: subjectColors['生物'] },
          { id: 11, period: 3, time: '10:00-10:45', subject: '数学', teacher: '李老师', classroom: '102教室', color: subjectColors['数学'] },
          { id: 12, period: 4, time: '10:55-11:40', subject: '历史', teacher: '周老师', classroom: '107教室', color: subjectColors['历史'] }
        ]
      },
      {
        day: '周四',
        courses: [
          { id: 13, period: 1, time: '08:00-08:45', subject: '语文', teacher: '王老师', classroom: '101教室', color: subjectColors['语文'] },
          { id: 14, period: 2, time: '08:55-09:40', subject: '地理', teacher: '吴老师', classroom: '108教室', color: subjectColors['地理'] },
          { id: 15, period: 3, time: '10:00-10:45', subject: '英语', teacher: '张老师', classroom: '103教室', color: subjectColors['英语'] },
          { id: 16, period: 4, time: '10:55-11:40', subject: '政治', teacher: '郑老师', classroom: '109教室', color: subjectColors['政治'] }
        ]
      },
      {
        day: '周五',
        courses: [
          { id: 17, period: 1, time: '08:00-08:45', subject: '数学', teacher: '李老师', classroom: '102教室', color: subjectColors['数学'] },
          { id: 18, period: 2, time: '08:55-09:40', subject: '语文', teacher: '王老师', classroom: '101教室', color: subjectColors['语文'] },
          { id: 19, period: 3, time: '10:00-10:45', subject: '物理', teacher: '刘老师', classroom: '104教室', color: subjectColors['物理'] },
          { id: 20, period: 4, time: '10:55-11:40', subject: '音乐', teacher: '钱老师', classroom: '音乐室', color: subjectColors['音乐'] }
        ]
      }
    ];
  }

  function renderPage() {
    renderStudentHeader();
    renderWeekTabs();
    renderSchedule();
    renderWeekOverview();
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

  function renderWeekTabs() {
    const tabs = document.getElementById('weekTabs');
    tabs.innerHTML = data.weekdays.map((day, index) => `
      <div class="tab-item ${data.currentDay === index ? 'active' : ''}" data-day="${index}">
        <span class="tab-day">${day}</span>
      </div>
    `).join('');
    
    document.getElementById('currentDayText').textContent = data.weekdays[data.currentDay];
  }

  function renderSchedule() {
    const list = document.getElementById('scheduleList');
    const emptyState = document.getElementById('emptyState');
    const currentSchedule = data.schedule[data.currentDay];
    
    if (!currentSchedule || currentSchedule.courses.length === 0) {
      list.innerHTML = '';
      emptyState.style.display = 'flex';
      document.getElementById('courseCount').textContent = '0 节课';
      return;
    }
    
    emptyState.style.display = 'none';
    document.getElementById('courseCount').textContent = currentSchedule.courses.length + ' 节课';
    
    list.innerHTML = currentSchedule.courses.map(course => `
      <div class="course-item">
        <div class="course-period">
          <span class="period-num">第${course.period}节</span>
          <span class="period-time">${course.time}</span>
        </div>
        <div class="course-card" style="border-left-color: ${course.color};">
          <div class="course-main">
            <div class="subject-badge" style="background: ${course.color};">
              <span class="subject-name">${course.subject}</span>
            </div>
            <div class="course-details">
              <div class="detail-item">
                <span class="detail-icon">👨‍🏫</span>
                <span class="detail-text">${course.teacher}</span>
              </div>
              <div class="detail-item">
                <span class="detail-icon">📍</span>
                <span class="detail-text">${course.classroom}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderWeekOverview() {
    const grid = document.getElementById('overviewGrid');
    grid.innerHTML = data.schedule.map((day, index) => `
      <div class="overview-day">
        <span class="overview-day-name">${day.day}</span>
        <div class="overview-courses">
          ${day.courses.map(course => `
            <div class="overview-course-dot" style="background: ${course.color};"></div>
          `).join('')}
        </div>
        <span class="overview-count">${day.courses.length}节</span>
      </div>
    `).join('');
  }

  function bindEvents() {
    document.getElementById('weekTabs').addEventListener('click', function(e) {
      const item = e.target.closest('.tab-item');
      if (item) {
        data.currentDay = parseInt(item.dataset.day);
        renderWeekTabs();
        renderSchedule();
      }
    });
    
    document.getElementById('prevDay').addEventListener('click', function() {
      if (data.currentDay > 0) {
        data.currentDay--;
        renderWeekTabs();
        renderSchedule();
      }
    });
    
    document.getElementById('nextDay').addEventListener('click', function() {
      if (data.currentDay < 4) {
        data.currentDay++;
        renderWeekTabs();
        renderSchedule();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
