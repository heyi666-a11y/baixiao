// 数据状态
let examId = null;
let schools = [
  { id: 1, name: '广东北江中学' },
  { id: 2, name: '韶关市第一中学' },
  { id: 3, name: '韶关市第二中学' },
  { id: 4, name: '乐昌市第一中学' }
];
let subjects = ['语文', '数学', '英语', '物理', '化学', '生物'];
let currentSchool = null;
let currentSubject = null;
let students = [];
let hasEnteredScores = false;
let canSubmit = false;
let stats = {
  entered: 0,
  pending: 0,
  average: 0,
  highest: 0
};

// 页面加载
function init() {
  // 获取URL参数
  const urlParams = new URLSearchParams(window.location.search);
  examId = urlParams.get('examId');
  
  // 初始化选择器
  initSelectors();
  loadStudents();
}

// 初始化选择器
function initSelectors() {
  const schoolSelect = document.getElementById('schoolSelect');
  schoolSelect.innerHTML = '<option value="">请选择学校</option>' +
    schools.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  
  const subjectSelect = document.getElementById('subjectSelect');
  subjectSelect.innerHTML = '<option value="">请选择科目</option>' +
    subjects.map(s => `<option value="${s}">${s}</option>`).join('');
}

// 加载学生列表
function loadStudents() {
  // 模拟加载学生列表
  const mockStudents = [
    { id: 1, name: '张小明', score: '' },
    { id: 2, name: '李小红', score: '' },
    { id: 3, name: '王大伟', score: '' },
    { id: 4, name: '刘小强', score: '' },
    { id: 5, name: '陈小丽', score: '' },
    { id: 6, name: '杨小军', score: '' },
    { id: 7, name: '黄小芳', score: '' },
    { id: 8, name: '周小华', score: '' },
    { id: 9, name: '吴小波', score: '' },
    { id: 10, name: '徐小静', score: '' }
  ];
  students = mockStudents;
}

// 学校选择变化
function onSchoolChange() {
  const select = document.getElementById('schoolSelect');
  const schoolId = parseInt(select.value);
  currentSchool = schools.find(s => s.id === schoolId) || null;
  updateUI();
}

// 科目选择变化
function onSubjectChange() {
  const select = document.getElementById('subjectSelect');
  currentSubject = select.value || null;
  updateUI();
}

// 更新UI
function updateUI() {
  const hasSelection = currentSchool && currentSubject;
  
  document.getElementById('emptyState').style.display = hasSelection ? 'none' : 'flex';
  document.getElementById('batchSection').style.display = hasSelection ? 'block' : 'none';
  document.getElementById('scoreSection').style.display = hasSelection ? 'block' : 'none';
  document.getElementById('bottomBar').style.display = hasSelection ? 'flex' : 'none';
  
  if (hasSelection) {
    renderTable();
    updateStats();
    checkCanSubmit();
  }
}

// 渲染表格
function renderTable() {
  document.getElementById('studentCount').textContent = `共 ${students.length} 名学生`;
  
  const tbody = document.getElementById('tableBody');
  tbody.innerHTML = students.map((student, index) => {
    const scoreClass = student.score > 100 ? 'high' : student.score < 60 ? 'low' : '';
    const hasScore = student.score !== '';
    
    return `
      <div class="table-row ${hasScore ? 'has-score' : ''}">
        <span class="td td-index">${index + 1}</span>
        <span class="td td-name">${student.name}</span>
        <span class="td td-score">
          <input 
            class="score-input ${scoreClass}"
            type="number"
            placeholder="--"
            value="${student.score}"
            oninput="onScoreInput(${index}, this.value)"
            onblur="onScoreBlur(${index}, this.value)"
          />
        </span>
        <span class="td td-action" onclick="clearScore(${index})">清除</span>
      </div>
    `;
  }).join('');
}

// 成绩输入
function onScoreInput(index, value) {
  students[index].score = value;
  updateStats();
  checkCanSubmit();
  renderTable();
}

// 成绩失去焦点验证
function onScoreBlur(index, value) {
  if (value !== '') {
    const numScore = parseFloat(value);
    if (numScore < 0 || numScore > 150) {
      alert('分数应在0-150之间');
      students[index].score = '';
      renderTable();
      updateStats();
      checkCanSubmit();
    }
  }
}

// 清除成绩
function clearScore(index) {
  students[index].score = '';
  renderTable();
  updateStats();
  checkCanSubmit();
}

// 更新统计
function updateStats() {
  const enteredScores = students.filter(s => s.score !== '');
  const entered = enteredScores.length;
  const pending = students.length - entered;
  
  let average = 0;
  let highest = 0;
  
  if (entered > 0) {
    const total = enteredScores.reduce((sum, s) => sum + parseFloat(s.score || 0), 0);
    average = (total / entered).toFixed(1);
    highest = Math.max(...enteredScores.map(s => parseFloat(s.score)));
  }

  hasEnteredScores = entered > 0;
  stats = { entered, pending, average, highest };
  
  document.getElementById('statsSection').style.display = hasEnteredScores ? 'block' : 'none';
  document.getElementById('statEntered').textContent = entered;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statAverage').textContent = average;
  document.getElementById('statHighest').textContent = highest;
}

// 检查是否可以提交
function checkCanSubmit() {
  const hasAllScores = students.every(s => s.score !== '');
  canSubmit = currentSchool && currentSubject && hasAllScores;
  
  const submitBtn = document.getElementById('submitBtn');
  if (canSubmit) {
    submitBtn.classList.remove('disabled');
  } else {
    submitBtn.classList.add('disabled');
  }
}

// 批量导入
function showBatchImport() {
  document.getElementById('importModal').style.display = 'flex';
  document.getElementById('importTextarea').value = '';
}

function hideBatchImport() {
  document.getElementById('importModal').style.display = 'none';
}

function confirmBatchImport() {
  const importText = document.getElementById('importTextarea').value;
  if (!importText.trim()) {
    alert('请输入成绩数据');
    return;
  }

  // 解析导入数据
  const lines = importText.trim().split('\n');
  let successCount = 0;
  let failCount = 0;

  lines.forEach(line => {
    const parts = line.split(/[,，]/);
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const score = parts[1].trim();
      const student = students.find(s => s.name === name);
      if (student && !isNaN(parseFloat(score))) {
        student.score = score;
        successCount++;
      } else {
        failCount++;
      }
    }
  });

  renderTable();
  updateStats();
  checkCanSubmit();
  hideBatchImport();
  
  alert(`成功导入${successCount}条成绩`);
}

// 保存成绩
function saveScores() {
  alert('保存成功');
}

// 提交成绩
function submitScores() {
  if (!canSubmit) {
    alert('请完成所有成绩录入');
    return;
  }

  if (confirm('提交后成绩将无法修改，是否确认提交？')) {
    alert('提交成功');
    setTimeout(() => {
      history.back();
    }, 1500);
  }
}

// 初始化
init();
