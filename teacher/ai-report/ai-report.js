// AI 教师报告页面
let teachers = [];
let selectedTeacher = null;

// 页面加载
window.onload = function() {
  loadTeachers();
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
    option.textContent = teacher.name + ' - ' + teacher.subject;
    select.appendChild(option);
  });
}

// 教师选择变化
function onTeacherChange() {
  const teacherId = document.getElementById('teacherSelect').value;
  
  if (!teacherId) {
    document.getElementById('reportContainer').classList.remove('show');
    document.getElementById('emptyState').style.display = 'flex';
    return;
  }
  
  selectedTeacher = teachers.find(t => t.id === teacherId);
  
  document.getElementById('reportContainer').classList.add('show');
  document.getElementById('emptyState').style.display = 'none';
  
  generateReport();
}

// 生成报告
function generateReport() {
  if (!selectedTeacher) return;
  
  // 显示加载状态
  document.getElementById('analysisContent').innerHTML = '<div class="loading">正在生成分析报告...</div>';
  document.getElementById('suggestionsList').innerHTML = '';
  
  // 模拟加载延迟
  setTimeout(() => {
    // 生成模拟数据
    const courseCount = Math.floor(Math.random() * 10) + 10; // 10-20节课
    const attendanceRate = Math.floor(Math.random() * 10) + 90; // 90-100%
    const studentCount = Math.floor(Math.random() * 50) + 100; // 100-150学生
    const evaluationScore = (Math.random() * 1 + 4).toFixed(1); // 4.0-5.0分
    
    // 更新统计数据
    document.getElementById('courseCount').textContent = courseCount;
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
    document.getElementById('studentCount').textContent = studentCount;
    document.getElementById('evaluationScore').textContent = evaluationScore;
    
    // 生成AI分析内容
    const analysisHTML = generateAnalysisContent(selectedTeacher, courseCount, attendanceRate, evaluationScore);
    document.getElementById('analysisContent').innerHTML = analysisHTML;
    
    // 生成建议
    const suggestions = generateSuggestions(evaluationScore);
    document.getElementById('suggestionsList').innerHTML = suggestions.map(s => `
      <div class="suggestion-item">
        <span class="suggestion-icon">${s.icon}</span>
        <div class="suggestion-content">
          <div class="suggestion-title">${s.title}</div>
          <div class="suggestion-desc">${s.desc}</div>
        </div>
      </div>
    `).join('');
    
  }, 1000);
}

// 生成分析内容
function generateAnalysisContent(teacher, courseCount, attendanceRate, evaluationScore) {
  const analyses = [
    `<p><strong>教学表现评估：</strong>${teacher.name}老师本教学周期内共完成${courseCount}节课程教学，整体出勤率达到${attendanceRate}%，学生评教分数为${evaluationScore}分（满分5分）。</p>`,
    
    `<p><strong>教学优势分析：</strong>该教师在${teacher.subject}教学方面表现突出，课堂组织能力较强，能够有效地将理论知识与实践应用相结合。学生反馈显示，教学内容讲解清晰，重难点把握准确。</p>`,
    
    `<p><strong>学生互动情况：</strong>课堂互动环节设计合理，学生参与度较高。通过课后调研发现，学生对教学内容的理解程度良好，课后作业完成率达到95%以上。</p>`,
    
    `<p><strong>综合建议：</strong>建议继续保持当前的教学节奏，同时可以尝试引入更多互动式教学方法，如小组讨论、案例分析等，进一步提升学生的学习积极性和主动性。</p>`
  ];
  
  return analyses.join('');
}

// 生成建议
function generateSuggestions(evaluationScore) {
  const score = parseFloat(evaluationScore);
  
  const suggestions = [
    {
      icon: '🎯',
      title: '优化教学方法',
      desc: '建议采用翻转课堂、项目式学习等新型教学模式，提高学生的主动学习能力和创新思维。'
    },
    {
      icon: '📚',
      title: '丰富教学资源',
      desc: '可以整合更多数字化教学资源，如在线课程、虚拟实验等，为学生提供多样化的学习途径。'
    },
    {
      icon: '🤝',
      title: '加强师生互动',
      desc: '建议增加课后答疑时间，建立有效的沟通渠道，及时了解学生的学习困难和需求。'
    },
    {
      icon: '📊',
      title: '关注个体差异',
      desc: '针对不同学习能力的学生，设计分层教学方案，确保每个学生都能得到适合的教育支持。'
    }
  ];
  
  if (score < 4.5) {
    suggestions.push({
      icon: '⚠️',
      title: '提升教学效果',
      desc: '根据评教反馈，建议重点关注课堂教学质量的提升，可以通过同行听课、教学研讨等方式改进教学方法。'
    });
  }
  
  return suggestions;
}

// 返回
function goBack() {
  history.back();
}
