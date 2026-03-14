// 记账页面
(function() {
  // 表单数据
  let formData = {
    type: 'expense',
    amount: '',
    category: '',
    date: '',
    remark: ''
  };

  // 收入分类
  const INCOME_CATEGORIES = ['学费收入', '政府拨款', '捐赠收入', '其他收入'];
  // 支出分类
  const EXPENSE_CATEGORIES = ['教职工工资', '教学用品', '设备维护', '水电费', '办公费用', '维修费用', '其他支出'];

  // 当前显示的分类
  let currentCategories = [];

  // 初始化
  function init() {
    // 检查密码验证状态
    const financeAuth = localStorage.getItem('finance_auth');
    if (!financeAuth) {
      location.href = 'login.html';
      return;
    }

    // 初始化日期为今天
    const today = new Date().toISOString().split('T')[0];
    formData.date = today;
    document.getElementById('datePicker').value = today;

    // 设置默认分类
    currentCategories = EXPENSE_CATEGORIES;
    formData.category = EXPENSE_CATEGORIES[0];

    // 更新分类列表
    updateCategoryList();
    updateSubmitButton();
  }

  // 选择类型
  window.selectType = function(type) {
    formData.type = type;
    currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    formData.category = currentCategories[0];

    // 更新UI
    document.getElementById('typeIncome').classList.toggle('active', type === 'income');
    document.getElementById('typeExpense').classList.toggle('active', type === 'expense');
    updateCategoryList();
  };

  // 更新分类列表
  function updateCategoryList() {
    const listContainer = document.getElementById('categoryList');
    const icon = formData.type === 'income' ? '💰' : '💸';

    listContainer.innerHTML = currentCategories.map(cat => `
      <div class="category-item ${formData.category === cat ? 'active' : ''}" onclick="selectCategory('${cat}')">
        <span class="category-icon">${icon}</span>
        <span class="category-text">${cat}</span>
      </div>
    `).join('');
  }

  // 选择分类
  window.selectCategory = function(category) {
    formData.category = category;
    updateCategoryList();
  };

  // 金额输入
  window.onAmountInput = function(value) {
    // 限制只能输入数字和小数点
    value = value.replace(/[^\d.]/g, '');
    // 限制小数点后两位
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts[1];
    }
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    formData.amount = value;

    // 更新输入框显示
    const input = document.getElementById('amountInput');
    if (input.value !== value) {
      input.value = value;
    }

    updateSubmitButton();
  };

  // 日期选择
  window.onDateChange = function(value) {
    formData.date = value;
  };

  // 备注输入
  window.onRemarkInput = function(value) {
    formData.remark = value;
    document.getElementById('remarkCount').textContent = value.length + '/100';
  };

  // 更新提交按钮状态
  function updateSubmitButton() {
    const btn = document.getElementById('submitBtn');
    if (formData.amount && parseFloat(formData.amount) > 0) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  }

  // 提交记录
  window.submitRecord = function() {
    const { type, amount, category, date, remark } = formData;

    // 验证
    if (!amount || parseFloat(amount) <= 0) {
      showToast('请输入金额');
      return;
    }

    if (!category) {
      showToast('请选择分类');
      return;
    }

    // 提交数据
    const result = addRecord({
      type,
      amount: parseFloat(amount).toFixed(2),
      category,
      date,
      remark
    });

    if (result.success) {
      showToast('保存成功', 'success');

      // 延迟返回
      setTimeout(() => {
        goBack();
      }, 1500);
    } else {
      showToast('保存失败');
    }
  };

  // 添加记录
  function addRecord(record) {
    try {
      const records = getRecords();
      const newRecord = {
        id: Date.now().toString(),
        ...record,
        createTime: new Date().toISOString()
      };
      records.unshift(newRecord);
      localStorage.setItem('finance_records', JSON.stringify(records));
      return { success: true, record: newRecord };
    } catch (e) {
      console.error('保存记录失败:', e);
      return { success: false, error: e.message };
    }
  }

  // 获取所有记录
  function getRecords() {
    const saved = localStorage.getItem('finance_records');
    return saved ? JSON.parse(saved) : [];
  }

  // 显示提示
  function showToast(message, type = 'none') {
    // 创建toast元素
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

    // 2秒后移除
    setTimeout(() => {
      toast.remove();
    }, 2000);
  }

  // 返回上一页
  window.goBack = function() {
    location.href = 'index.html';
  };

  // 页面加载完成后初始化
  document.addEventListener('DOMContentLoaded', init);
})();
