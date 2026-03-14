const supabaseAPI = require('../../../utils/supabaseAPI.js');

Page({
  data: {
    // 学校ID（广东北江中学）
    schoolId: '550e8400-e29b-41d4-a716-446655440000',
    // 加载状态
    loadingNews: true,
    // 校园风光图片（使用空白占位符）
    campusImages: [
      { id: 1, url: '', name: '教学楼' },
      { id: 2, url: '', name: '公园' },
      { id: 3, url: '', name: '校门' },
      { id: 4, url: '', name: '校园广场' }
    ],
    // 办学特色
    features: [
      { id: 1, icon: '🔬', title: '科技创新教育', desc: '培养创新思维与实践能力', color: '#667eea' },
      { id: 2, icon: '📚', title: '人文素养培育', desc: '传承文化经典提升素养', color: '#764ba2' },
      { id: 3, icon: '⚽', title: '体育艺术教育', desc: '全面发展身心健康成长', color: '#52c41a' },
      { id: 4, icon: '🌍', title: '国际视野拓展', desc: '开阔眼界面向世界', color: '#faad14' }
    ],
    // 最新动态（从Supabase获取）
    newsList: []
  },

  onLoad() {
    this.loadSchoolNews()
  },

  onPullDownRefresh() {
    this.setData({ loadingNews: true })
    this.loadSchoolNews()
    wx.stopPullDownRefresh()
  },

  // 加载学校新闻
  async loadSchoolNews() {
    this.setData({ loadingNews: true })
    try {
      const result = await supabaseAPI.getSchoolNews(this.data.schoolId, { limit: 5 })
      console.log('加载学校新闻结果:', result)
      
      if (result.data && Array.isArray(result.data)) {
        // 格式化日期和添加NEW标记
        const formattedNews = result.data.map(news => {
          const publishDate = new Date(news.published_at || news.created_at)
          const now = new Date()
          const diffDays = Math.floor((now - publishDate) / (1000 * 60 * 60 * 24))
          
          return {
            id: news.id,
            title: news.title,
            date: this.formatDate(news.published_at || news.created_at),
            isNew: diffDays <= 3 || news.is_top, // 3天内或置顶显示NEW
            category: news.category,
            viewCount: news.view_count
          }
        })
        
        this.setData({ newsList: formattedNews })
      } else {
        this.setData({ newsList: [] })
      }
    } catch (err) {
      console.error('加载学校新闻失败:', err)
      this.setData({ newsList: [] })
    } finally {
      this.setData({ loadingNews: false })
    }
  },

  // 格式化日期
  formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 返回上一页
  goBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  },

  // 页面导航
  navigateTo(e) {
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({
        url: url,
        fail: () => {
          wx.switchTab({
            url: url
          })
        }
      })
    } else {
      wx.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    }
  },

  // 预览校园图片
  previewCampusImage(e) {
    const index = e.currentTarget.dataset.index
    const urls = this.data.campusImages.map(item => item.url)
    wx.previewImage({
      current: urls[index],
      urls: urls
    })
  },

  // 查看更多校园风光
  viewMoreCampus() {
    wx.showToast({
      title: '更多内容开发中',
      icon: 'none'
    })
  },

  // 查看更多新闻
  viewMoreNews() {
    wx.navigateTo({
      url: '/pages/news/list/list?schoolId=' + this.data.schoolId
    })
  },

  // 点击新闻
  onNewsTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/news/detail/detail?id=${id}`
    })
  }
})
