// 数据状态
let form = {
  name: '',
  examDate: '',
  duration: '',
  description: ''
};

let schoolList = [
  { id: 1, name: '广东北江中学', selected: false },
  { id: 2, name: '韶关市第一中学', selected: false },
  { id: 3, name: '韶关市第二中学', selected: false },
  { id: 4, name: '乐昌市第一中学', selected: false },
  { id: 5, name: '南雄市第一中学', selected: false },
  { id: 6, name: '仁化县第一中学', selected: false },
  { id: 7, name: '始兴县第一中学', selected: false },
  { id: 8, name: '翁源县第一中学', selected: false },
  { id: 9, name: '新丰县第一中学', selected: false },
  { id: 10, name: '乳源瑶族自治县高级中学', selected: false },
  { id: 11, name: '韶关市田家炳中学', selected: false },
  { id: 12, name: '韶关市第五中学', selected: false }
];

let subjects = [
  { name: '语文', fullScore: '150' },
  { name: '数学', fullScore: '150' },
  { name: '英语', fullScore: '150' }
];

let isFormValid = false;

// 初始化日期选择
function initDaySelect() {
  const daySelect = document.getElementById('daySelect');
  daySelect.innerHTML = '<option value="">选择日期</option>';
  for (let i = 1; i <= 31; i++) {
    daySelect.innerHTML += `<option value="${i}日">${i}日</option>`;
  }
}

// 页面加载
function init() {
  initDaySelect();
  renderSchools();
  renderSubjects();
  checkFormValid();
}

// 渲染学校选择器
function renderSchools() {
  const selector = document.getElementById('schoolSelector');
  const selectedCount = schoolList.filter(s => s.selected).length;
  document.getElementById('selectedCount').textContent = `(已选 ${selectedCount} 所)`;
  
  selector.innerHTML = schoolList.map(school => `
    <div class="school-option ${school.selected ? 'selected' : ''}" onclick="toggleSchool(${school.id})">
      <span class="school-check">${school.selected ? '✓' : ''}</span>
      <span class="school-name">${school.name}</span>
    </div>
  `).join('');
}

// 渲染科目列表
function renderSubjects() {
  const list = document.getElementById('subjectList');
  list.innerHTML = subjects.map((subject, index) => `
    <div class="subject-item">
      <div class="subject-info">
        <input 
          class="subject-input" 
          placeholder="科目名称"
          value="${subject.name}"
          oninput="onSubjectNameInput(${index}, this.value)"
        />
        <input 
          class="score-input" 
          type="number"
          placeholder="满分"
          value="${subject.fullScore}"
          oninput="onSubjectScoreInput(${index}, this.value)"
        />
      </div>
      <span class="delete-btn" onclick="deleteSubject(${index})">删除</span>
    </div>
  `).join('');
}

// 表单输入处理
function onNameInput(value) {
  form.name = value;
  checkFormValid();
}

function onDateChange() {
  const year = document.getElementById('yearSelect').value;
  const month = document.getElementById('monthSelect').value;
  const day = document.getElementById('daySelect').value;
  
  if (year && month && day) {
    form.examDate = `${year}${month}${day}`;
    document.getElementById('dateDisplay').textContent = form.examDate;
    document.getElementById('dateDisplay').classList.add('selected');
  } else {
    form.examDate = '';
    document.getElementById('dateDisplay').textContent = '请选择考试日期';
    document.getElementById('dateDisplay').classList.remove('selected');
  }
  checkFormValid();
}

function onDurationInput(value) {
  form.duration = value;
  checkFormValid();
}

function onDescriptionInput(value) {
  form.description = value;
  document.getElementById('textareaCount').textContent = `${value.length}/500`;
}

// 学校选择
function toggleSchool(id) {
  const index = schoolList.findIndex(s => s.id === id);
  if (index !== -1) {
    schoolList[index].selected = !schoolList[index].selected;
    renderSchools();
    checkFormValid();
  }
}

// 科目管理
function showAddSubject() {
  document.getElementById('subjectModal').style.display = 'flex';
  document.getElementById('newSubjectName').value = '';
  document.getElementById('newSubjectScore').value = '';
}

function hideAddSubject() {
  document.getElementById('subjectModal').style.display = 'none';
}

function confirmAddSubject() {
  const name = document.getElementById('newSubjectName').value.trim();
  const fullScore = document.getElementById('newSubjectScore').value || '100';
  
  if (!name) {
    alert('请输入科目名称');
    return;
  }
  
  subjects.push({ name, fullScore });
  renderSubjects();
  hideAddSubject();
  checkFormValid();
}

function onSubjectNameInput(index, value) {
  subjects[index].name = value;
  checkFormValid();
}

function onSubjectScoreInput(index, value) {
  subjects[index].fullScore = value;
}

function deleteSubject(index) {
  if (subjects.length <= 1) {
    alert('至少保留一个科目');
    return;
  }
  
  subjects.splice(index, 1);
  renderSubjects();
  checkFormValid();
}

// 表单验证
function checkFormValid() {
  const selectedSchools = schoolList.filter(s => s.selected);
  
  const isValid = form.name.trim() && 
                 form.examDate && 
                 form.duration && 
                 selectedSchools.length > 0 && 
                 subjects.length > 0 &&
                 subjects.every(s => s.name.trim());
  
  isFormValid = isValid;
  document.getElementById('submitBtn').disabled = !isValid;
}

// 提交表单
function onSubmit(e) {
  e.preventDefault();
  
  if (!isFormValid) {
    alert('请完善表单信息');
    return;
  }

  const selectedSchools = schoolList.filter(s => s.selected);

  const examData = {
    ...form,
    schools: selectedSchools.map(s => s.id),
    subjects: subjects
  };

  console.log('提交联考数据:', examData);

  // 模拟提交
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.textContent = '提交中...';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    alert('发起成功');
    location.href = '../index/index.html';
  }, 1000);
}

function onCancel() {
  if (confirm('确定要取消吗？已填写的信息将不会保存')) {
    history.back();
  }
}

// 初始化
init();
