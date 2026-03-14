const { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } = require('../../../../utils/supabase')

Page({
  data: {
    username: '',
    password: '',
    isLoading: false
  },

  onLoad() {
    // 检查是否已登录
    const adminToken = wx.getStorageSync('adminToken')
    if (adminToken) {
      wx.redirectTo({
        url: '/pages/library/admin/dashboard/dashboard'
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
        title: '请输入用户名',
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
      // 使用 Supabase Auth 进行管理员登录
      const { data, error } = await this.adminLogin(username, password)

      if (error) {
        throw new Error(error.message || '登录失败')
      }

      // 保存登录信息
      wx.setStorageSync('adminToken', data.session.access_token)
      wx.setStorageSync('adminUser', data.user)

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/library/admin/dashboard/dashboard'
        })
      }, 1000)

    } catch (err) {
      console.error('登录失败:', err)
      wx.showToast({
        title: err.message || '登录失败，请检查用户名和密码',
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
      // 与网页版保持一致，使用硬编码的方式
      if (username === 'admin' && password === 'admin123') {
        resolve({ 
          data: {
            session: {
              access_token: 'admin_token_' + Date.now()
            },
            user: {
              id: 'admin',
              name: '管理员'
            }
          }, 
          error: null 
        })
      } else {
        resolve({ 
          data: null, 
          error: { message: '用户名或密码错误' } 
        })
      }
    })
  }
})
