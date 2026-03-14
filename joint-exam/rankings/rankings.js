// 模拟排名API
const jointExamsAPI = {
  getRankings: (examId, dimension, subject) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const subjects = ['语文', '数学', '英语', '物理', '化学', '生物'];
        
        // 生成模拟排名数据
        const generateRankings = () => {
          const rankings = [];
          const schools = ['广东北江中学', '韶关市第一中学', '韶关市第二中学', '乐昌市第一中学'];
          const names = ['张小明', '李小红', '王大伟', '刘小强', '陈小丽', '杨小军', '黄小芳', '周小华', '吴小波', '徐小静', '郑小龙', '马小燕'];
          
          for (let i = 0; i < 50; i++) {
            const subjectScores = subjects.map(() => Math.floor(Math.random() * 60) + 60);
            const totalScore = subjectScores.reduce((a, b) => a + b, 0);
            
            rankings.push({
              id: i + 1,
              rank: i + 1,
              studentName: names[i % names.length] + (Math.floor(i / names.length) + 1),
              schoolName: schools[i % schools.length],
              subjectScores: subjectScores,
              score: dimension === 'total' ? totalScore : subjectScores[subjects.indexOf(subject) || 0]
            });
          }
          
          // 按分数排序
          rankings.sort((a, b) => b.score - a.score);
          // 重新设置排名
          rankings.forEach((item, index) => {
            item.rank = index + 1;
          });
          
          return rankings;
        };

        const rankings = generateRankings();
        
        // 计算统计数据
        const totalStudents = rankings.length;
        const totalScore = rankings.reduce((sum, r) => sum + r.score, 0);
        const average = (totalScore / totalStudents).toFixed(1);
        const highest = Math.max(...rankings.map(r => r.score));
        const passCount = rankings.filter(r => r.score >= 60).length;
        const passRate = ((passCount / totalStudents) * 100).toFixed(1);

        resolve({
          code: 200,
          data: {
            rankings: rankings,
            subjects: subjects,
            overview: {
              totalStudents,
              average,
              highest,
              passRate
            }
          },
          message: 'success'
        });
      }, 500);
    });
  }
};

// 数据状态
let examId = null;
let currentDimension = 'total';
let currentSubject = '语文';
let subjects = ['语文', '数学', '英语', '物理', '化学', '生物'];
let schoolFilters = ['全部学校', '广东北江中学', '韶关市第一中学', '韶关市第二中学', '乐昌市第一中学'];
let schoolFilterIndex = 0;
let rankings = [];
let overview = {
  totalStudents: 0,
  average: 0,
  highest: 0,
  passRate: 0
};

// 页面加载
function init() {
  // 获取URL参数
  const urlParams = new URLSearchParams(window.location.search);
  examId = urlParams.get('examId');
  
  // 初始化学校筛选
  const schoolFilter = document.getElementById('schoolFilter');
  schoolFilter.innerHTML = schoolFilters.map((school, index) => 
    `<option value="${index}">${school}</option>`
  ).join('');
  
  loadRankings();
}

// 加载排名数据
async function loadRankings() {
  try {
    const res = await jointExamsAPI.getRankings(examId, currentDimension, currentSubject);
    
    if (res.code === 200) {
      rankings = res.data.rankings;
      subjects = res.data.subjects;
      overview = res.data.overview;
      
      renderSubjects();
      renderTopThree();
      renderTable();
      renderOverview();
    }
  } catch (error) {
    console.error('加载排名失败:', error);
    alert('加载失败');
  }
}

// 渲染科目选择器
function renderSubjects() {
  const scroll = document.getElementById('subjectScroll');
  scroll.innerHTML = subjects.map(subject => `
    <div class="subject-tab ${subject === currentSubject ? 'active' : ''}" 
         onclick="onSubjectSelect('${subject}')">
      ${subject}
    </div>
  `).join('');
}

// 渲染前三名
function renderTopThree() {
  const section = document.getElementById('topThreeSection');
  
  if (rankings.length < 3) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  const topThree = document.getElementById('topThree');
  const medalEmojis = ['🥇', '🥈', '🥉'];
  const rankClasses = ['first', 'second', 'third'];
  const order = [1, 0, 2]; // 显示顺序：第二名、第一名、第三名
  
  topThree.innerHTML = order.map((index, displayIndex) => {
    const item = rankings[index];
    return `
      <div class="top-item ${rankClasses[index]}">
        ${index === 0 ? '<div class="crown">👑</div>' : ''}
        <div class="top-rank">${item.rank}</div>
        <div class="top-avatar">${medalEmojis[index]}</div>
        <span class="top-name">${item.studentName}</span>
        <span class="top-school">${item.schoolName}</span>
        <span class="top-score">${item.score}分</span>
      </div>
    `;
  }).join('');
}

// 渲染表格
function renderTable() {
  // 渲染表头
  const header = document.getElementById('tableHeader');
  let headerHTML = `
    <span class="th th-rank">排名</span>
    <span class="th th-school">学校</span>
    <span class="th th-student">学生</span>
  `;
  
  if (currentDimension === 'total') {
    subjects.forEach(subject => {
      headerHTML += `<span class="th th-subject">${subject}</span>`;
    });
  }
  
  headerHTML += `<span class="th th-score">成绩</span>`;
  header.innerHTML = headerHTML;
  
  // 渲染表格内容
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = rankings.map(item => {
    const rankClass = item.rank <= 3 ? `top-rank-${item.rank}` : '';
    const rankHighlight = item.rank <= 3 ? 'highlight' : '';
    
    let rowHTML = `
      <div class="table-row ${rankClass}">
        <div class="td td-rank">
          <span class="rank-number ${rankHighlight}">${item.rank}</span>
        </div>
        <span class="td td-school">${item.schoolName}</span>
        <span class="td td-student">${item.studentName}</span>
    `;
    
    if (currentDimension === 'total') {
      item.subjectScores.forEach(score => {
        rowHTML += `<span class="td td-subject">${score}</span>`;
      });
    }
    
    rowHTML += `<span class="td td-score">${item.score}</span></div>`;
    return rowHTML;
  }).join('');
}

// 渲染统计概览
function renderOverview() {
  document.getElementById('overviewTotal').textContent = overview.totalStudents;
  document.getElementById('overviewAverage').textContent = overview.average;
  document.getElementById('overviewHighest').textContent = overview.highest;
  document.getElementById('overviewPassRate').textContent = overview.passRate + '%';
}

// 维度切换
function onDimensionChange(element) {
  const dimension = element.dataset.dimension;
  currentDimension = dimension;
  
  // 更新UI
  document.querySelectorAll('.dimension-item').forEach(item => {
    item.classList.remove('active');
  });
  element.classList.add('active');
  
  // 显示/隐藏科目选择器
  document.getElementById('subjectSelector').style.display = 
    dimension === 'subject' ? 'block' : 'none';
  
  loadRankings();
}

// 科目选择
function onSubjectSelect(subject) {
  currentSubject = subject;
  renderSubjects();
  loadRankings();
}

// 学校筛选
function onSchoolFilterChange() {
  const select = document.getElementById('schoolFilter');
  schoolFilterIndex = parseInt(select.value);
  // 这里可以根据选择的学校筛选排名数据
}

// 导出排名
function exportRankings() {
  alert('生成中...');
  
  setTimeout(() => {
    alert('导出成功');
  }, 1000);
}

// 初始化
init();
