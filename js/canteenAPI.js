// 饭堂预点餐系统 - 数据管理模块

const STORAGE_KEYS = {
  CART: 'canteen_cart',
  ORDERS: 'canteen_orders',
  MENUS: 'canteen_menus'
};

// 生成订单号
function generateOrderNo() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CT${year}${month}${day}${random}`;
}

// 获取购物车数据
function getCart() {
  try {
    const cart = localStorage.getItem(STORAGE_KEYS.CART);
    return cart ? JSON.parse(cart) : { items: [], totalCount: 0, totalPrice: 0 };
  } catch (e) {
    console.error('获取购物车失败:', e);
    return { items: [], totalCount: 0, totalPrice: 0 };
  }
}

// 保存购物车数据
function saveCart(cart) {
  try {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    return true;
  } catch (e) {
    console.error('保存购物车失败:', e);
    return false;
  }
}

// 清空购物车
function clearCart() {
  try {
    localStorage.removeItem(STORAGE_KEYS.CART);
    return true;
  } catch (e) {
    console.error('清空购物车失败:', e);
    return false;
  }
}

// 添加商品到购物车
function addToCart(item) {
  const cart = getCart();
  const existingItem = cart.items.find(i => i.id === item.id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      ...item,
      quantity: 1
    });
  }
  
  // 重新计算
  cart.totalCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  
  saveCart(cart);
  return cart;
}

// 从购物车减少商品
function decreaseFromCart(itemId) {
  const cart = getCart();
  const item = cart.items.find(i => i.id === itemId);
  
  if (item) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart.items = cart.items.filter(i => i.id !== itemId);
    }
  }
  
  // 重新计算
  cart.totalCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  cart.totalPrice = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  
  saveCart(cart);
  return cart;
}

// 获取订单列表
function getOrders() {
  try {
    const orders = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return orders ? JSON.parse(orders) : [];
  } catch (e) {
    console.error('获取订单失败:', e);
    return [];
  }
}

// 获取单个订单
function getOrder(orderId) {
  const orders = getOrders();
  return orders.find(o => o.id === orderId);
}

// 创建订单
function createOrder(orderData) {
  const orders = getOrders();
  const newOrder = {
    id: Date.now().toString(),
    orderNo: generateOrderNo(),
    ...orderData,
    status: 'pending',
    createTime: new Date().toISOString()
  };
  
  orders.unshift(newOrder);
  
  try {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    // 创建订单后清空购物车
    clearCart();
    return newOrder;
  } catch (e) {
    console.error('创建订单失败:', e);
    return null;
  }
}

// 取消订单
function cancelOrder(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  
  if (order && order.status === 'pending') {
    order.status = 'cancelled';
    order.cancelTime = new Date().toISOString();
    
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return true;
    } catch (e) {
      console.error('取消订单失败:', e);
      return false;
    }
  }
  
  return false;
}

// 完成订单
function completeOrder(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  
  if (order && order.status === 'pending') {
    order.status = 'completed';
    order.completeTime = new Date().toISOString();
    
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return true;
    } catch (e) {
      console.error('完成订单失败:', e);
      return false;
    }
  }
  
  return false;
}

// 获取菜单数据
function getMenus(date, mealType) {
  try {
    const menus = localStorage.getItem(STORAGE_KEYS.MENUS);
    const menusObj = menus ? JSON.parse(menus) : {};
    const key = `${date}_${mealType}`;
    return menusObj[key] || getDefaultMenus(mealType);
  } catch (e) {
    console.error('获取菜单失败:', e);
    return getDefaultMenus(mealType);
  }
}

// 保存菜单数据
function saveMenu(date, mealType, menuData) {
  try {
    const menus = localStorage.getItem(STORAGE_KEYS.MENUS);
    const menusObj = menus ? JSON.parse(menus) : {};
    const key = `${date}_${mealType}`;
    menusObj[key] = menuData;
    localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(menusObj));
    return true;
  } catch (e) {
    console.error('保存菜单失败:', e);
    return false;
  }
}

// 获取默认菜单数据
function getDefaultMenus(mealType) {
  const defaultMenus = {
    breakfast: [
      {
        category: '主食',
        icon: '🍞',
        dishes: [
          { id: 101, name: '白粥', price: 2, description: '香喷喷的白粥', image: '', quantity: 0 },
          { id: 102, name: '豆浆', price: 3, description: '现磨豆浆', image: '', quantity: 0 },
          { id: 103, name: '油条', price: 2, description: '酥脆油条', image: '', quantity: 0 },
          { id: 104, name: '包子', price: 2, description: '肉包/菜包', image: '', quantity: 0 }
        ]
      },
      {
        category: '小菜',
        icon: '🥒',
        dishes: [
          { id: 105, name: '咸菜', price: 1, description: '开胃小菜', image: '', quantity: 0 },
          { id: 106, name: '卤蛋', price: 2, description: '五香卤蛋', image: '', quantity: 0 }
        ]
      }
    ],
    lunch: [
      {
        category: '主食',
        icon: '🍚',
        dishes: [
          { id: 201, name: '白米饭', price: 2, description: '香喷喷的大米饭', image: '', quantity: 0 },
          { id: 202, name: '蛋炒饭', price: 8, description: '鸡蛋炒饭', image: '', quantity: 0 }
        ]
      },
      {
        category: '荤菜',
        icon: '🍖',
        dishes: [
          { id: 203, name: '红烧肉', price: 12, description: '肥而不腻', image: '', quantity: 0 },
          { id: 204, name: '宫保鸡丁', price: 10, description: '鸡肉鲜嫩', image: '', quantity: 0 },
          { id: 205, name: '糖醋排骨', price: 15, description: '酸甜可口', image: '', quantity: 0 }
        ]
      },
      {
        category: '素菜',
        icon: '🥬',
        dishes: [
          { id: 206, name: '清炒时蔬', price: 5, description: '新鲜时令蔬菜', image: '', quantity: 0 },
          { id: 207, name: '麻婆豆腐', price: 6, description: '麻辣鲜香', image: '', quantity: 0 },
          { id: 208, name: '番茄炒蛋', price: 5, description: '经典家常菜', image: '', quantity: 0 }
        ]
      },
      {
        category: '汤品',
        icon: '🥣',
        dishes: [
          { id: 209, name: '紫菜蛋花汤', price: 3, description: '清淡爽口', image: '', quantity: 0 },
          { id: 210, name: '排骨汤', price: 8, description: '营养滋补', image: '', quantity: 0 }
        ]
      }
    ],
    dinner: [
      {
        category: '主食',
        icon: '🍚',
        dishes: [
          { id: 301, name: '白米饭', price: 2, description: '香喷喷的大米饭', image: '', quantity: 0 },
          { id: 302, name: '面条', price: 6, description: '手工拉面', image: '', quantity: 0 }
        ]
      },
      {
        category: '荤菜',
        icon: '🍖',
        dishes: [
          { id: 303, name: '回锅肉', price: 11, description: '川味经典', image: '', quantity: 0 },
          { id: 304, name: '鱼香肉丝', price: 10, description: '酸甜微辣', image: '', quantity: 0 },
          { id: 305, name: '可乐鸡翅', price: 13, description: '甜香可口', image: '', quantity: 0 }
        ]
      },
      {
        category: '素菜',
        icon: '🥬',
        dishes: [
          { id: 306, name: '蒜蓉青菜', price: 5, description: '蒜香四溢', image: '', quantity: 0 },
          { id: 307, name: '酸辣土豆丝', price: 5, description: '酸辣开胃', image: '', quantity: 0 }
        ]
      },
      {
        category: '汤品',
        icon: '🥣',
        dishes: [
          { id: 308, name: '番茄蛋汤', price: 3, description: '家常美味', image: '', quantity: 0 },
          { id: 309, name: '冬瓜排骨汤', price: 8, description: '清热解暑', image: '', quantity: 0 }
        ]
      }
    ]
  };
  
  return defaultMenus[mealType] || defaultMenus.lunch;
}

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 获取取餐时间选项
function getPickupTimeOptions(mealType) {
  const options = {
    breakfast: [
      '07:00-07:15',
      '07:15-07:30',
      '07:30-07:45',
      '07:45-08:00',
      '08:00-08:15',
      '08:15-08:30'
    ],
    lunch: [
      '11:30-11:45',
      '11:45-12:00',
      '12:00-12:15',
      '12:15-12:30',
      '12:30-12:45',
      '12:45-13:00'
    ],
    dinner: [
      '17:30-17:45',
      '17:45-18:00',
      '18:00-18:15',
      '18:15-18:30',
      '18:30-18:45',
      '18:45-19:00'
    ]
  };
  
  return options[mealType] || options.lunch;
}

// 导出到全局
window.canteenAPI = {
  // 购物车相关
  getCart,
  saveCart,
  clearCart,
  addToCart,
  decreaseFromCart,
  
  // 订单相关
  getOrders,
  getOrder,
  createOrder,
  cancelOrder,
  completeOrder,
  
  // 菜单相关
  getMenus,
  saveMenu,
  
  // 工具函数
  formatDate,
  getPickupTimeOptions,
  generateOrderNo
};
