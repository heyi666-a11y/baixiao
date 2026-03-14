const adminAPI = require('../../../utils/adminAPI');

Page({
  data: {
    startDate: '',
    endDate: '',
    stats: {
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      dailyStats: []
    },
    chartData: []
  },

  onLoad() {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    this.setData({
      startDate: sevenDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
    
    this.loadStats();
  },

  async loadStats() {
    wx.showLoading({ title: '加载中...' });
    try {
      const { startDate, endDate } = this.data;
      
      const [revenueRes, orderRes] = await Promise.all([
        adminAPI.canteen.getRevenueStats(startDate, endDate),
        adminAPI.canteen.getOrderStats(startDate, endDate)
      ]);

      if (revenueRes.success !== false && orderRes.success !== false) {
        const dailyStats = Object.entries(revenueRes.data || {}).map(([date, data]) => ({
          date,
          revenue: data.revenue.toFixed(2),
          orders: data.orders
        })).sort((a, b) => a.date.localeCompare(b.date));

        const totalRevenue = dailyStats.reduce((sum, d) => sum + parseFloat(d.revenue), 0);
        const totalOrders = dailyStats.reduce((sum, d) => sum + d.orders, 0);
        const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : 0;

        this.setData({
          stats: {
            totalRevenue: totalRevenue.toFixed(2),
            totalOrders,
            avgOrderValue,
            dailyStats
          }
        });
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
      wx.showToast({ title: '加载失败', icon: 'error' });
    } finally {
      wx.hideLoading();
    }
  },

  onStartDateChange(e) {
    this.setData({ startDate: e.detail.value });
    this.loadStats();
  },

  onEndDateChange(e) {
    this.setData({ endDate: e.detail.value });
    this.loadStats();
  },

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
});
