const { libraryAPI, supabase } = require('../../../../utils/supabase')

Page({
  data: {
    isSidebarOpen: false,
    isSaving: false,
    isPublishing: false,
    
    // 借阅参数设置
    settings: {
      borrowDays: 30,
      maxBooks: 5,
      overdueFee: 0.5
    },
    
    // 公告
    announcement: {
      title: '',
      content: '',
      isPublished: false
    }
  },

  onLoad() {
    this.checkLogin()
    this.loadSettings()
    this.loadAnnouncement()
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
    if (page === 'settings') {
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

  // 加载设置
  async loadSettings() {
    try {
      // 从本地存储加载设置
      const savedSettings = wx.getStorageSync('librarySettings')
      if (savedSettings) {
        this.setData({
          settings: savedSettings
        })
      }
    } catch (err) {
      console.error('加载设置失败:', err)
    }
  },

  // 加载公告
  async loadAnnouncement() {
    try {
      const { data, error } = await supabase.get('announcements', {
        select: '*',
        order: { column: 'created_at', ascending: false },
        limit: 1
      })

      if (error) throw error

      if (data && data.length > 0) {
        const announcement = data[0]
        this.setData({
          announcement: {
            id: announcement.id,
            title: announcement.title || '',
            content: announcement.content || '',
            isPublished: announcement.is_published || false
          }
        })
      }
    } catch (err) {
      console.error('加载公告失败:', err)
    }
  },

  // 设置输入
  onSettingInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`settings.${field}`]: value
    })
  },

  // 保存设置
  async saveSettings() {
    const { settings } = this.data

    // 验证输入
    if (!settings.borrowDays || settings.borrowDays < 1) {
      wx.showToast({ title: '借阅周期至少为1天', icon: 'none' })
      return
    }
    if (!settings.maxBooks || settings.maxBooks < 1) {
      wx.showToast({ title: '最大借阅数量至少为1本', icon: 'none' })
      return
    }
    if (settings.overdueFee < 0) {
      wx.showToast({ title: '逾期罚款不能为负数', icon: 'none' })
      return
    }

    this.setData({ isSaving: true })

    try {
      // 保存到本地存储
      wx.setStorageSync('librarySettings', {
        borrowDays: parseInt(settings.borrowDays),
        maxBooks: parseInt(settings.maxBooks),
        overdueFee: parseFloat(settings.overdueFee)
      })

      // 尝试保存到数据库
      try {
        await supabase.patch('library_settings', {
          borrow_days: parseInt(settings.borrowDays),
          max_books: parseInt(settings.maxBooks),
          overdue_fee: parseFloat(settings.overdueFee),
          updated_at: new Date().toISOString()
        }, { column: 'id', value: 1 })
      } catch (dbErr) {
        console.log('数据库保存失败，仅保存到本地:', dbErr)
      }

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } catch (err) {
      console.error('保存设置失败:', err)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isSaving: false })
    }
  },

  // 公告输入
  onAnnouncementInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`announcement.${field}`]: value
    })
  },

  // 发布状态切换
  onPublishChange(e) {
    this.setData({
      'announcement.isPublished': e.detail.value
    })
  },

  // 发布公告
  async publishAnnouncement() {
    const { announcement } = this.data

    if (!announcement.title.trim()) {
      wx.showToast({ title: '请输入公告标题', icon: 'none' })
      return
    }
    if (!announcement.content.trim()) {
      wx.showToast({ title: '请输入公告内容', icon: 'none' })
      return
    }

    this.setData({ isPublishing: true })

    try {
      const announcementData = {
        title: announcement.title.trim(),
        content: announcement.content.trim(),
        is_published: announcement.isPublished,
        updated_at: new Date().toISOString()
      }

      if (announcement.id) {
        // 更新现有公告
        const { error } = await supabase.patch('announcements', announcementData, {
          column: 'id',
          value: announcement.id
        })
        if (error) throw error
      } else {
        // 创建新公告
        announcementData.created_at = new Date().toISOString()
        const { data, error } = await supabase.post('announcements', announcementData)
        if (error) throw error
        if (data && data.length > 0) {
          this.setData({
            'announcement.id': data[0].id
          })
        }
      }

      wx.showToast({
        title: announcement.isPublished ? '发布成功' : '保存成功',
        icon: 'success'
      })
    } catch (err) {
      console.error('发布公告失败:', err)
      wx.showToast({
        title: '发布失败',
        icon: 'none'
      })
    } finally {
      this.setData({ isPublishing: false })
    }
  }
})
