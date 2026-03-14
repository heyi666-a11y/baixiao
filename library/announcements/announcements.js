const supabaseAPI = require('../../../utils/supabaseAPI')

Page({
  data: {
    announcements: [],
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadAnnouncements()
  },

  onPullDownRefresh() {
    this.setData({
      announcements: [],
      page: 1,
      hasMore: true
    })
    this.loadAnnouncements().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadAnnouncements()
    }
  },

  async loadAnnouncements() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabaseAPI.getAnnouncements({
        select: '*',
        order: { column: 'created_at', ascending: false },
        limit: this.data.pageSize,
        offset: (this.data.page - 1) * this.data.pageSize,
        gte: { column: 'valid_until', value: today }
      })

      if (error) {
        throw error
      }

      const announcements = data || []
      
      // 格式化日期
      const formattedAnnouncements = announcements.map(item => ({
        ...item,
        formattedDate: this.formatDate(item.created_at),
        briefContent: this.getBriefContent(item.content)
      }))

      this.setData({
        announcements: [...this.data.announcements, ...formattedAnnouncements],
        page: this.data.page + 1,
        hasMore: announcements.length === this.data.pageSize
      })
    } catch (err) {
      console.error('加载公告失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  getBriefContent(content) {
    if (!content) return ''
    // 去除HTML标签
    const text = content.replace(/<[^>]+>/g, '')
    // 截取前60个字符
    return text.length > 60 ? text.substring(0, 60) + '...' : text
  },

  navigateToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/library/announcement-detail/announcement-detail?id=${id}`
    })
  },

  goBack() {
    wx.navigateBack()
  }
})
