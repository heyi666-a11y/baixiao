// 模拟获取联考详情API
const jointExamsAPI = {
  getExamDetail: (examId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockDetail = {
          id: examId,
          name: '2024年春季学期期中联考',
          status: 'ongoing',
          statusText: '进行中',
          examDate: '2024-04-15 至 2024-04-17',
          schoolCount: 12,
          studentCount: 3600,
          subjects: ['语文', '数学', '英语', '物理', '化学', '生物'],
          schools: [
            { id: 1, name: '广东北江中学' },
            { id: 2, name: '韶关市第一中学' },
            { id: 3, name: '韶关市第二中学' },
            { id: 4, name: '乐昌市第一中学' },
            { id: 5, name: '南雄市第一中学' },
            { id: 6, name: '仁化县第一中学' },
            { id: 7, name: '始兴县第一中学' },
            { id: 8, name: '翁源县第一中学' },
            { id: 9, name: '新丰县第一中学' },
            { id: 10, name: '乳源瑶族自治县高级中学' },
            { id: 11, name: '韶关市田家炳中学' },
            { id: 12, name: '韶关市第五中学' }
          ],
          notices: [
            {
              id: 1,
              title: '考试时间安排通知',
              content: '本次联考将于4月15日上午8:00正式开始，请各位考生提前30分钟到达考场。考试期间请严格遵守考场纪律。',
              time: '2024-04-10'
            },
            {
              id: 2,
              title: '成绩录入截止时间',
              content: '请各参与学校在考试结束后5个工作日内完成成绩录入工作，逾期将影响整体排名发布。',
              time: '2024-04-08'
            }
          ],
          description: '本次联考旨在检测学生半学期以来的学习成果，为后续教学提供参考依据。考试范围涵盖本学期已学内容，难度适中。请各学校严格按照统一标准组织考试，确保考试公平公正。'
        };

        resolve({
          code: 200,
          data: mockDetail,
          message: 'success'
        });
      }, 500);
    });
  }
};

// 数据状态
let examId = null;
let exam = {
  subjects: [],
  schools: [],
  notices: []
};

// 页面加载
function init() {
  // 获取URL参数
  const urlParams = new URLSearchParams(window.location.search);
  examId = urlParams.get('id');
  
  if (!examId) {
    alert('参数错误');
    return;
  }
  
  loadExamDetail(examId);
}

// 加载联考详情
async function loadExamDetail(examId) {
  try {
    const res = await jointExamsAPI.getExamDetail(examId);
    if (res.code === 200) {
      exam = res.data;
      renderExamDetail();
    }
  } catch (error) {
    console.error('加载联考详情失败:', error);
    alert('加载失败');
  }
}

// 渲染联考详情
function renderExamDetail() {
  // 基本信息
  document.getElementById('examName').textContent = exam.name;
  
  const statusBadge = document.getElementById('statusBadge');
  statusBadge.textContent = exam.statusText;
  statusBadge.className = `status-badge status-${exam.status}`;
  
  document.getElementById('examDate').textContent = exam.examDate;
  document.getElementById('schoolCount').textContent = exam.schoolCount + '所';
  document.getElementById('studentCount').textContent = exam.studentCount + '人';
  document.getElementById('subjectCount').textContent = exam.subjects.length + '科';
  
  // 科目列表
  const subjectListEl = document.getElementById('subjectList');
  subjectListEl.innerHTML = exam.subjects.map(subject => `
    <div class="subject-tag">${subject}</div>
  `).join('');
  
  // 参与学校
  document.getElementById('schoolSubtitle').textContent = `(${exam.schools.length}所)`;
  const schoolListEl = document.getElementById('schoolList');
  schoolListEl.innerHTML = exam.schools.map((school, index) => `
    <div class="school-item">
      <span class="school-index">${index + 1}</span>
      <span class="school-name">${school.name}</span>
    </div>
  `).join('');
  
  // 考试公告
  if (exam.notices && exam.notices.length > 0) {
    document.getElementById('noticeCard').style.display = 'block';
    const noticeListEl = document.getElementById('noticeList');
    noticeListEl.innerHTML = exam.notices.map(notice => `
      <div class="notice-item">
        <div class="notice-header">
          <span class="notice-title">${notice.title}</span>
          <span class="notice-time">${notice.time}</span>
        </div>
        <span class="notice-content">${notice.content}</span>
      </div>
    `).join('');
  }
  
  // 考试说明
  if (exam.description) {
    document.getElementById('descriptionCard').style.display = 'block';
    document.getElementById('descriptionText').textContent = exam.description;
  }
}

// 跳转到成绩录入
function goToScoreEntry() {
  location.href = `../score-entry/score-entry.html?examId=${examId}`;
}

// 跳转到排名查看
function goToRankings() {
  location.href = `../rankings/rankings.html?examId=${examId}`;
}

// 初始化
init();
