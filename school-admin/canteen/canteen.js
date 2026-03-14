const canteenAPI = require('../../../utils/canteenAPI');

Page({
  data: {
    activeTab: 'menu',
    tabs: [
      { key: 'menu', label: '菜单管理' },
      { key: 'orders', label: '订单查看' }
    ],
    currentDate: '',
    currentMeal: 'lunch',
    meals: [
      { key: 'breakfast', label: '早餐' },
      { key: 'lunch', label: '午餐' },
      { key: 'dinner', label: '晚餐' }
    ],
    menuList: [],
    orders: [],
    filteredOrders: [],
    orderTab: 'all',
    orderTabs: [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '待取餐' },
      { key: 'completed', label: '已完成' },
      { key: 'cancelled', label: '已取消' }
    ],
    loading: false,
    showEditModal: false,
    editingItem: null,
    editForm: {
      price: '',
      stock: ''
    }
  },

  onLoad() {
    this.setCurrentDate();
    this.loadMenu();
    this.loadOrders();
  },

  onShow() {
    this.loadMenu();
    this.loadOrders();
  },

  setCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    this.setData({
      currentDate: `${year}-${month}-${day}`
    });
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  switchMeal(e) {
    const meal = e.currentTarget.dataset.meal;
    this.setData({
      currentMeal: meal
    }, () => {
      this.loadMenu();
    });
  },

  onDateChange(e) {
    this.setData({
      currentDate: e.detail.value
    }, () => {
      this.loadMenu();
    });
  },

  loadMenu() {
    const { currentDate, currentMeal } = this.data;
    const menus = canteenAPI.getMenus(currentDate, currentMeal);
    let menuList = [];
    menus.forEach(category => {
      category.dishes.forEach(dish => {
        menuList.push({
          ...dish,
          category: category.category,
          categoryIcon: category.icon
        });
      });
    });
    this.setData({ menuList });
  },

  loadOrders() {
    this.setData({ loading: true });
    const orders = canteenAPI.getOrders();
    this.setData({
      orders: orders,
      loading: false
    }, () => {
      this.filterOrders();
    });
  },

  switchOrderTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ orderTab: tab }, () => {
      this.filterOrders();
    });
  },

  filterOrders() {
    const { orders, orderTab } = this.data;
    let filtered = orders;
    if (orderTab !== 'all') {
      filtered = orders.filter(order => order.status === orderTab);
    }
    this.setData({ filteredOrders: filtered });
  },

  showEditModal(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({
      showEditModal: true,
      editingItem: item,
      editForm: {
        price: item.price.toString(),
        stock: item.stock ? item.stock.toString() : '99'
      }
    });
  },

  hideEditModal() {
    this.setData({
      showEditModal: false,
      editingItem: null,
      editForm: { price: '', stock: '' }
    });
  },

  onPriceInput(e) {
    this.setData({
      'editForm.price': e.detail.value
    });
  },

  onStockInput(e) {
    this.setData({
      'editForm.stock': e.detail.value
    });
  },

  saveEdit() {
    const { editForm, editingItem, currentDate, currentMeal } = this.data;
    const price = parseFloat(editForm.price);
    const stock = parseInt(editForm.stock);

    if (isNaN(price) || price <= 0) {
      wx.showToast({ title: '请输入正确的价格', icon: 'none' });
      return;
    }

    if (isNaN(stock) || stock < 0) {
      wx.showToast({ title: '请输入正确的库存', icon: 'none' });
      return;
    }

    const menus = canteenAPI.getMenus(currentDate, currentMeal);
    menus.forEach(category => {
      category.dishes.forEach(dish => {
        if (dish.id === editingItem.id) {
          dish.price = price;
          dish.stock = stock;
        }
      });
    });

    canteenAPI.saveMenu(currentDate, currentMeal, menus);
    this.loadMenu();
    this.hideEditModal();

    wx.showToast({
      title: '修改成功',
      icon: 'success'
    });
  },

  completeOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认取餐',
      content: '确认该订单已取餐？',
      success: (res) => {
        if (res.confirm) {
          const success = canteenAPI.completeOrder(orderId);
          if (success) {
            wx.showToast({ title: '取餐成功', icon: 'success' });
            this.loadOrders();
          } else {
            wx.showToast({ title: '操作失败', icon: 'none' });
          }
        }
      }
    });
  },

  cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: (res) => {
        if (res.confirm) {
          const success = canteenAPI.cancelOrder(orderId);
          if (success) {
            wx.showToast({ title: '订单已取消', icon: 'success' });
            this.loadOrders();
          } else {
            wx.showToast({ title: '取消失败', icon: 'none' });
          }
        }
      }
    });
  },

  getStatusText(status) {
    const statusMap = {
      'pending': '待取餐',
      'completed': '已完成',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  },

  getStatusClass(status) {
    const classMap = {
      'pending': 'status-pending',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled'
    };
    return classMap[status] || '';
  },

  formatDateTime(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
