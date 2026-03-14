const { libraryAPI } = require('../../../../utils/supabase')

const typeMap = {
  'all': { label: '全部类型', value: '', icon: '📝' },
  'borrow': { label: '借书', value: 'borrow', icon: '📖' },
  'return': { label: '还书', value: 'return', icon: '✓' },
  'renew': { label: '续借', value: 'renew', icon: '🔄' },
  'manual': { label: '人工干预', value: 'manual', icon: '⚡' }
}

const statusMap = {
  'borrowed': { text: '借阅中', class: 'borrowed' },
  'returned': { text: '已归还', class: 'returned' },
  'overdue': { text: '已逾期', class: 'overdue' }
}

Page({
  data: {
    isSidebarOpen: false,
    records: [],
    page: 1,
    pageSize: 15,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    
    // 筛选条件
    startDate: '',
    endDate: '',
    typeOptions: Object.values(typeMap),
    typeIndex: 0,
    currentType: '',
    studentId: ''
  },

  onLoad() {
    this.checkLogin()
    this.setDefaultDates()
    this.loadRecords()
  },

  onShow() {
    this.loadRecords()
  },

  checkLogin() {
    const adminToken = wx.getStorageSync('adminToken')
    if (!adminToken) {
      wx.redirectTo({
        url: '/pages/library/admin/login/login'
      })
    }
  },

  setDefaultDates() {
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0]
    }
    
    this.setData({
      startDate: formatDate(thirtyDaysAgo),
      endDate: formatDate(today)
    })
  },

  toggleSidebar() {
    this.setData({
      isSidebarOpen: !this.data.isSidebarOpen
    })
  },

  navigateTo(e) {
    const page = e.currentTarget.dataset.page
    if (page === 'records') {
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

  // 日期选择
  onStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    })
  },

  onEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    })
  },

  // 类型选择
  onTypeChange(e) {
    const index = parseInt(e.detail.value)
    const type = this.data.typeOptions[index].value
    this.setData({
      typeIndex: index,
      currentType: type
    })
  },

  // 学号输入
  onStudentIdInput(e) {
    this.setData({
      studentId: e.detail.value
    })
  },

  // 应用筛选
  applyFilters() {
    this.setData({
      page: 1,
      records: [],
      hasMore: true
    })
    this.loadRecords()
  },

  // 加载记录列表
  async loadRecords(isLoadMore = false) {
    if (this.data.isLoading || (isLoadMore && !this.data.hasMore)) return

    this.setData({
      isLoading: !isLoadMore,
      isLoadingMore: isLoadMore
    })

    try {
      const { startDate, endDate, currentType, studentId, page, pageSize } = this.data
      
      let options = {
        select: '*,books(title,author),readers(name,student_id)',
        order: { column: 'created_at', ascending: false },
        limit: pageSize,
        offset: (page - 1) * pageSize
      }

      // 添加类型筛选
      if (currentType) {
        options.eq = { column: 'record_type', value: currentType }
      }

      const { data, error } = await libraryAPI.getBorrowRecords(options)

      if (error) throw error

      let records = data || []
      
      // 客户端筛选
      records = records.filter(record => {
        // 日期筛选
        if (startDate && record.borrow_date < startDate) return false
        if (endDate && record.borrow_date > endDate) return false
        
        // 学号筛选
        if (studentId && record.readers && !record.readers.student_id.includes(studentId)) {
          return false
        }
        
        return true
      })

      // 处理记录数据
      records = records.map(record => {
        const typeInfo = typeMap[record.record_type] || typeMap['all']
        const statusInfo = statusMap[record.status] || { text: '未知', class: '' }
        
        return {
          ...record,
          typeText: typeInfo.label,
          typeIcon: typeInfo.icon,
          statusText: statusInfo.text,
          statusClass: statusInfo.class
        }
      })

      this.setData({
        records: isLoadMore ? [...this.data.records, ...records] : records,
        hasMore: records.length === pageSize,
        page: isLoadMore ? page + 1 : page
      })
    } catch (err) {
      console.error('加载记录失败:', err)
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

  loadMore() {
    this.loadRecords(true)
  },

  // 导出记录报表
  exportRecords() {
    const { records } = this.data
    if (records.length === 0) {
      wx.showToast({ title: '暂无数据可导出', icon: 'none' })
      return
    }

    // 构建CSV内容
    const headers = ['记录类型', '图书名称', '读者姓名', '学号', '借阅日期', '到期日期', '归还日期', '状态']
    const rows = records.map(record => [
      record.typeText,
      record.books ? record.books.title : '',
      record.readers ? record.readers.name : '',
      record.readers ? record.readers.student_id : '',
      record.borrow_date,
      record.due_date,
      record.return_date || '',
      record.statusText
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: csvContent,
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: '借阅记录已复制到剪贴板，您可以粘贴到Excel中',
          showCancel: false
        })
      }
    })
  }
})
