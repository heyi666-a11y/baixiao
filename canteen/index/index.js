// 饭堂点餐首页
let selectedDate = 'today';
let selectedMeal = 'lunch';
let cart = {
  items: [],
  totalCount: 0,
  totalPrice: 0
};
let isCartDetailVisible = false;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
  initDates();
  loadCart();
  loadMenu();
  updateUI();
});

// 初始化日期
function initDates() {
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const afterTomorrow = new Date(today);
  afterTomorrow.setDate(afterTomorrow.getDate() + 2);

  document.getElementById('today-week').textContent = weeks[today.getDay()];
  document.getElementById('tomorrow-week').textContent = weeks[tomorrow.getDay()];
  document.getElementById('afterTomorrow-week').textContent = weeks[afterTomorrow.getDay()];
}

// 获取日期字符串
function getDateString(dateType) {
  const today = new Date();
  if (dateType === 'today') {
    return formatDate(today);
  } else if (dateType === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return formatDate(tomorrow);
  } else {
    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);
    return formatDate(afterTomorrow);
  }
}

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 选择日期
function selectDate(date) {
  selectedDate = date;
  updateUI();
  loadMenu();
}

// 选择餐别
function selectMeal(meal) {
  selectedMeal = meal;
  updateUI();
  loadMenu();
}

// 更新UI状态
function updateUI() {
  // 更新日期选择
  ['today', 'tomorrow', 'afterTomorrow'].forEach(date => {
    const el = document.getElementById('date-' + date);
    if (date === selectedDate) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });

  // 更新餐别选择
  ['breakfast', 'lunch', 'dinner'].forEach(meal => {
    const el = document.getElementById('meal-' + meal);
    if (meal === selectedMeal) {
      el.classList.add('active');
    } else {
      el.classList.remove('active');
    }
  });
}

// 加载购物车
function loadCart() {
  const savedCart = localStorage.getItem('canteen_cart');
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartUI();
}

// 保存购物车
function saveCart() {
  localStorage.setItem('canteen_cart', JSON.stringify(cart));
  updateCartUI();
}

// 更新购物车UI
function updateCartUI() {
  const cartBar = document.getElementById('cart-bar');
  const cartBadge = document.getElementById('cart-badge');
  const totalPrice = document.getElementById('total-price');

  if (cart.totalCount > 0) {
    cartBar.style.display = 'flex';
    cartBadge.textContent = cart.totalCount;
    totalPrice.textContent = '¥' + cart.totalPrice.toFixed(2);
  } else {
    cartBar.style.display = 'none';
  }

  renderCartList();
}

// 模拟菜单数据
const mockMenus = {
  breakfast: [
    {
      category: '主食',
      icon: '🍞',
      dishes: [
        { id: 101, name: '白粥', price: 2, description: '香喷喷的白粥', image: '' },
        { id: 102, name: '豆浆', price: 3, description: '现磨豆浆', image: '' },
        { id: 103, name: '油条', price: 2, description: '酥脆油条', image: '' },
        { id: 104, name: '包子', price: 2, description: '肉包/菜包', image: '' }
      ]
    },
    {
      category: '小菜',
      icon: '🥒',
      dishes: [
        { id: 105, name: '咸菜', price: 1, description: '开胃小菜', image: '' },
        { id: 106, name: '卤蛋', price: 2, description: '五香卤蛋', image: '' }
      ]
    }
  ],
  lunch: [
    {
      category: '主食',
      icon: '🍚',
      dishes: [
        { id: 201, name: '白米饭', price: 2, description: '香喷喷的大米饭', image: '' },
        { id: 202, name: '蛋炒饭', price: 8, description: '鸡蛋炒饭', image: '' }
      ]
    },
    {
      category: '荤菜',
      icon: '🍖',
      dishes: [
        { id: 203, name: '红烧肉', price: 12, description: '肥而不腻', image: '' },
        { id: 204, name: '宫保鸡丁', price: 10, description: '鸡肉鲜嫩', image: '' },
        { id: 205, name: '糖醋排骨', price: 15, description: '酸甜可口', image: '' }
      ]
    },
    {
      category: '素菜',
      icon: '🥬',
      dishes: [
        { id: 206, name: '清炒时蔬', price: 5, description: '新鲜时令蔬菜', image: '' },
        { id: 207, name: '麻婆豆腐', price: 6, description: '麻辣鲜香', image: '' },
        { id: 208, name: '番茄炒蛋', price: 5, description: '经典家常菜', image: '' }
      ]
    },
    {
      category: '汤品',
      icon: '🥣',
      dishes: [
        { id: 209, name: '紫菜蛋花汤', price: 3, description: '清淡爽口', image: '' },
        { id: 210, name: '排骨汤', price: 8, description: '营养滋补', image: '' }
      ]
    }
  ],
  dinner: [
    {
      category: '主食',
      icon: '🍚',
      dishes: [
        { id: 301, name: '白米饭', price: 2, description: '香喷喷的大米饭', image: '' },
        { id: 302, name: '面条', price: 6, description: '手工拉面', image: '' }
      ]
    },
    {
      category: '荤菜',
      icon: '🍖',
      dishes: [
        { id: 303, name: '回锅肉', price: 11, description: '川味经典', image: '' },
        { id: 304, name: '鱼香肉丝', price: 10, description: '酸甜微辣', image: '' },
        { id: 305, name: '可乐鸡翅', price: 13, description: '甜香可口', image: '' }
      ]
    },
    {
      category: '素菜',
      icon: '🥬',
      dishes: [
        { id: 306, name: '蒜蓉青菜', price: 5, description: '蒜香四溢', image: '' },
        { id: 307, name: '酸辣土豆丝', price: 5, description: '酸辣开胃', image: '' }
      ]
    },
    {
      category: '汤品',
      icon: '🥣',
      dishes: [
        { id: 308, name: '番茄蛋汤', price: 3, description: '家常美味', image: '' },
        { id: 309, name: '冬瓜排骨汤', price: 8, description: '清热解暑', image: '' }
      ]
    }
  ]
};

// 加载菜单
function loadMenu() {
  const menuList = mockMenus[selectedMeal] || mockMenus.lunch;
  renderMenuList(menuList);
}

// 渲染菜单列表
function renderMenuList(menuList) {
  const container = document.getElementById('menu-list');

  if (!menuList || menuList.length === 0) {
    container.innerHTML = '<div class="empty-state"><span class="empty-text">暂无菜单</span></div>';
    return;
  }

  let html = '';
  menuList.forEach(categoryItem => {
    html += `
      <div class="menu-category">
        <div class="category-title">
          <span class="category-icon">${categoryItem.icon}</span>
          <span class="category-name">${categoryItem.category}</span>
        </div>
        <div class="dishes-list">
          ${categoryItem.dishes.map(dish => renderDishCard(dish)).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// 渲染菜品卡片
function renderDishCard(item) {
  const cartItem = cart.items.find(i => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const imageHtml = item.image ? `<img class="dish-image" src="${item.image}" alt="${item.name}"/>` : `<div class="dish-image-placeholder">🍽️</div>`;

  return `
    <div class="dish-card">
      ${imageHtml}
      <div class="dish-info">
        <span class="dish-name">${item.name}</span>
        <span class="dish-desc">${item.description}</span>
        <div class="dish-bottom">
          <span class="dish-price">¥${item.price}</span>
          <div class="dish-actions">
            ${quantity > 0 ? `
              <div class="quantity-control">
                <button class="btn-minus" onclick="decreaseQuantity(${item.id})">-</button>
                <span class="quantity">${quantity}</span>
              </div>
            ` : ''}
            <button class="btn-plus" data-item='${JSON.stringify(item)}' onclick="addToCartFromButton(this)">+</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// 从按钮添加到购物车
function addToCartFromButton(button) {
  const itemData = button.getAttribute('data-item');
  try {
    const item = JSON.parse(itemData);
    addToCart(item);
  } catch (e) {
    console.error('解析item失败:', e);
  }
}

// 添加到购物车
function addToCart(item) {
  // 确保item是对象
  if (typeof item === 'string') {
    try {
      item = JSON.parse(item);
    } catch (e) {
      console.error('解析item失败:', e);
      return;
    }
  }
  
  const existingItem = cart.items.find(i => i.id == item.id);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.items.push({
      ...item,
      quantity: 1
    });
  }

  updateCartTotals();
  saveCart();
  loadMenu();

  showToast('已添加');
}

// 减少数量
function decreaseQuantity(id) {
  const item = cart.items.find(i => i.id == id);

  if (item) {
    item.quantity--;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(i => i.id != id);
    }
    updateCartTotals();
    saveCart();
    loadMenu();
  }
}

// 增加数量
function increaseQuantity(id) {
  const item = cart.items.find(i => i.id == id);
  if (item) {
    item.quantity++;
    updateCartTotals();
    saveCart();
    loadMenu();
  }
}

// 更新购物车总计
function updateCartTotals() {
  cart.totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// 显示购物车详情
function showCartDetail() {
  isCartDetailVisible = true;
  document.getElementById('cart-modal').classList.add('show');
  renderCartList();
}

// 隐藏购物车详情
function hideCartDetail() {
  isCartDetailVisible = false;
  document.getElementById('cart-modal').classList.remove('show');
}

// 渲染购物车列表
function renderCartList() {
  const container = document.getElementById('cart-list');

  if (cart.items.length === 0) {
    container.innerHTML = '<div class="empty-cart">购物车是空的</div>';
    return;
  }

  container.innerHTML = cart.items.map(item => `
    <div class="cart-item">
      <span class="cart-item-name">${item.name}</span>
      <div class="cart-item-right">
          <span class="cart-item-price">¥${(item.price * item.quantity).toFixed(2)}</span>
          <div class="quantity-control">
            <button class="btn-minus" onclick="decreaseQuantity(${item.id})">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="btn-plus" onclick="increaseQuantity(${item.id})">+</button>
          </div>
        </div>
    </div>
  `).join('');
}

// 清空购物车
function clearCart() {
  cart = {
    items: [],
    totalCount: 0,
    totalPrice: 0
  };
  saveCart();
  loadMenu();
  hideCartDetail();
}

// 去结算
function goToConfirm() {
  if (cart.totalCount === 0) {
    showToast('请先选择菜品', 'error');
    return;
  }

  const mealNames = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐'
  };

  const date = getDateString(selectedDate);
  const mealName = mealNames[selectedMeal];

  location.href = `../confirm/confirm.html?date=${date}&mealType=${selectedMeal}&mealName=${encodeURIComponent(mealName)}`;
}

// 跳转到订单页面
function goToOrders() {
  location.href = '../orders/orders.html';
}

// 返回上一页
function goBack() {
  history.back();
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
      document.body.removeChild(toast);
    }, 300);
  }, 1500);
}
