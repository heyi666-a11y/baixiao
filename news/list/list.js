const supabaseAPI = require('../../../utils/supabaseAPI.js');

Page({
  data: {
    newsList: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadNews();
  },

  async loadNews() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      const result = await supabaseAPI.getNews({
        limit: this.data.pageSize,
        offset: (this.data.page - 1) * this.data.pageSize
      });
      
      if (result.error) {
        throw new Error(result.error.message || '加载失败');
      }
      
      const news = result.data || [];
      const hasMore = news.length === this.data.pageSize;
      
      this.setData({
        newsList: this.data.page === 1 ? news : [...this.data.newsList, ...news],
        hasMore,
        loading: false
      });
    } catch (err) {
      console.error('加载新闻失败:', err);
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  onNewsTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/news/detail/detail?id=${id}`
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      });
      this.loadNews();
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      newsList: []
    });
    this.loadNews().then(() => {
      wx.stopPullDownRefresh();
    });
  }
});
