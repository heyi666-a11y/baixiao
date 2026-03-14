const { libraryAPI } = require('../../../../utils/supabase')

Page({
  data: {
    isSidebarOpen: false,
    currentDate: '',
    stats: {
      totalBooks: 0,
      todayBorrows: 0,
      activeBorrows: 0,
      overdueCount: 0
    },
    analysisReport: '',
    trendAnalysis: '',
    hotBooks: []
  },

  onLoad() {
    // 检查登录状态
    const adminToken = wx.getStorageSync('adminToken')
    if (!adminToken) {
      wx.redirectTo({
        url: '/pages/library/admin/login/login'
      })
      return
    }

    this.setCurrentDate()
    this.loadDashboardData()
  },

  onShow() {
    this.loadDashboardData()
  },

  setCurrentDate() {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    const weekDay = weekDays[now.getDay()]
    
    this.setData({
      currentDate: `${year}年${month}月${day}日 星期${weekDay}`
    })
  },

  toggleSidebar() {
    this.setData({
      isSidebarOpen: !this.data.isSidebarOpen
    })
  },

  navigateTo(e) {
    const page = e.currentTarget.dataset.page
    const url = `/pages/library/admin/${page}/${page}`
    
    if (page === 'dashboard') {
      this.setData({ isSidebarOpen: false })
      return
    }
    
    wx.navigateTo({ url })
    this.setData({ isSidebarOpen: false })
  },

  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('adminToken')
          wx.removeStorageSync('adminUser')
          wx.redirectTo({
            url: '/pages/library/admin/login/login'
          })
        }
      }
    })
  },

  async loadDashboardData() {
    wx.showLoading({ title: '加载中...' })
    
    try {
      // 并行加载所有数据
      await Promise.all([
        this.loadStats(),
        this.loadHotBooks(),
        this.generateAnalysisReport()
      ])
    } catch (err) {
      console.error('加载数据失败:', err)
      wx.showToast({
        title: '数据加载失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
  },

  async loadStats() {
    try {
      // 获取图书总数
      const { data: books } = await libraryAPI.getBooks({ select: 'id,status' })
      const totalBooks = books ? books.length : 0
      
      // 获取今日借阅数
      const today = new Date().toISOString().split('T')[0]
      const { data: todayRecords } = await libraryAPI.getBorrowRecords({
        select: 'id',
        eq: { column: 'borrow_date', value: today }
      })
      const todayBorrows = todayRecords ? todayRecords.length : 0
      
      // 获取活跃借阅数（未归还）
      const { data: activeRecords } = await libraryAPI.getBorrowRecords({
        select: 'id',
        eq: { column: 'status', value: 'borrowed' }
      })
      const activeBorrows = activeRecords ? activeRecords.length : 0
      
      // 获取逾期数量
      const todayStr = new Date().toISOString().split('T')[0]
      const { data: overdueRecords } = await libraryAPI.getBorrowRecords({
        select: 'id',
        eq: { column: 'status', value: 'borrowed' }
      })
      const overdueCount = overdueRecords ? overdueRecords.filter(r => r.due_date < todayStr).length : 0

      this.setData({
        stats: {
          totalBooks,
          todayBorrows,
          activeBorrows,
          overdueCount
        }
      })
    } catch (err) {
      console.error('加载统计数据失败:', err)
    }
  },

  async loadHotBooks() {
    try {
      // 获取借阅记录统计
      const { data: records } = await libraryAPI.getBorrowRecords({
        select: 'book_id,books(title,author)',
        limit: 1000
      })

      if (!records || records.length === 0) {
        this.setData({ hotBooks: [] })
        return
      }

      // 统计每本书的借阅次数
      const bookStats = {}
      records.forEach(record => {
        if (record.books) {
          const bookId = record.book_id
          if (!bookStats[bookId]) {
            bookStats[bookId] = {
              id: bookId,
              title: record.books.title,
              author: record.books.author,
              borrowCount: 0
            }
          }
          bookStats[bookId].borrowCount++
        }
      })

      // 排序并取前10
      const hotBooks = Object.values(bookStats)
        .sort((a, b) => b.borrowCount - a.borrowCount)
        .slice(0, 10)

      this.setData({ hotBooks })
    } catch (err) {
      console.error('加载热门书籍失败:', err)
      this.setData({ hotBooks: [] })
    }
  },

  async generateAnalysisReport() {
    const { stats } = this.data
    
    // 生成综合分析报告
    let analysisReport = '图书馆运营状况良好。'
    
    if (stats.totalBooks > 0) {
      const utilizationRate = ((stats.activeBorrows / stats.totalBooks) * 100).toFixed(1)
      analysisReport += `当前馆藏图书${stats.totalBooks}册，图书利用率${utilizationRate}%。`
    }
    
    if (stats.todayBorrows > 0) {
      analysisReport += `今日新增借阅${stats.todayBorrows}次，读者活跃度良好。`
    } else {
      analysisReport += '今日暂无借阅记录，建议关注读者需求。'
    }
    
    if (stats.overdueCount > 0) {
      analysisReport += `存在${stats.overdueCount}本逾期图书，请及时催收。`
    } else {
      analysisReport += '逾期情况控制良好，继续保持。'
    }

    // 生成趋势分析
    const { data: recentRecords } = await libraryAPI.getBorrowRecords({
      select: 'borrow_date',
      order: { column: 'borrow_date', ascending: false },
      limit: 100
    })

    let trendAnalysis = '近30天借阅趋势分析：'
    
    if (recentRecords && recentRecords.length > 0) {
      // 按日期分组统计
      const dailyStats = {}
      const today = new Date()
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        dailyStats[dateStr] = 0
      }
      
      recentRecords.forEach(record => {
        if (dailyStats[record.borrow_date] !== undefined) {
          dailyStats[record.borrow_date]++
        }
      })
      
      const dailyCounts = Object.values(dailyStats)
      const totalBorrows = dailyCounts.reduce((a, b) => a + b, 0)
      const avgDaily = (totalBorrows / 30).toFixed(1)
      const maxDaily = Math.max(...dailyCounts)
      const minDaily = Math.min(...dailyCounts.filter(c => c > 0)) || 0
      
      trendAnalysis += `近30天共借阅${totalBorrows}次，日均借阅${avgDaily}次。`
      trendAnalysis += `单日最高借阅${maxDaily}次，`
      
      if (minDaily > 0) {
        trendAnalysis += `最低${minDaily}次。`
      } else {
        trendAnalysis += '部分日期无借阅记录。'
      }
      
      // 趋势判断
      const recent7Days = dailyCounts.slice(0, 7).reduce((a, b) => a + b, 0)
      const previous7Days = dailyCounts.slice(7, 14).reduce((a, b) => a + b, 0)
      
      if (recent7Days > previous7Days) {
        trendAnalysis += '近7天借阅量呈上升趋势，读者关注度提升。'
      } else if (recent7Days < previous7Days) {
        trendAnalysis += '近7天借阅量有所下降，建议开展推广活动。'
      } else {
        trendAnalysis += '借阅量保持稳定。'
      }
    } else {
      trendAnalysis += '近30天暂无借阅数据，建议加强图书推广。'
    }

    this.setData({
      analysisReport,
      trendAnalysis
    })
  }
})
