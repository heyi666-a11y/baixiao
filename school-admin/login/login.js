Page({
  data: {
    username: '',
    password: '',
    isLoading: false
  },

  onLoad() {
    // 检查是否已登录
    const adminToken = wx.getStorageSync('schoolAdminToken')
    if (adminToken) {
      wx.redirectTo({
        url: '/pages/school-admin/dashboard/dashboard'
      })
    }
  },

  onUsernameInput(e) {
    this.setData({
      username: e.detail.value
    })
  },

  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    })
  },

  async onLogin() {
    const { username, password } = this.data

    if (!username.trim()) {
      wx.showToast({
        title: '请输入账号',
        icon: 'none'
      })
      return
    }

    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      })
      return
    }

    this.setData({ isLoading: true })

    try {
      // 管理员登录验证
      const result = await this.adminLogin(username, password)

      if (result.error) {
        throw new Error(result.error.message || '登录失败')
      }

      // 保存登录信息
      wx.setStorageSync('schoolAdminToken', result.data.session.access_token)
      wx.setStorageSync('schoolAdminUser', result.data.user)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/school-admin/dashboard/dashboard'
        })
      }, 1000)

    } catch (err) {
      console.error('登录失败:', err)
      wx.showToast({
        title: err.message || '登录失败，请检查账号和密码',
        icon: 'none',
        duration: 2000
      })
    } finally {
      this.setData({ isLoading: false })
    }
  },

  // 管理员登录验证
  adminLogin(username, password) {
    return new Promise((resolve) => {
      // 默认账号密码
      if (username === 'admin' && password === 'admin123') {
        resolve({ 
          data: {
            session: {
              access_token: 'school_admin_token_' + Date.now()
            },
            user: {
              id: 'admin',
              name: '学校管理员'
            }
          }, 
          error: null 
        })
      } else {
        resolve({ 
          data: null, 
          error: { message: '账号或密码错误' } 
        })
      }
    })
  }
})
