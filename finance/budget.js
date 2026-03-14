// 预算管理页面
(function() {
  // 页面数据
  let budget = {
    yearTotal: 0,
    categories: {}
  };
  let budgetStatus = {
    yearTotal: 0,
    yearUsed: '0.00',
    yearRemaining: '0.00',
    yearPercentage: 0,
    isYearOverBudget: false,
    categories: {}
  };
  let categoryList = [];
  let isEditingYear = false;
  let isEditingCategory = false;
  let editYearTotal = '';
  let editCategories = [];
  let yearOverAmount = '0.00';

  // 默认预算
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

  // 初始化
  function init() {
    // 检查密码验证状态
    const financeAuth = localStorage.getItem('finance_auth');
    if (!financeAuth) {
      location.href = 'login.html';
      return;
    }

    loadBudgetData();
  }

  // 加载预算数据
  function loadBudgetData() {
    budget = getBudget();
    budgetStatus = getBudgetStatus();

    // 构建分类列表
    categoryList = Object.keys(budget.categories).map(name => {
      const status = budgetStatus.categories[name] || {
        budget: budget.categories[name],
        used: '0.00',
        remaining: budget.categories[name].toFixed(2),
        percentage: 0,
        isOverBudget: false
      };
      // 计算分类超支金额
      let overAmount = '0.00';
      if (status.isOverBudget) {
        overAmount = (parseFloat(status.used) - budget.categories[name]).toFixed(2);
      }
      return {
        name,
        budget: budget.categories[name],
        used: status.used,
        remaining: status.remaining,
        percentage: status.percentage,
        isOverBudget: status.isOverBudget,
        overAmount: overAmount
      };
    });

    // 计算超支金额
    yearOverAmount = '0.00';
    if (budgetStatus.isYearOverBudget) {
      const overAmount = parseFloat(budgetStatus.yearUsed) - budget.yearTotal;
      yearOverAmount = overAmount.toFixed(2);
    }

    updateUI();
  }

  // 获取预算
  function getBudget() {
    const saved = localStorage.getItem('finance_budget');
    return saved ? JSON.parse(saved) : defaultBudget;
  }

  // 获取预算状态
  function getBudgetStatus() {
    const records = getRecords();
    const now = new Date();
    const currentYear = now.getFullYear();

    // 计算年度已使用
    const yearRecords = records.filter(item => {
      const date = new Date(item.date);
      return date.getFullYear() === currentYear && item.type === 'expense';
    });

    const yearUsed = yearRecords.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const yearRemaining = budget.yearTotal - yearUsed;
    const yearPercentage = budget.yearTotal > 0 ? Math.min(100, Math.round((yearUsed / budget.yearTotal) * 100)) : 0;
    const isYearOverBudget = yearUsed > budget.yearTotal;

    // 计算分类使用情况
    const categories = {};
    Object.keys(budget.categories).forEach(name => {
      const categoryRecords = yearRecords.filter(item => item.category === name);
      const used = categoryRecords.reduce((sum, item) => sum + parseFloat(item.amount), 0);
      const categoryBudget = budget.categories[name];
      const remaining = Math.max(0, categoryBudget - used);
      const percentage = categoryBudget > 0 ? Math.min(100, Math.round((used / categoryBudget) * 100)) : 0;
      const isOverBudget = used > categoryBudget;

      categories[name] = {
        budget: categoryBudget,
        used: used.toFixed(2),
        remaining: remaining.toFixed(2),
        percentage,
        isOverBudget
      };
    });

    return {
      yearTotal: budget.yearTotal,
      yearUsed: yearUsed.toFixed(2),
      yearRemaining: Math.max(0, yearRemaining).toFixed(2),
      yearPercentage,
      isYearOverBudget,
      categories
    };
  }

  // 获取所有记录
  function getRecords() {
    const saved = localStorage.getItem('finance_records');
    return saved ? JSON.parse(saved) : [];
  }

  // 更新UI
  function updateUI() {
    // 更新年度预算显示
    document.getElementById('yearTotal').textContent = '¥' + budget.yearTotal.toFixed(2);
    document.getElementById('yearPercentage').textContent = `已使用 ${budgetStatus.yearPercentage}%`;
    document.getElementById('yearRemaining').textContent = `剩余 ¥${budgetStatus.yearRemaining}`;
    document.getElementById('yearUsed').textContent = `已用 ¥${budgetStatus.yearUsed}`;

    // 更新进度条
    const progressFill = document.getElementById('yearProgressFill');
    progressFill.style.width = Math.min(100, budgetStatus.yearPercentage) + '%';
    progressFill.classList.toggle('over-budget', budgetStatus.isYearOverBudget);

    // 更新警告
    const warningBanner = document.getElementById('yearWarning');
    if (budgetStatus.isYearOverBudget) {
      warningBanner.style.display = 'flex';
      document.getElementById('yearWarningText').textContent = `年度预算已超支 ¥${yearOverAmount}`;
    } else {
      warningBanner.style.display = 'none';
    }

    // 更新分类列表
    updateCategoryList();
  }

  // 更新分类列表
  function updateCategoryList() {
    const listContainer = document.getElementById('categoryList');
    listContainer.innerHTML = categoryList.map(item => `
      <div class="category-item">
        <div class="category-header">
          <span class="category-name">${item.name}</span>
          <span class="category-budget-value">预算 ¥${item.budget.toFixed(2)}</span>
        </div>
        <div class="category-progress">
          <div class="progress-bar">
            <div class="progress-fill ${item.isOverBudget ? 'over-budget' : ''}" style="width: ${Math.min(100, item.percentage)}%;"></div>
          </div>
          <div class="progress-info-row">
            <span class="used-text">已用 ¥${item.used}</span>
            <span class="remaining-text ${item.isOverBudget ? 'over-budget-text' : ''}">${item.isOverBudget ? '超支' : '剩余'} ¥${item.isOverBudget ? item.overAmount : item.remaining}</span>
          </div>
        </div>
        ${item.isOverBudget ? `<div class="category-warning">⚠️ ${item.name}预算已超支</div>` : ''}
      </div>
    `).join('');
  }

  // 编辑年度预算
  window.editYearBudget = function() {
    isEditingYear = true;
    editYearTotal = budget.yearTotal.toString();
    document.getElementById('editYearTotalInput').value = editYearTotal;

    document.getElementById('yearBudgetDisplay').style.display = 'none';
    document.getElementById('yearBudgetEdit').style.display = 'block';
    document.getElementById('editYearBtn').style.display = 'none';
  };

  // 保存年度预算
  window.saveYearBudget = function() {
    const value = parseFloat(document.getElementById('editYearTotalInput').value);
    if (isNaN(value) || value <= 0) {
      showToast('请输入有效金额');
      return;
    }

    budget.yearTotal = value;
    saveBudget(budget);

    isEditingYear = false;
    document.getElementById('yearBudgetDisplay').style.display = 'block';
    document.getElementById('yearBudgetEdit').style.display = 'none';
    document.getElementById('editYearBtn').style.display = 'block';

    loadBudgetData();
    showToast('保存成功', 'success');
  };

  // 取消编辑年度预算
  window.cancelEditYear = function() {
    isEditingYear = false;
    document.getElementById('yearBudgetDisplay').style.display = 'block';
    document.getElementById('yearBudgetEdit').style.display = 'none';
    document.getElementById('editYearBtn').style.display = 'block';
  };

  // 编辑分类预算
  window.editCategoryBudget = function() {
    isEditingCategory = true;
    editCategories = Object.keys(budget.categories).map(name => ({
      name,
      budget: budget.categories[name].toString()
    }));

    // 更新编辑列表
    const editList = document.getElementById('categoryEditList');
    editList.innerHTML = editCategories.map((item, index) => `
      <div class="edit-item">
        <span class="edit-label">${item.name}</span>
        <input class="edit-input" type="number" step="0.01" value="${item.budget}" onchange="onCategoryBudgetInput(${index}, this.value)" />
      </div>
    `).join('');

    document.getElementById('categoryList').style.display = 'none';
    document.getElementById('categoryEdit').style.display = 'block';
    document.getElementById('editCategoryBtn').style.display = 'none';
  };

  // 分类预算输入
  window.onCategoryBudgetInput = function(index, value) {
    editCategories[index].budget = value;
  };

  // 保存分类预算
  window.saveCategoryBudget = function() {
    const categories = {};
    for (const item of editCategories) {
      const value = parseFloat(item.budget);
      if (isNaN(value) || value < 0) {
        showToast(`${item.name}预算无效`);
        return;
      }
      categories[item.name] = value;
    }

    budget.categories = categories;
    saveBudget(budget);

    isEditingCategory = false;
    document.getElementById('categoryList').style.display = 'flex';
    document.getElementById('categoryEdit').style.display = 'none';
    document.getElementById('editCategoryBtn').style.display = 'block';

    loadBudgetData();
    showToast('保存成功', 'success');
  };

  // 取消编辑分类预算
  window.cancelEditCategory = function() {
    isEditingCategory = false;
    document.getElementById('categoryList').style.display = 'flex';
    document.getElementById('categoryEdit').style.display = 'none';
    document.getElementById('editCategoryBtn').style.display = 'block';
  };

  // 保存预算
  function saveBudget(budget) {
    localStorage.setItem('finance_budget', JSON.stringify(budget));
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
