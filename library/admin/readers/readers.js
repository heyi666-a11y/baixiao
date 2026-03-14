const { libraryAPI } = require('../../../../utils/supabase')

Page({
  data: {
    isSidebarOpen: false,
    readers: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    
    // 详情弹窗
    showDetailModal: false,
    currentReader: null,
    currentBorrows: [],
    historyBorrows: []
  },

  onLoad() {
    this.checkLogin()
    this.loadReaders()
  },

  onShow() {
    this.loadReaders()
  },

  checkLogin() {
    const adminToken = wx.getStorageSync('adminToken')
    if (!adminToken) {
      wx.redirectTo({
        url: '/pages/library/admin/login/login'
      })
    }
  },

  toggleSidebar() {
    this.setData({
      isSidebarOpen: !this.data.isSidebarOpen
    })
  },

  navigateTo(e) {
    const page = e.currentTarget.dataset.page
    if (page === 'readers') {
      this.setData({ isSidebarOpen: false })
      return
    }
    wx.navigateTo({
      url: `/pages/library/admin/${page}/${page}`
    })
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

  // 加载读者列表
  async loadReaders(isLoadMore = false) {
    if (this.data.isLoading || (isLoadMore && !this.data.hasMore)) return

    this.setData({
      isLoading: !isLoadMore,
      isLoadingMore: isLoadMore
    })

    try {
      const { page, pageSize } = this.data
      
      const { data, error } = await libraryAPI.getReaders({
        select: '*',
        order: { column: 'student_id', ascending: true },
        limit: pageSize,
        offset: (page - 1) * pageSize
      })

      if (error) throw error

      let readers = data || []
      
      // 获取每个读者的借阅统计
      for (let reader of readers) {
        const stats = await this.getReaderStats(reader.id)
        reader.currentBorrows = stats.current
        reader.totalBorrows = stats.total
        reader.overdueCount = stats.overdue
      }

      this.setData({
        readers: isLoadMore ? [...this.data.readers, ...readers] : readers,
        hasMore: readers.length === pageSize,
        page: isLoadMore ? page + 1 : page
      })
    } catch (err) {
      console.error('加载读者失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({
        isLoading: false,
        isLoadingMore: false
      })
    }
  },

  // 获取读者借阅统计
  async getReaderStats(readerId) {
    try {
      // 获取当前借阅
      const { data: currentData } = await libraryAPI.getBorrowRecords({
        select: 'id',
        eq: { column: 'reader_id', value: readerId }
      })
      
      // 获取所有借阅记录
      const { data: allData } = await libraryAPI.getBorrowRecords({
        select: 'id,status,due_date',
        eq: { column: 'reader_id', value: readerId }
      })

      const current = currentData ? currentData.filter(r => r.status === 'borrowed').length : 0
      const total = allData ? allData.length : 0
      
      // 计算逾期次数
      const today = new Date().toISOString().split('T')[0]
      const overdue = allData ? allData.filter(r => {
        return r.status === 'borrowed' && r.due_date < today
      }).length : 0

      return { current, total, overdue }
    } catch (err) {
      console.error('获取读者统计失败:', err)
      return { current: 0, total: 0, overdue: 0 }
    }
  },

  loadMore() {
    this.loadReaders(true)
  },

  // 显示读者详情
  async showReaderDetail(e) {
    const id = e.currentTarget.dataset.id
    const reader = this.data.readers.find(r => r.id === id)
    if (!reader) return

    this.setData({
      showDetailModal: true,
      currentReader: reader
    })

    // 加载借阅详情
    await this.loadReaderBorrows(id)
  },

  closeDetailModal() {
    this.setData({
      showDetailModal: false,
      currentReader: null,
      currentBorrows: [],
      historyBorrows: []
    })
  },

  // 加载读者借阅记录
  async loadReaderBorrows(readerId) {
    try {
      const { data } = await libraryAPI.getBorrowRecords({
        select: '*,books(title,author)',
        eq: { column: 'reader_id', value: readerId },
        order: { column: 'borrow_date', ascending: false },
        limit: 100
      })

      if (!data) {
        this.setData({
          currentBorrows: [],
          historyBorrows: []
        })
        return
      }

      const today = new Date().toISOString().split('T')[0]
      
      const currentBorrows = data
        .filter(r => r.status === 'borrowed')
        .map(r => ({
          ...r,
          isOverdue: r.due_date < today
        }))

      const historyBorrows = data.filter(r => r.status === 'returned')

      this.setData({
        currentBorrows,
        historyBorrows
      })
    } catch (err) {
      console.error('加载借阅记录失败:', err)
      this.setData({
        currentBorrows: [],
        historyBorrows: []
      })
    }
  },

  // 导出读者报表
  exportReaders() {
    const { readers } = this.data
    if (readers.length === 0) {
      wx.showToast({ title: '暂无数据可导出', icon: 'none' })
      return
    }

    // 构建CSV内容
    const headers = ['姓名', '学号', '班级', '当前借阅', '历史借阅', '逾期次数']
    const rows = readers.map(reader => [
      reader.name,
      reader.student_id,
      reader.class_name || '',
      reader.currentBorrows || 0,
      reader.totalBorrows || 0,
      reader.overdueCount || 0
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: csvContent,
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: '读者数据已复制到剪贴板，您可以粘贴到Excel中',
          showCancel: false
        })
      }
    })
  }
})
