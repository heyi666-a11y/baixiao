const supabaseAPI = require('../../../utils/supabaseAPI.js');

Page({
  data: {
    // 学校ID（广东北江中学）
    schoolId: '550e8400-e29b-41d4-a716-446655440000',
    // 新闻列表
    newsList: [],
    // 加载状态
    loading: true,
    // 当前页码
    page: 1,
    // 每页数量
    pageSize: 10,
    // 是否还有更多
    hasMore: true,
    // 分类筛选
    currentCategory: 'all',
    categories: [
      { id: 'all', name: '全部' },
      { id: 'notice', name: '通知' },
      { id: 'activity', name: '活动' },
      { id: 'honor', name: '荣誉' },
      { id: 'general', name: '综合' }
    ]
  },

  onLoad() {
    this.loadNewsList()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.setData({ page: 1, newsList: [] })
    this.loadNewsList()
  },

  onPullDownRefresh() {
    this.setData({ page: 1, newsList: [], hasMore: true })
    this.loadNewsList()
    wx.stopPullDownRefresh()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadNewsList()
    }
  },

  // 加载新闻列表
  async loadNewsList() {
    if (this.data.loading && this.data.newsList.length > 0) return
    
    this.setData({ loading: true })
    
    try {
      const { page, pageSize, schoolId, currentCategory } = this.data
      
      // 构建查询参数
      const options = {
        limit: pageSize,
        offset: (page - 1) * pageSize
      }
      
      const result = await supabaseAPI.getSchoolNews(schoolId, options)
      console.log('加载学校新闻列表:', result)
      
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        // 格式化数据
        const formattedNews = result.data.map(news => ({
          id: news.id,
          title: news.title,
          summary: news.summary || (news.content ? news.content.substring(0, 50) + '...' : ''),
          author: news.author || '学校管理员',
          category: news.category,
          categoryName: this.getCategoryName(news.category),
          isPublished: news.is_published,
          isTop: news.is_top,
          viewCount: news.view_count || 0,
          publishedAt: this.formatDate(news.published_at),
          createdAt: this.formatDate(news.created_at)
        }))
        
        // 客户端筛选分类
        let filteredNews = formattedNews
        if (currentCategory !== 'all') {
          filteredNews = formattedNews.filter(news => news.category === currentCategory)
        }
        
        this.setData({
          newsList: page === 1 ? filteredNews : [...this.data.newsList, ...filteredNews],
          hasMore: result.data.length === pageSize,
          page: page + 1
        })
      } else {
        // 没有数据或出错，显示空状态
        this.setData({
          newsList: page === 1 ? [] : this.data.newsList,
          hasMore: false
        })
        
        // 如果是第一页且出错，提示用户
        if (page === 1 && result.error) {
          console.error('获取新闻失败:', result.error)
          // 不显示toast，让空状态提示用户
        }
      }
    } catch (err) {
      console.error('加载新闻列表失败:', err)
      this.setData({
        newsList: [],
        hasMore: false
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 获取分类名称
  getCategoryName(category) {
    const map = {
      'notice': '通知',
      'activity': '活动',
      'honor': '荣誉',
      'general': '综合'
    }
    return map[category] || '综合'
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

  // 切换分类
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      currentCategory: category,
      page: 1,
      newsList: [],
      hasMore: true
    })
    this.loadNewsList()
  },

  // 发布新闻
  onPublishNews() {
    wx.navigateTo({
      url: '/pages/school-admin/school-news-publish/school-news-publish'
    })
  },

  // 编辑新闻
  onEditNews(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/school-admin/school-news-publish/school-news-publish?id=${id}&mode=edit`
    })
  },

  // 删除新闻
  onDeleteNews(e) {
    const id = e.currentTarget.dataset.id
    const title = e.currentTarget.dataset.title
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除新闻"${title}"吗？`,
      confirmColor: '#ff4d4f',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await supabaseAPI.deleteNews(id)
            if (!result.error) {
              wx.showToast({
                title: '删除成功',
                icon: 'success'
              })
              // 刷新列表
              this.setData({ page: 1, newsList: [] })
              this.loadNewsList()
            } else {
              wx.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          } catch (err) {
            console.error('删除新闻失败:', err)
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            })
          }
        }
      }
    })
  },

  // 切换置顶状态
  async onToggleTop(e) {
    const id = e.currentTarget.dataset.id
    const isTop = e.currentTarget.dataset.top
    
    try {
      const result = await supabaseAPI.updateNews(id, {
        is_top: !isTop,
        updated_at: new Date().toISOString()
      })
      
      if (!result.error) {
        wx.showToast({
          title: isTop ? '取消置顶' : '置顶成功',
          icon: 'success'
        })
        // 刷新列表
        this.setData({ page: 1, newsList: [] })
        this.loadNewsList()
      } else {
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('切换置顶状态失败:', err)
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      })
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  }
})
