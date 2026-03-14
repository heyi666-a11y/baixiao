const { libraryAPI } = require('../../../utils/supabase')

Page({
  data: {
    welcomeTitle: '欢迎使用图书馆自助终端',
    functionCards: [
      { id: 'borrow', name: '借书', icon: '📖', color: '#667eea', url: '/pages/library/borrow/borrow' },
      { id: 'return', name: '还书', icon: '📚', color: '#764ba2', url: '/pages/library/return/return' },
      { id: 'books', name: '查看书库', icon: '🔍', color: '#f093fb', url: '/pages/library/books/books' },
      { id: 'logout', name: '退出登录', icon: '🚪', color: '#4facfe', url: '' }
    ],
    showNotice: false,
    notice: {
      title: '',
      content: '',
      publishTime: ''
    }
  },

  onLoad() {
    this.loadLatestNotice()
  },

  async loadLatestNotice() {
    try {
      const { data, error } = await libraryAPI.getBooks('announcements', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        limit: 1
      })
      
      if (data && data.length > 0 && !error) {
        const notice = data[0]
        this.setData({
          notice: {
            title: notice.title || '图书馆公告',
            content: notice.content || '',
            publishTime: this.formatDate(notice.created_at)
          },
          showNotice: true
        })
      } else {
        // 使用默认公告
        this.setData({
          notice: {
            title: '图书馆公告',
            content: '欢迎使用广东北江中学图书馆自助服务系统！请遵守图书馆规章制度，爱护图书，按时归还。',
            publishTime: this.formatDate(new Date())
          },
          showNotice: true
        })
      }
    } catch (err) {
      console.error('加载公告失败:', err)
      // 使用默认公告
      this.setData({
        notice: {
          title: '图书馆公告',
          content: '欢迎使用广东北江中学图书馆自助服务系统！请遵守图书馆规章制度，爱护图书，按时归还。',
          publishTime: this.formatDate(new Date())
        },
        showNotice: true
      })
    }
  },

  formatDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  onCardTap(e) {
    const { id, url } = e.currentTarget.dataset
    
    if (id === 'logout') {
      wx.showModal({
        title: '确认退出',
        content: '确定要返回图书馆入口吗？',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/library/entry/entry'
            })
          }
        }
      })
    } else if (url) {
      wx.navigateTo({ url })
    }
  },

  closeNotice() {
    this.setData({
      showNotice: false
    })
  },

  onBack() {
    wx.navigateBack()
  }
})
