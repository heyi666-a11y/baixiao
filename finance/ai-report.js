// AI智慧财报页面
(function() {
  // 财务统计数据
  let monthStats = {
    income: '0.00',
    expense: '0.00',
    balance: '0.00'
  };
  let budgetStatus = {
    yearRemaining: '0.00'
  };
  let trendData = {
    months: [],
    incomeData: [],
    expenseData: []
  };
  let aiAnalysis = null;
  let isAnalyzing = false;
  let analysisTime = '';

  // AI配置
  const apiConfig = {
    apiKey: '702cce54fab44c0e81c28d6fe98a4c40.VcC3hpNDQeY8yiCa',
    apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    model: 'glm-4-flash'
  };

  // 初始化
  function init() {
    // 检查密码验证状态
    const financeAuth = localStorage.getItem('finance_auth');
    if (!financeAuth) {
      location.href = 'login.html';
      return;
    }

    loadData();
  }

  // 加载财务数据
  function loadData() {
    // 获取本月统计
    monthStats = getMonthStats();

    // 获取预算状态
    const status = getBudgetStatus();
    budgetStatus = {
      yearRemaining: status.yearRemaining
    };

    // 获取趋势数据
    trendData = getTrendData();

    // 更新UI
    updateUI();
  }

  // 获取本月统计
  function getMonthStats() {
    const records = getRecords();
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthRecords = records.filter(item => {
      const date = new Date(item.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const income = monthRecords
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);

    const expense = monthRecords
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);

    return {
      income: income.toFixed(2),
      expense: expense.toFixed(2),
      balance: (income - expense).toFixed(2)
    };
  }

  // 获取预算状态
  function getBudgetStatus() {
    const budget = getBudget();
    const records = getRecords();
    const now = new Date();
    const currentYear = now.getFullYear();

    const yearRecords = records.filter(item => {
      const date = new Date(item.date);
      return date.getFullYear() === currentYear && item.type === 'expense';
    });

    const yearUsed = yearRecords.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const yearRemaining = Math.max(0, budget.yearTotal - yearUsed);

    return {
      yearRemaining: yearRemaining.toFixed(2)
    };
  }

  // 获取预算
  function getBudget() {
    const defaultBudget = {
      yearTotal: 100000,
      categories: {
        '教职工工资': 50000,
        '教学用品': 15000,
        '设备维护': 10000,
        '水电费': 8000,
        '办公费用': 5000,
        '维修费用': 7000,
        '其他支出': 5000
      }
    };
    const saved = localStorage.getItem('finance_budget');
    return saved ? JSON.parse(saved) : defaultBudget;
  }

  // 获取趋势数据
  function getTrendData() {
    const records = getRecords();
    const months = [];
    const incomeData = [];
    const expenseData = [];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getMonth() + 1}月`;
      months.push(monthStr);

      const monthRecords = records.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === d.getMonth() && itemDate.getFullYear() === d.getFullYear();
      });

      const income = monthRecords
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + parseFloat(item.amount), 0);

      const expense = monthRecords
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + parseFloat(item.amount), 0);

      incomeData.push(income);
      expenseData.push(expense);
    }

    return { months, incomeData, expenseData };
  }

  // 获取所有记录
  function getRecords() {
    const saved = localStorage.getItem('finance_records');
    return saved ? JSON.parse(saved) : [];
  }

  // 计算条形图高度
  function calculateBarHeight(value) {
    const maxValue = Math.max(
      ...trendData.incomeData,
      ...trendData.expenseData,
      1
    );
    const maxHeight = 100;
    return Math.max((value / maxValue) * maxHeight, 5);
  }

  // 更新UI
  function updateUI() {
    // 更新统计卡片
    document.getElementById('monthIncome').textContent = '¥' + monthStats.income;
    document.getElementById('monthExpense').textContent = '¥' + monthStats.expense;
    document.getElementById('monthBalance').textContent = '¥' + monthStats.balance;
    document.getElementById('yearRemaining').textContent = '¥' + budgetStatus.yearRemaining;

    // 更新趋势图表
    const chartContainer = document.getElementById('trendChart');
    chartContainer.innerHTML = '';
    trendData.months.forEach((month, index) => {
      const incomeHeight = calculateBarHeight(trendData.incomeData[index]);
      const expenseHeight = calculateBarHeight(trendData.expenseData[index]);

      const chartItem = document.createElement('div');
      chartItem.className = 'chart-item';
      chartItem.innerHTML = `
        <div class="bars">
          <div class="bar income-bar" style="height: ${incomeHeight}px;"></div>
          <div class="bar expense-bar" style="height: ${expenseHeight}px;"></div>
        </div>
        <span class="chart-label">${month}</span>
      `;
      chartContainer.appendChild(chartItem);
    });

    // 更新AI分析区域显示
    updateAIAnalysisDisplay();
  }

  // 更新AI分析显示
  function updateAIAnalysisDisplay() {
    const actionSection = document.getElementById('aiActionSection');
    const analyzingSection = document.getElementById('aiAnalyzingSection');
    const resultSection = document.getElementById('aiResultSection');

    if (isAnalyzing) {
      actionSection.style.display = 'none';
      analyzingSection.style.display = 'block';
      resultSection.style.display = 'none';
    } else if (aiAnalysis) {
      actionSection.style.display = 'none';
      analyzingSection.style.display = 'none';
      resultSection.style.display = 'block';

      // 更新时间
      document.getElementById('analysisTime').textContent = analysisTime;

      // 更新内容
      updateAIResultContent();
    } else {
      actionSection.style.display = 'block';
      analyzingSection.style.display = 'none';
      resultSection.style.display = 'none';
    }
  }

  // 更新AI结果内容
  function updateAIResultContent() {
    const contentContainer = document.getElementById('aiResultContent');

    let html = '';

    // 总体评价
    if (aiAnalysis.overallEvaluation) {
      html += `
        <div class="result-block">
          <div class="block-title">
            <span class="block-icon">📋</span>
            <span>总体评价</span>
          </div>
          <div class="block-content quote-box">
            <span class="quote-mark">"</span>
            <span class="quote-text">${aiAnalysis.overallEvaluation}</span>
          </div>
        </div>
      `;
    }

    // 收支分析
    if (aiAnalysis.incomeExpenseAnalysis) {
      html += `
        <div class="result-block">
          <div class="block-title">
            <span class="block-icon">💹</span>
            <span>收支分析</span>
          </div>
          <div class="block-content">${aiAnalysis.incomeExpenseAnalysis}</div>
        </div>
      `;
    }

    // 趋势分析
    if (aiAnalysis.trendAnalysis) {
      html += `
        <div class="result-block">
          <div class="block-title">
            <span class="block-icon">📊</span>
            <span>趋势分析</span>
          </div>
          <div class="block-content">${aiAnalysis.trendAnalysis}</div>
        </div>
      `;
    }

    // 预算评估
    if (aiAnalysis.budgetAssessment) {
      html += `
        <div class="result-block">
          <div class="block-title">
            <span class="block-icon">🎯</span>
            <span>预算评估</span>
          </div>
          <div class="block-content">${aiAnalysis.budgetAssessment}</div>
        </div>
      `;
    }

    // 优化建议
    if (aiAnalysis.suggestions && aiAnalysis.suggestions.length > 0) {
      html += `
        <div class="result-block highlight">
          <div class="block-title">
            <span class="block-icon">💡</span>
            <span>优化建议</span>
          </div>
          <div class="block-content">
            <div class="suggestion-list">
              ${aiAnalysis.suggestions.map((item, index) => `
                <div class="suggestion-item">
                  <span class="suggestion-num">${index + 1}</span>
                  <span class="suggestion-text">${item}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // 风险提示
    if (aiAnalysis.riskWarnings && aiAnalysis.riskWarnings.length > 0) {
      html += `
        <div class="result-block warning">
          <div class="block-title">
            <span class="block-icon">⚠️</span>
            <span>风险提示</span>
          </div>
          <div class="block-content">
            <div class="warning-list">
              ${aiAnalysis.riskWarnings.map(item => `
                <div class="warning-item">
                  <span class="warning-icon">!</span>
                  <span class="warning-text">${item}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    contentContainer.innerHTML = html;
  }

  // 开始AI分析
  window.startAIAnalysis = function() {
    isAnalyzing = true;
    aiAnalysis = null;
    updateAIAnalysisDisplay();

    // 准备财务数据
    const financeData = prepareFinanceData();

    // 调用AI接口
    callAI(financeData);
  };

  // 准备财务数据
  function prepareFinanceData() {
    // 计算趋势分析
    const incomeTrend = calculateTrend(trendData.incomeData);
    const expenseTrend = calculateTrend(trendData.expenseData);

    // 计算收支比
    const income = parseFloat(monthStats.income);
    const expense = parseFloat(monthStats.expense);
    const balance = parseFloat(monthStats.balance);
    const yearRemaining = parseFloat(budgetStatus.yearRemaining);

    return {
      currentMonth: {
        income: income.toFixed(2),
        expense: expense.toFixed(2),
        balance: balance.toFixed(2),
        ratio: expense > 0 ? (income / expense).toFixed(2) : 'N/A'
      },
      budget: {
        yearRemaining: yearRemaining.toFixed(2)
      },
      trend: {
        months: trendData.months,
        incomeData: trendData.incomeData,
        expenseData: trendData.expenseData,
        incomeTrend: incomeTrend,
        expenseTrend: expenseTrend
      },
      summary: {
        totalIncome6Months: trendData.incomeData.reduce((a, b) => a + b, 0).toFixed(2),
        totalExpense6Months: trendData.expenseData.reduce((a, b) => a + b, 0).toFixed(2),
        avgMonthlyIncome: (trendData.incomeData.reduce((a, b) => a + b, 0) / 6).toFixed(2),
        avgMonthlyExpense: (trendData.expenseData.reduce((a, b) => a + b, 0) / 6).toFixed(2)
      }
    };
  }

  // 计算趋势（上升/下降/平稳）
  function calculateTrend(data) {
    if (data.length < 2) return '数据不足';

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (firstAvg === 0) return '数据不足';

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return `上升 ${change.toFixed(1)}%`;
    if (change < -10) return `下降 ${Math.abs(change).toFixed(1)}%`;
    return '相对平稳';
  }

  // 获取系统角色设定
  function getSystemRole() {
    return {
      role: 'system',
      content: `你是一位专业的财务分析师，专注于学校财务管理领域。你的职责是为学校财务数据提供专业的分析和建议。

【分析要求】
1. 基于提供的财务数据进行深入分析
2. 从收支平衡、预算执行、趋势变化等维度进行评估
3. 提供具体、可操作的建议
4. 识别潜在的财务风险

【输出格式】
请以JSON格式返回分析结果，包含以下字段：
{
  "overallEvaluation": "总体评价，100字左右的概括性评价",
  "incomeExpenseAnalysis": "收支分析，分析当前收支状况和平衡情况",
  "trendAnalysis": "趋势分析，分析近6个月的财务趋势",
  "budgetAssessment": "预算评估，评估预算执行情况",
  "suggestions": ["建议1", "建议2", "建议3"],
  "riskWarnings": ["风险1", "风险2"]
}

【分析原则】
1. 客观公正，基于数据说话
2. 关注异常波动和潜在问题
3. 提供建设性意见
4. 语言专业但易懂`
    };
  }

  // 调用AI接口
  function callAI(financeData) {
    const systemRole = getSystemRole();

    const userPrompt = `请分析以下学校财务数据并提供专业建议：

【本月财务概况】
- 收入：¥${financeData.currentMonth.income}
- 支出：¥${financeData.currentMonth.expense}
- 结余：¥${financeData.currentMonth.balance}
- 收支比：${financeData.currentMonth.ratio}

【预算情况】
- 年度剩余预算：¥${financeData.budget.yearRemaining}

【近6个月趋势】
- 月份：${financeData.trend.months.join('、')}
- 收入趋势：${financeData.trend.incomeTrend}
- 支出趋势：${financeData.trend.expenseTrend}

【6个月汇总】
- 总收入：¥${financeData.summary.totalIncome6Months}
- 总支出：¥${financeData.summary.totalExpense6Months}
- 月均收入：¥${financeData.summary.avgMonthlyIncome}
- 月均支出：¥${financeData.summary.avgMonthlyExpense}

请提供JSON格式的分析结果。`;

    fetch(apiConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: apiConfig.model,
        messages: [
          systemRole,
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.choices && data.choices[0]) {
        const aiResponse = data.choices[0].message.content;
        parseAIResponse(aiResponse);
      } else {
        console.error('AI响应异常:', data);
        handleAIError('AI响应异常');
      }
    })
    .catch(err => {
      console.error('AI请求失败', err);
      handleAIError('网络请求失败，请检查网络连接');
    });
  }

  // 解析AI响应
  function parseAIResponse(response) {
    try {
      // 尝试从响应中提取JSON
      let jsonStr = response;

      // 如果响应包含markdown代码块，提取其中的JSON
      const jsonMatch = response.match(/```json\s*([\s\S]*?)```/) ||
                        response.match(/```\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      // 清理可能的额外字符
      jsonStr = jsonStr.trim();

      const analysisResult = JSON.parse(jsonStr);

      // 获取当前时间
      const now = new Date();
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      aiAnalysis = analysisResult;
      isAnalyzing = false;
      analysisTime = timeStr;

      updateAIAnalysisDisplay();

      // 保存分析结果到本地
      saveAnalysisResult(analysisResult, timeStr);

    } catch (e) {
      console.error('解析AI响应失败:', e);
      // 如果解析失败，尝试使用原始文本
      aiAnalysis = {
        overallEvaluation: response.substring(0, 200) + '...',
        suggestions: ['AI返回格式异常，请稍后重试']
      };
      isAnalyzing = false;
      analysisTime = new Date().toLocaleString();
      updateAIAnalysisDisplay();
    }
  }

  // 处理AI错误
  function handleAIError(errorMsg) {
    isAnalyzing = false;
    aiAnalysis = {
      overallEvaluation: `分析失败：${errorMsg}`,
      suggestions: ['请检查网络连接后重试', '如果问题持续，请联系管理员'],
      riskWarnings: ['当前无法获取AI分析结果']
    };
    analysisTime = new Date().toLocaleString();
    updateAIAnalysisDisplay();
  }

  // 保存分析结果
  function saveAnalysisResult(result, time) {
    try {
      let history = JSON.parse(localStorage.getItem('ai_finance_analysis_history') || '[]');
      history.unshift({
        result,
        time,
        timestamp: Date.now()
      });
      // 只保留最近10条记录
      if (history.length > 10) {
        history.pop();
      }
      localStorage.setItem('ai_finance_analysis_history', JSON.stringify(history));
    } catch (e) {
      console.log('保存分析历史失败', e);
    }
  }

  // 加载历史分析结果
  function loadLastAnalysis() {
    try {
      const history = JSON.parse(localStorage.getItem('ai_finance_analysis_history') || '[]');
      if (history.length > 0) {
        const lastAnalysis = history[0];
        aiAnalysis = lastAnalysis.result;
        analysisTime = lastAnalysis.time;
        updateAIAnalysisDisplay();
      }
    } catch (e) {
      console.log('加载历史分析失败', e);
    }
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);
})();
