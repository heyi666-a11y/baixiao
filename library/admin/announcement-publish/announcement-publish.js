const supabaseAPI = require('../../../../utils/supabaseAPI')

Page({
  data: {
    isSidebarOpen: false,
    form: {
      title: '',
      content: '',
      valid_from: '',
      valid_until: ''
    },
    submitting: false,
    today: ''
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

    this.setTodayDate()
  },

  setTodayDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    
    this.setData({
      today: dateStr,
      'form.valid_from': dateStr
    })
  },

  toggleSidebar() {
    this.setData({
      isSidebarOpen: !this.data.isSidebarOpen
    })
  },

  navigateTo(e) {
    const page = e.currentTarget.dataset.page
    
    if (page === 'announcement-publish') {
      this.setData({ isSidebarOpen: false })
      return
    }
    
    const url = `/pages/library/admin/${page}/${page}`
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

  // 表单输入处理
  onTitleInput(e) {
    this.setData({
      'form.title': e.detail.value
    })
  },

  onContentInput(e) {
    this.setData({
      'form.content': e.detail.value
    })
  },

  onValidFromChange(e) {
    this.setData({
      'form.valid_from': e.detail.value
    })
  },

  onValidUntilChange(e) {
    this.setData({
      'form.valid_until': e.detail.value
    })
  },

  // 验证表单
  validateForm() {
    const { title, content, valid_from, valid_until } = this.data.form
    
    if (!title.trim()) {
      wx.showToast({
        title: '请输入公告标题',
        icon: 'none'
      })
      return false
    }

    if (title.trim().length > 100) {
      wx.showToast({
        title: '标题不能超过100字',
        icon: 'none'
      })
      return false
    }

    if (!content.trim()) {
      wx.showToast({
        title: '请输入公告内容',
        icon: 'none'
      })
      return false
    }

    if (!valid_from) {
      wx.showToast({
        title: '请选择生效日期',
        icon: 'none'
      })
      return false
    }

    if (!valid_until) {
      wx.showToast({
        title: '请选择有效期至',
        icon: 'none'
      })
      return false
    }

    if (new Date(valid_until) < new Date(valid_from)) {
      wx.showToast({
        title: '有效期不能早于生效日期',
        icon: 'none'
      })
      return false
    }

    return true
  },

  // 提交表单
  async submitForm() {
    if (!this.validateForm()) return
    if (this.data.submitting) return

    this.setData({ submitting: true })

    try {
      const adminUser = wx.getStorageSync('adminUser') || {}
      
      const data = {
        title: this.data.form.title.trim(),
        content: this.data.form.content.trim(),
        valid_from: this.data.form.valid_from,
        valid_until: this.data.form.valid_until,
        author: adminUser.name || adminUser.username || '管理员',
        created_at: new Date().toISOString()
      }

      const { error } = await supabaseAPI.publishAnnouncement(data)

      if (error) {
        throw error
      }

      wx.showToast({
        title: '发布成功',
        icon: 'success'
      })

      // 重置表单
      this.setData({
        form: {
          title: '',
          content: '',
          valid_from: this.data.today,
          valid_until: ''
        }
      })

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)

    } catch (err) {
      console.error('发布公告失败:', err)
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 重置表单
  resetForm() {
    wx.showModal({
      title: '确认重置',
      content: '确定要清空所有内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            form: {
              title: '',
              content: '',
              valid_from: this.data.today,
              valid_until: ''
            }
          })
        }
      }
    })
  }
})
