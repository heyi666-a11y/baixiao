const supabaseAPI = require('../../../utils/supabaseAPI.js');

Page({
  data: {
    news: null,
    loading: true
  },

  onLoad(options) {
    const id = options.id;
    if (id) {
      this.loadNewsDetail(id);
    } else {
      wx.showToast({
        title: '新闻ID不存在',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  async loadNewsDetail(id) {
    this.setData({ loading: true });
    
    try {
      const result = await supabaseAPI.getNewsById(id);
      
      if (!result) {
        throw new Error('新闻不存在');
      }
      
      this.setData({
        news: result,
        loading: false
      });
      
      // 更新浏览次数
      this.updateViewCount(id);
    } catch (err) {
      console.error('加载新闻详情失败:', err);
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  async updateViewCount(id) {
    try {
      // 获取当前浏览次数并+1
      const news = await supabaseAPI.getNewsById(id);
      if (news) {
        await supabaseAPI.patch('school_news', id, {
          view_count: (news.view_count || 0) + 1
        });
      }
    } catch (err) {
      console.error('更新浏览次数失败:', err);
    }
  },

  onShareAppMessage() {
    const news = this.data.news;
    if (news) {
      return {
        title: news.title,
        path: `/pages/news/detail/detail?id=${news.id}`
      };
    }
    return {
      title: '学校新闻',
      path: '/pages/news/list/list'
    };
  }
});
