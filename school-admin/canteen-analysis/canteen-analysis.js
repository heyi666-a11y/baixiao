const adminAPI = require('../../../utils/adminAPI');

Page({
  data: {
    orders: [],
    dishStats: [],
    mealTypeStats: [],
    startDate: '',
    endDate: ''
  },

  onLoad() {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    this.setData({
      startDate: sevenDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
    
    this.loadData();
  },

  async loadData() {
    wx.showLoading({ title: '加载中...' });
    try {
      const result = await adminAPI.canteen.getOrders();
      if (result.success !== false) {
        const orders = result.data || [];
        this.setData({ orders });
        this.analyzeData();
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  analyzeData() {
    const { orders, startDate, endDate } = this.data;
    
    // 过滤日期范围内的订单
    const filteredOrders = orders.filter(order => {
      return order.date >= startDate && order.date <= endDate;
    });

    // 菜品销售统计
    const dishMap = new Map();
    filteredOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const dishName = item.name;
          if (!dishMap.has(dishName)) {
            dishMap.set(dishName, {
              name: dishName,
              count: 0,
              revenue: 0
            });
          }
          const dish = dishMap.get(dishName);
          dish.count += item.quantity || 1;
          dish.revenue += (parseFloat(item.price) || 0) * (item.quantity || 1);
        });
      }
    });

    const dishStats = Array.from(dishMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 餐次统计
    const mealTypeMap = {
      breakfast: { name: '早餐', count: 0, revenue: 0 },
      lunch: { name: '午餐', count: 0, revenue: 0 },
      dinner: { name: '晚餐', count: 0, revenue: 0 }
    };

    filteredOrders.forEach(order => {
      const mealType = order.mealType || 'lunch';
      if (mealTypeMap[mealType]) {
        mealTypeMap[mealType].count += 1;
        mealTypeMap[mealType].revenue += parseFloat(order.totalPrice) || 0;
      }
    });

    const mealTypeStats = Object.values(mealTypeMap).filter(m => m.count > 0);

    this.setData({
      dishStats,
      mealTypeStats
    });
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
    this.analyzeData();
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
    this.analyzeData();
  },

  getTopThreeDishes() {
    return this.data.dishStats.slice(0, 3);
  }
});
