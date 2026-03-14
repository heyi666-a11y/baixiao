// 订单列表页
let orders = [];
let filteredOrders = [];
let currentTab = 'all';
let currentOrder = null;

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待取餐' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' }
];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  loadOrders();
});

// 加载订单
function loadOrders() {
  const savedOrders = localStorage.getItem('canteen_orders');
  orders = savedOrders ? JSON.parse(savedOrders) : [];
  filterOrders();
}

// 切换标签
function switchTab(tab) {
  currentTab = tab;
  
  // 更新标签样式
  document.querySelectorAll('.tab-item').forEach(item => {
    if (item.dataset.tab === tab) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  filterOrders();
}

// 筛选订单
function filterOrders() {
  if (currentTab === 'all') {
    filteredOrders = orders;
  } else {
    filteredOrders = orders.filter(order => order.status === currentTab);
  }
  
  renderOrders();
}

// 获取状态文本
function getStatusText(status) {
  const statusMap = {
    'pending': '待取餐',
    'completed': '已完成',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
}

// 获取状态样式类
function getStatusClass(status) {
  const classMap = {
    'pending': 'status-pending',
    'completed': 'status-completed',
    'cancelled': 'status-cancelled'
  };
  return classMap[status] || '';
}

// 渲染订单列表
function renderOrders() {
  const container = document.getElementById('orders-list');
  const emptyState = document.getElementById('empty-state');
  const emptyText = document.getElementById('empty-text');
  
  if (filteredOrders.length === 0) {
    container.innerHTML = '';
    emptyState.style.display = 'block';
    emptyText.textContent = currentTab === 'all' ? '暂无订单' : `暂无${getStatusText(currentTab)}订单`;
    return;
  }
  
  emptyState.style.display = 'none';
  
  container.innerHTML = filteredOrders.map(order => `
    <div class="order-card" onclick="viewOrderDetail('${order.id}')">
      <!-- 订单头部 -->
      <div class="order-header">
        <div class="order-info">
          <span class="order-no">订单号: ${order.orderNo}</span>
          <span class="order-time">${formatDateTime(order.createTime)}</span>
        </div>
        <div class="order-status ${getStatusClass(order.status)}">
          <span>${getStatusText(order.status)}</span>
        </div>
      </div>

      <!-- 订单内容 -->
      <div class="order-content">
        <div class="meal-info">
          <span class="meal-date">${order.date} ${order.mealName}</span>
          <span class="pickup-time">取餐时间: ${order.pickupTime}</span>
        </div>
        
        <div class="items-preview">
          <span class="items-text">${order.items.length}个菜品</span>
          ${order.items.map(food => `
            <span class="items-detail">${food.name} x${food.quantity}</span>
          `).join('')}
        </div>
      </div>

      <!-- 订单底部 -->
      <div class="order-footer">
        <div class="order-total">
          <span class="total-label">合计:</span>
          <span class="total-price">¥${order.totalPrice.toFixed(2)}</span>
        </div>
        
        <div class="order-actions" onclick="event.stopPropagation()">
          ${order.status === 'pending' ? `
            <button class="btn btn-primary" onclick="completeOrder('${order.id}')">确认取餐</button>
            <button class="btn btn-danger" onclick="cancelOrder('${order.id}')">取消订单</button>
          ` : `
            <button class="btn btn-secondary" onclick="reorder('${order.id}')">再来一单</button>
          `}
        </div>
      </div>
    </div>
  `).join('');
}

// 查看订单详情
function viewOrderDetail(orderId) {
  currentOrder = orders.find(o => o.id === orderId);
  if (!currentOrder) return;
  
  const modal = document.getElementById('detail-modal');
  const body = document.getElementById('modal-body');
  const footer = document.getElementById('modal-footer');
  
  body.innerHTML = `
    <div class="detail-section">
      <!-- 订单状态 -->
      <div class="detail-status ${getStatusClass(currentOrder.status)}">
        <span>${getStatusText(currentOrder.status)}</span>
      </div>

      <!-- 订单信息 -->
      <div class="detail-info">
        <div class="info-row">
          <span class="info-label">订单编号</span>
          <span class="info-value">${currentOrder.orderNo}</span>
        </div>
        <div class="info-row">
          <span class="info-label">下单时间</span>
          <span class="info-value">${formatDateTime(currentOrder.createTime)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">用餐日期</span>
          <span class="info-value">${currentOrder.date}</span>
        </div>
        <div class="info-row">
          <span class="info-label">餐别</span>
          <span class="info-value">${currentOrder.mealName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">取餐时间</span>
          <span class="info-value highlight">${currentOrder.pickupTime}</span>
        </div>
      </div>

      <!-- 菜品列表 -->
      <div class="detail-items">
        <span class="section-title">菜品明细</span>
        ${currentOrder.items.map(item => `
          <div class="item-row">
            <img class="item-image" src="${item.image || '/images/food-default.png'}" alt="${item.name}"/>
            <div class="item-info">
              <span class="item-name">${item.name}</span>
              <span class="item-price">¥${item.price}</span>
            </div>
            <span class="item-quantity">x${item.quantity}</span>
            <span class="item-total">¥${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}
      </div>

      ${currentOrder.remark ? `
        <!-- 备注 -->
        <div class="detail-remark">
          <span class="section-title">订单备注</span>
          <span class="remark-text">${currentOrder.remark}</span>
        </div>
      ` : ''}

      <!-- 金额汇总 -->
      <div class="detail-summary">
        <div class="summary-row">
          <span>商品总数</span>
          <span>${currentOrder.totalCount}件</span>
        </div>
        <div class="summary-row total">
          <span>实付金额</span>
          <span class="summary-price">¥${currentOrder.totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
  
  // 底部操作按钮
  footer.innerHTML = currentOrder.status === 'pending' ? `
    <button class="btn btn-primary" onclick="completeOrder('${currentOrder.id}'); closeDetailModal();">确认取餐</button>
    <button class="btn btn-danger" onclick="cancelOrder('${currentOrder.id}'); closeDetailModal();">取消订单</button>
  ` : `
    <button class="btn btn-secondary" onclick="reorder('${currentOrder.id}'); closeDetailModal();">再来一单</button>
  `;
  
  modal.classList.add('show');
}

// 关闭详情弹窗
function closeDetailModal() {
  document.getElementById('detail-modal').classList.remove('show');
  currentOrder = null;
}

// 取消订单
function cancelOrder(orderId) {
  if (!confirm('确定要取消这个订单吗？')) return;
  
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'cancelled';
    localStorage.setItem('canteen_orders', JSON.stringify(orders));
    showToast('订单已取消', 'success');
    loadOrders();
  }
}

// 确认取餐
function completeOrder(orderId) {
  if (!confirm('确认已取餐？')) return;
  
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = 'completed';
    localStorage.setItem('canteen_orders', JSON.stringify(orders));
    showToast('取餐成功', 'success');
    loadOrders();
  }
}

// 再来一单
function reorder(orderId) {
  const order = orders.find(o => o.id === orderId);
  
  if (order && order.items) {
    // 清空购物车
    localStorage.removeItem('canteen_cart');
    
    // 添加到购物车
    const newCart = {
      items: order.items.map(item => ({...item})),
      totalCount: order.totalCount,
      totalPrice: order.totalPrice
    };
    localStorage.setItem('canteen_cart', JSON.stringify(newCart));
    
    showToast('已加入购物车', 'success');
    
    // 跳转到点餐页面
    setTimeout(() => {
      location.href = '../index/index.html';
    }, 1000);
  }
}

// 去点餐
function goToMenu() {
  location.href = '../index/index.html';
}

// 格式化日期时间
function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
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
