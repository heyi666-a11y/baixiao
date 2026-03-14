const supabaseAPI = require('../../../utils/supabaseAPI')

Page({
  data: {
    libraryInfo: {
      name: '广东北江中学图书馆',
      openTime: '08:00 - 21:00',
      status: '开放中',
      totalBooks: 0,
      todayBorrow: 0,
      todayReturn: 0
    },
    refreshTimer: null
  },

  onLoad() {
    this.loadLibraryStats()
    // 每5分钟自动刷新数据
    this.data.refreshTimer = setInterval(() => {
      this.loadLibraryStats()
    }, 5 * 60 * 1000)
  },

  onUnload() {
    // 页面卸载时清除定时器
    if (this.data.refreshTimer) {
      clearInterval(this.data.refreshTimer)
    }
  },

  async loadLibraryStats() {
    wx.showLoading({ title: '加载中...' })
    try {
      // 并行获取统计数据
      const [totalBooks, todayBorrow, todayReturn] = await Promise.all([
        supabaseAPI.getBooksCount(),
        supabaseAPI.getTodayBorrowCount(),
        supabaseAPI.getTodayReturnCount()
      ])

      this.setData({
        'libraryInfo.totalBooks': totalBooks,
        'libraryInfo.todayBorrow': todayBorrow,
        'libraryInfo.todayReturn': todayReturn
      })
    } catch (err) {
      console.error('加载图书馆统计失败:', err)
      wx.showToast({ title: '数据加载失败', icon: 'none' })
    } finally {
      wx.hideLoading()
    }
  },

  // 下拉刷新
  async onPullDownRefresh() {
    await this.loadLibraryStats()
    wx.stopPullDownRefresh()
  },

  onStudentEntry() {
    wx.navigateTo({
      url: '/pages/library/student/student'
    })
  },

  onAdminEntry() {
    wx.navigateTo({
      url: '/pages/library/admin/login/login'
    })
  },

  onViewBooks() {
    wx.navigateTo({
      url: '/pages/library/books/books'
    })
  },

  onBackToMain() {
    wx.switchTab({
      url: '/pages/index/index'
    })
  }
})
