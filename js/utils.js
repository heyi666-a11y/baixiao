const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

const formatDate = (date, separator = '-') => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join(separator)
}

const debounce = (fn, delay = 300) => {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

const throttle = (fn, interval = 300) => {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

const showToast = (message, type = 'info', duration = 2000) => {
  const toast = document.createElement('div')
  toast.className = `toast toast-${type}`
  toast.textContent = message
  toast.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 14px;
    z-index: 9999;
    transition: opacity 0.3s;
  `
  document.body.appendChild(toast)
  
  setTimeout(() => {
    toast.style.opacity = '0'
    setTimeout(() => {
      document.body.removeChild(toast)
    }, 300)
  }, duration)
}

const showLoading = (title = '加载中...') => {
  let loadingMask = document.getElementById('loading-mask')
  if (!loadingMask) {
    loadingMask = document.createElement('div')
    loadingMask.id = 'loading-mask'
    loadingMask.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9998;
    `
    const loadingText = document.createElement('div')
    loadingText.id = 'loading-text'
    loadingText.style.cssText = `
      background: white;
      padding: 20px 40px;
      border-radius: 8px;
      font-size: 14px;
    `
    loadingMask.appendChild(loadingText)
    document.body.appendChild(loadingMask)
  }
  document.getElementById('loading-text').textContent = title
  loadingMask.style.display = 'flex'
}

const hideLoading = () => {
  const loadingMask = document.getElementById('loading-mask')
  if (loadingMask) {
    loadingMask.style.display = 'none'
  }
}

const showModal = (title, content, showCancel = true) => {
  return new Promise((resolve) => {
    const modal = document.createElement('div')
    modal.className = 'modal'
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
      z-index: 10000;
    `
    
    const modalContent = document.createElement('div')
    modalContent.style.cssText = `
      background: white;
      border-radius: 8px;
      width: 80%;
      max-width: 300px;
      overflow: hidden;
    `
    
    const modalTitle = document.createElement('div')
    modalTitle.textContent = title
    modalTitle.style.cssText = `
      padding: 16px;
      text-align: center;
      font-size: 16px;
      font-weight: bold;
      border-bottom: 1px solid #eee;
    `
    
    const modalBody = document.createElement('div')
    modalBody.textContent = content
    modalBody.style.cssText = `
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #666;
    `
    
    const modalFooter = document.createElement('div')
    modalFooter.style.cssText = `
      display: flex;
      border-top: 1px solid #eee;
    `
    
    if (showCancel) {
      const cancelBtn = document.createElement('button')
      cancelBtn.textContent = '取消'
      cancelBtn.style.cssText = `
        flex: 1;
        padding: 12px;
        border: none;
        background: white;
        font-size: 14px;
        cursor: pointer;
        border-right: 1px solid #eee;
      `
      cancelBtn.onclick = () => {
        document.body.removeChild(modal)
        resolve(false)
      }
      modalFooter.appendChild(cancelBtn)
    }
    
    const confirmBtn = document.createElement('button')
    confirmBtn.textContent = '确定'
    confirmBtn.style.cssText = `
      flex: 1;
      padding: 12px;
      border: none;
      background: white;
      color: #007aff;
      font-size: 14px;
      cursor: pointer;
    `
    confirmBtn.onclick = () => {
      document.body.removeChild(modal)
      resolve(true)
    }
    modalFooter.appendChild(confirmBtn)
    
    modalContent.appendChild(modalTitle)
    modalContent.appendChild(modalBody)
    modalContent.appendChild(modalFooter)
    modal.appendChild(modalContent)
    document.body.appendChild(modal)
  })
}

const navigateTo = (url) => {
  if (url && url.startsWith('/pages/')) {
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    let relativeUrl = '';
    
    // 检查当前页面是否在 pages 目录下
    if (currentPath.includes('/pages/')) {
      // 计算相对路径
      const pathParts = currentPath.split('/');
      const pagesIndex = pathParts.indexOf('pages');
      const depth = pathParts.length - pagesIndex - 1;
      
      // 添加适当的 ../
      for (let i = 0; i < depth - 1; i++) {
        relativeUrl += '../';
      }
      
      // 添加目标路径
      relativeUrl += url.replace('/pages/', '');
    } else {
      // 从根目录直接访问
      relativeUrl = url.replace('/pages/', 'pages/');
    }
    
    window.location.href = relativeUrl;
  } else {
    window.location.href = url;
  }
}

const redirectTo = (url) => {
  window.location.replace(url)
}

const switchTab = (url) => {
  window.location.href = url
}

const reLaunch = (url) => {
  window.location.replace(url)
}

const navigateBack = (delta = 1) => {
  window.history.go(-delta)
}

const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('Storage set error:', e)
    return false
  }
}

const getStorage = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : defaultValue
  } catch (e) {
    console.error('Storage get error:', e)
    return defaultValue
  }
}

const removeStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (e) {
    console.error('Storage remove error:', e)
    return false
  }
}

const clearStorage = () => {
  try {
    localStorage.clear()
    return true
  } catch (e) {
    console.error('Storage clear error:', e)
    return false
  }
}

const request = (options) => {
  return new Promise((resolve, reject) => {
    const { url, method = 'GET', data, header = {} } = options
    
    fetch(url, {
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
      } else {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      }
    })
    .then(data => resolve(data))
    .catch(err => reject(err))
  })
}

const getSystemInfo = () => {
  return new Promise((resolve) => {
    resolve({
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      language: navigator.language
    })
  })
}

const getUserInfo = () => {
  return new Promise((resolve, reject) => {
    const userInfo = getStorage('userInfo')
    if (userInfo) {
      resolve(userInfo)
    } else {
      reject(new Error('User not logged in'))
    }
  })
}

const scanCode = () => {
  return new Promise((resolve, reject) => {
    reject(new Error('Scan code not supported in web environment'))
  })
}

const saveImageToPhotosAlbum = (filePath) => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('a')
    link.href = filePath
    link.download = 'image_' + Date.now() + '.png'
    link.click()
    resolve({ errMsg: 'saveImageToPhotosAlbum:ok' })
  })
}

const previewImage = (urls, current = '') => {
  const currentUrl = current || urls[0]
  const modal = document.createElement('div')
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
  `
  
  const img = document.createElement('img')
  img.src = currentUrl
  img.style.cssText = `
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
  `
  
  modal.onclick = () => {
    document.body.removeChild(modal)
  }
  
  modal.appendChild(img)
  document.body.appendChild(modal)
}

const makePhoneCall = (phoneNumber) => {
  window.location.href = `tel:${phoneNumber}`
}

const copyToClipboard = (data) => {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(String(data))
        .then(() => resolve({ errMsg: 'setClipboardData:ok' }))
        .catch(err => reject(err))
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = String(data)
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand('copy')
        resolve({ errMsg: 'setClipboardData:ok' })
      } catch (err) {
        reject(err)
      }
      document.body.removeChild(textarea)
    }
  })
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatTime,
    formatDate,
    formatNumber,
    debounce,
    throttle,
    showToast,
    showLoading,
    hideLoading,
    showModal,
    navigateTo,
    redirectTo,
    switchTab,
    reLaunch,
    navigateBack,
    setStorage,
    getStorage,
    removeStorage,
    clearStorage,
    request,
    getSystemInfo,
    getUserInfo,
    scanCode,
    saveImageToPhotosAlbum,
    previewImage,
    makePhoneCall,
    copyToClipboard
  }
}
