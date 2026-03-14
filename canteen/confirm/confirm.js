// 订单确认页
let cart = {
  items: [],
  totalCount: 0,
  totalPrice: 0
};
let orderInfo = {
  date: '',
  mealType: 'lunch',
  mealName: '午餐'
};
let pickupTimeOptions = [];
let selectedPickupTime = '';
let remark = '';
let submitting = false;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  // 获取URL参数
  const urlParams = new URLSearchParams(window.location.search);
  orderInfo.date = urlParams.get('date') || formatDate(new Date());
  orderInfo.mealType = urlParams.get('mealType') || 'lunch';
  orderInfo.mealName = decodeURIComponent(urlParams.get('mealName') || '午餐');

  // 更新页面显示
  document.getElementById('order-date').textContent = orderInfo.date;
  document.getElementById('order-meal').textContent = orderInfo.mealName;

  // 加载购物车数据
  loadCart();

  // 加载取餐时间选项
  loadPickupTimeOptions();
});

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 加载购物车数据
function loadCart() {
  const savedCart = localStorage.getItem('canteen_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }

  if (cart.items.length === 0) {
    showToast('购物车为空', 'error');
    setTimeout(() => {
      history.back();
    }, 1500);
    return;
  }

  renderOrderItems();
  updatePriceDisplay();
}

// 渲染订单商品
function renderOrderItems() {
  const container = document.getElementById('item-list');
  document.getElementById('item-count').textContent = `共 ${cart.totalCount} 件`;

  container.innerHTML = cart.items.map(item => `
    <div class="item">
      <div class="item-info">
        <span class="item-name">${item.name}</span>
        <span class="item-price">¥${item.price}</span>
      </div>
      <span class="item-quantity">x${item.quantity}</span>
    </div>
  `).join('');
}

// 更新价格显示
function updatePriceDisplay() {
  document.getElementById('subtotal').textContent = `¥${cart.totalPrice.toFixed(2)}`;
  document.getElementById('total-price').textContent = `¥${cart.totalPrice.toFixed(2)}`;
  document.getElementById('bottom-price').textContent = `¥${cart.totalPrice.toFixed(2)}`;
}

// 加载取餐时间选项
function loadPickupTimeOptions() {
  const options = getPickupTimeOptions(orderInfo.mealType);
  pickupTimeOptions = options;

  const select = document.getElementById('pickup-time');
  select.innerHTML = '<option value="">请选择取餐时间</option>' +
    options.map(time => `<option value="${time}">${time}</option>`).join('');
}

// 获取取餐时间选项
function getPickupTimeOptions(mealType) {
  const timeRanges = {
    breakfast: { start: 7, end: 8, interval: 10 },
    lunch: { start: 11, end: 13, interval: 10 },
    dinner: { start: 17, end: 19, interval: 10 }
  };

  const range = timeRanges[mealType] || timeRanges.lunch;
  const options = [];

  for (let hour = range.start; hour < range.end; hour++) {
    for (let minute = 0; minute < 60; minute += range.interval) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push(timeStr);
    }
  }

  return options;
}

// 选择取餐时间
function onPickupTimeChange(value) {
  selectedPickupTime = value;
  updateSubmitButton();
}

// 更新提交按钮状态
function updateSubmitButton() {
  const btn = document.getElementById('submit-btn');
  btn.disabled = !selectedPickupTime || submitting;
}

// 提交订单
function submitOrder() {
  if (!selectedPickupTime) {
    showToast('请选择取餐时间', 'error');
    return;
  }

  if (cart.items.length === 0) {
    showToast('购物车为空', 'error');
    return;
  }

  submitting = true;
  updateSubmitButton();
  document.getElementById('btn-text').textContent = '提交中...';

  // 构建订单数据
  const orderData = {
    items: cart.items,
    totalCount: cart.totalCount,
    totalPrice: cart.totalPrice,
    date: orderInfo.date,
    mealType: orderInfo.mealType,
    mealName: orderInfo.mealName,
    pickupTime: selectedPickupTime,
    remark: document.getElementById('remark').value,
    status: 'pending'
  };

  // 创建订单
  const newOrder = createOrder(orderData);

  if (newOrder) {
    showToast('订单提交成功', 'success');

    // 清空购物车
    localStorage.removeItem('canteen_cart');

    // 跳转到订单列表页
    setTimeout(() => {
      location.href = '../orders/orders.html';
    }, 1500);
  } else {
    showToast('订单提交失败', 'error');
    submitting = false;
    updateSubmitButton();
    document.getElementById('btn-text').textContent = '提交订单';
  }
}

// 创建订单
function createOrder(orderData) {
  const orders = JSON.parse(localStorage.getItem('canteen_orders') || '[]');

  const newOrder = {
    id: Date.now().toString(),
    orderNo: generateOrderNo(),
    createTime: new Date().toISOString(),
    ...orderData
  };

  orders.unshift(newOrder);
  localStorage.setItem('canteen_orders', JSON.stringify(orders));

  return newOrder;
}

// 生成订单号
function generateOrderNo() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CT${year}${month}${day}${random}`;
}

// 显示提示
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = 'toast ' + type;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 2000);
}

// 返回上一页
function goBack() {
  history.back();
}
