const App = {
  globalData: {
    userInfo: null,
    systemInfo: null
  },

  init() {
    this.onLaunch()
    this.onShow()
    this.setupEventListeners()
  },

  onLaunch() {
    console.log('App launched')
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registered:', registration)
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateModal()
              }
            })
          })
        })
        .catch(err => {
          console.log('ServiceWorker registration failed:', err)
        })
    }
  },

  showUpdateModal() {
    const modal = document.createElement('div')
    modal.className = 'update-modal'
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10002;
    `
    
    const content = document.createElement('div')
    content.style.cssText = `
      background: white;
      border-radius: 8px;
      width: 80%;
      max-width: 300px;
      padding: 20px;
      text-align: center;
    `
    
    const title = document.createElement('h3')
    title.textContent = '更新提示'
    title.style.margin = '0 0 10px 0'
    
    const message = document.createElement('p')
    message.textContent = '新版本已经准备好，是否刷新页面？'
    message.style.margin = '0 0 20px 0'
    message.style.color = '#666'
    
    const btnContainer = document.createElement('div')
    btnContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
    `
    
    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = '稍后'
    cancelBtn.style.cssText = `
      padding: 8px 20px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
    `
    cancelBtn.onclick = () => {
      document.body.removeChild(modal)
    }
    
    const confirmBtn = document.createElement('button')
    confirmBtn.textContent = '刷新'
    confirmBtn.style.cssText = `
      padding: 8px 20px;
      border: none;
      background: #007aff;
      color: white;
      border-radius: 4px;
      cursor: pointer;
    `
    confirmBtn.onclick = () => {
      window.location.reload()
    }
    
    btnContainer.appendChild(cancelBtn)
    btnContainer.appendChild(confirmBtn)
    content.appendChild(title)
    content.appendChild(message)
    content.appendChild(btnContainer)
    modal.appendChild(content)
    document.body.appendChild(modal)
  },

  onShow() {
    this.getSystemInfo()
    this.checkLoginStatus()
  },

  onHide() {
    console.log('App hidden')
  },

  onError(msg) {
    console.error('App error:', msg)
  },

  onPageNotFound(res) {
    console.log('Page not found:', res)
    window.location.href = '/404.html'
  },

  getSystemInfo() {
    this.globalData.systemInfo = {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      language: navigator.language,
      pixelRatio: window.devicePixelRatio
    }
    return this.globalData.systemInfo
  },

  checkLoginStatus() {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      try {
        this.globalData.userInfo = JSON.parse(userInfo)
      } catch (e) {
        console.error('Parse userInfo error:', e)
        this.globalData.userInfo = null
      }
    }
  },

  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
  },

  clearUserInfo() {
    this.globalData.userInfo = null
    localStorage.removeItem('userInfo')
  },

  getUserInfo() {
    return this.globalData.userInfo
  },

  setupEventListeners() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onHide()
      } else {
        this.onShow()
      }
    })

    window.addEventListener('error', (e) => {
      this.onError(e.message)
    })

    window.addEventListener('unhandledrejection', (e) => {
      this.onError(e.reason)
    })

    window.addEventListener('online', () => {
      console.log('Network connected')
    })

    window.addEventListener('offline', () => {
      console.log('Network disconnected')
    })

    window.addEventListener('resize', () => {
      this.getSystemInfo()
    })
  },

  request(options) {
    const { url, method = 'GET', data, header = {} } = options
    
    return fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...header
      },
      body: data ? JSON.stringify(data) : undefined
    })
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    })
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = App
}

if (typeof window !== 'undefined') {
  window.App = App
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      App.init()
    })
  } else {
    App.init()
  }
}
