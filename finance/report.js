// 财务报表页面
(function() {
  // 页面数据
  let timeRange = 'month';
  let periodText = '';
  let summary = {
    income: '0.00',
    expense: '0.00',
    balance: '0.00'
  };
  let categoryData = {
    total: '0.00',
    categories: []
  };
  let filteredRecords = [];
  const pieColors = ['#4caf50', '#66bb6a', '#81c784', '#a5d6a7', '#c8e6c9', '#ff9800', '#f44336'];

  // 初始化
  function init() {
    // 检查密码验证状态
    const financeAuth = localStorage.getItem('finance_auth');
    if (!financeAuth) {
      location.href = 'login.html';
      return;
    }

    updatePeriodText();
    loadData();
  }

  // 选择时间范围
  window.selectTimeRange = function(range) {
    timeRange = range;

    // 更新UI
    document.getElementById('timeMonth').classList.toggle('active', range === 'month');
    document.getElementById('timeQuarter').classList.toggle('active', range === 'quarter');
    document.getElementById('timeYear').classList.toggle('active', range === 'year');

    updatePeriodText();
    loadData();
  };

  // 更新时间段文本
  function updatePeriodText() {
    const now = new Date();
    let text = '';

    switch (timeRange) {
      case 'month':
        text = `${now.getFullYear()}年${now.getMonth() + 1}月`;
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        text = `${now.getFullYear()}年第${quarter}季度`;
        break;
      case 'year':
        text = `${now.getFullYear()}年`;
        break;
    }

    periodText = text;
    document.getElementById('periodText').textContent = text;
  }

  // 加载数据
  function loadData() {
    // 获取所有记录
    const allRecords = getRecords();
    const now = new Date();

    // 筛选记录
    filteredRecords = [];
    if (timeRange === 'month') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      filteredRecords = allRecords.filter(item => {
        const date = new Date(item.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });
    } else if (timeRange === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const currentYear = now.getFullYear();
      filteredRecords = allRecords.filter(item => {
        const date = new Date(item.date);
        return Math.floor(date.getMonth() / 3) === currentQuarter && date.getFullYear() === currentYear;
      });
    } else if (timeRange === 'year') {
      const currentYear = now.getFullYear();
      filteredRecords = allRecords.filter(item => {
        const date = new Date(item.date);
        return date.getFullYear() === currentYear;
      });
    }

    // 计算收支汇总
    const income = filteredRecords
      .filter(item => item.type === 'income')
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);

    const expense = filteredRecords
      .filter(item => item.type === 'expense')
      .reduce((sum, item) => sum + parseFloat(item.amount), 0);

    summary = {
      income: income.toFixed(2),
      expense: expense.toFixed(2),
      balance: (income - expense).toFixed(2)
    };

    // 计算分类数据
    categoryData = getExpenseByCategory(filteredRecords);

    // 更新UI
    updateUI();
  }

  // 获取支出分类统计
  function getExpenseByCategory(records) {
    const expenseRecords = records.filter(item => item.type === 'expense');
    const categoryMap = {};

    expenseRecords.forEach(item => {
      if (!categoryMap[item.category]) {
        categoryMap[item.category] = 0;
      }
      categoryMap[item.category] += parseFloat(item.amount);
    });

    const total = Object.values(categoryMap).reduce((sum, val) => sum + val, 0);
    const categories = Object.keys(categoryMap).map(name => {
      const value = categoryMap[name];
      return {
        name,
        value: value.toFixed(2),
        percentage: total > 0 ? Math.round((value / total) * 100) : 0
      };
    }).sort((a, b) => parseFloat(b.value) - parseFloat(a.value));

    return { total: total.toFixed(2), categories };
  }

  // 获取所有记录
  function getRecords() {
    const saved = localStorage.getItem('finance_records');
    return saved ? JSON.parse(saved) : [];
  }

  // 更新UI
  function updateUI() {
    // 更新汇总
    document.getElementById('summaryIncome').textContent = '¥' + summary.income;
    document.getElementById('summaryExpense').textContent = '¥' + summary.expense;
    document.getElementById('summaryBalance').textContent = '¥' + summary.balance;

    // 更新记录数量
    document.getElementById('recordCount').textContent = `共${filteredRecords.length}条`;

    // 更新饼图
    updatePieChart();

    // 更新记录列表
    updateRecordList();
  }

  // 更新饼图
  function updatePieChart() {
    const visualContainer = document.getElementById('pieVisual');
    const legendContainer = document.getElementById('pieLegend');

    if (categoryData.categories.length === 0) {
      visualContainer.innerHTML = '';
      legendContainer.innerHTML = '<div class="empty-tip">暂无支出数据</div>';
      return;
    }

    // 更新视觉饼图
    visualContainer.innerHTML = categoryData.categories.map((cat, index) => {
      const flex = cat.percentage;
      const color = pieColors[index % pieColors.length];
      return `<div class="pie-segment" style="background-color: ${color}; flex: ${flex};"></div>`;
    }).join('');

    // 更新图例
    legendContainer.innerHTML = categoryData.categories.map((cat, index) => {
      const color = pieColors[index % pieColors.length];
      return `
        <div class="legend-item">
          <div class="legend-dot" style="background-color: ${color};"></div>
          <span class="legend-name">${cat.name}</span>
          <span class="legend-value">¥${cat.value}</span>
          <span class="legend-percent">${cat.percentage}%</span>
        </div>
      `;
    }).join('');
  }

  // 更新记录列表
  function updateRecordList() {
    const listContainer = document.getElementById('recordList');

    if (filteredRecords.length === 0) {
      listContainer.innerHTML = '<div class="empty-tip">暂无记录</div>';
      return;
    }

    listContainer.innerHTML = filteredRecords.map(item => `
      <div class="record-item">
        <div class="record-left">
          <div class="record-icon ${item.type}">
            ${item.type === 'income' ? '收' : '支'}
          </div>
          <div class="record-info">
            <span class="record-category">${item.category}</span>
            ${item.remark ? `<span class="record-remark">${item.remark}</span>` : ''}
            <span class="record-date">${item.date}</span>
          </div>
        </div>
        <div class="record-right">
          <span class="record-amount ${item.type}">${item.type === 'income' ? '+' : '-'}¥${item.amount}</span>
        </div>
      </div>
    `).join('');
  }

  // 导出报表
  window.exportReport = function() {
    // 构建报表内容
    let reportContent = `财务报表\n`;
    reportContent += `==================\n`;
    reportContent += `时间范围: ${periodText}\n\n`;
    reportContent += `收支汇总:\n`;
    reportContent += `  总收入: ¥${summary.income}\n`;
    reportContent += `  总支出: ¥${summary.expense}\n`;
    reportContent += `  结余: ¥${summary.balance}\n\n`;
    reportContent += `支出分类:\n`;
    categoryData.categories.forEach(cat => {
      reportContent += `  ${cat.name}: ¥${cat.value} (${cat.percentage}%)\n`;
    });
    reportContent += `\n收支明细:\n`;
    filteredRecords.forEach(item => {
      reportContent += `  ${item.date} ${item.type === 'income' ? '收入' : '支出'} ${item.category} ¥${item.amount}\n`;
    });

    // 复制到剪贴板
    if (navigator.clipboard) {
      navigator.clipboard.writeText(reportContent).then(() => {
        showToast('报表已复制到剪贴板', 'success');
      }).catch(() => {
        // 降级方案
        copyToClipboardFallback(reportContent);
      });
    } else {
      copyToClipboardFallback(reportContent);
    }
  };

  // 降级复制方案
  function copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      showToast('报表已复制到剪贴板', 'success');
    } catch (err) {
      showToast('复制失败，请手动复制');
    }

    document.body.removeChild(textarea);
  }

  // 显示提示
  function showToast(message, type = 'none') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: ${type === 'success' ? '#4caf50' : '#333'};
      color: #fff;
      padding: 12px 24px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 9999;
      white-space: nowrap;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);
})();
