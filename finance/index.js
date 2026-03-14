// 财务首页
(function() {
  // 页面数据
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
  let recentRecords = [];

  // 收入分类
  const INCOME_CATEGORIES = ['学费收入', '政府拨款', '捐赠收入', '其他收入'];
  // 支出分类
  const EXPENSE_CATEGORIES = ['教职工工资', '教学用品', '设备维护', '水电费', '办公费用', '维修费用', '其他支出'];

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

  // 加载数据
  function loadData() {
    // 获取本月统计
    monthStats = getMonthStats();

    // 获取预算状态
    budgetStatus = getBudgetStatus();

    // 获取趋势数据
    trendData = getTrendData();

    // 获取最近记录
    const allRecords = getRecords();
    recentRecords = allRecords.slice(0, 5);

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

    // 计算年度已使用
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
    const maxHeight = 100; // 最大高度100px
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

    // 更新最近记录
    const recordsContainer = document.getElementById('recentRecords');
    if (recentRecords.length === 0) {
      recordsContainer.innerHTML = '<div class="empty-tip">暂无收支记录</div>';
    } else {
      recordsContainer.innerHTML = recentRecords.map(item => `
        <div class="record-item">
          <div class="record-icon ${item.type}">
            ${item.type === 'income' ? '收' : '支'}
          </div>
          <div class="record-info">
            <span class="record-category">${item.category}</span>
            <span class="record-date">${item.date}</span>
          </div>
          <div class="record-amount">
            <span class="amount ${item.type}">${item.type === 'income' ? '+' : '-'}¥${item.amount}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // 跳转到记账页
  window.goToRecord = function() {
    location.href = 'record.html';
  };

  // 跳转到报表页
  window.goToReport = function() {
    location.href = 'report.html';
  };

  // 跳转到预算页
  window.goToBudget = function() {
    location.href = 'budget.html';
  };

  // 跳转到AI智慧财报页
  window.goToAIReport = function() {
    location.href = 'ai-report.html';
  };

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);
})();
