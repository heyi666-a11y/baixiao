const supabaseAPI = require('../../../utils/supabaseAPI')

Page({
  data: {
    announcement: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options
    if (id) {
      this.loadAnnouncementDetail(id)
    } else {
      wx.showToast({
        title: '公告ID不存在',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  async loadAnnouncementDetail(id) {
    this.setData({ loading: true })

    try {
      const { data, error } = await supabaseAPI.get('library_announcements', {
        select: '*',
        eq: { column: 'id', value: id }
      })

      if (error) {
        throw error
      }

      if (data && data.length > 0) {
        const announcement = data[0]
        this.setData({
          announcement: {
            ...announcement,
            formattedPublishDate: this.formatDate(announcement.created_at),
            formattedValidFrom: this.formatDate(announcement.valid_from),
            formattedValidUntil: this.formatDate(announcement.valid_until)
          },
          loading: false
        })
      } else {
        wx.showToast({
          title: '公告不存在',
          icon: 'none'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (err) {
      console.error('加载公告详情失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  formatDate(dateString) {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}年${month}月${day}日`
  },

  goBack() {
    wx.navigateBack()
  },

  // 分享功能
  onShareAppMessage() {
    const { announcement } = this.data
    return {
      title: announcement ? announcement.title : '图书馆公告',
      path: `/pages/library/announcement-detail/announcement-detail?id=${announcement ? announcement.id : ''}`
    }
  }
})
