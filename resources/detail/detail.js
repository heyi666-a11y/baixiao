const supabaseAPI = require('../../../utils/supabaseAPI')

Page({
  data: {
    resourceId: null,
    resource: null,
    loading: true,
    downloading: false,
    downloadProgress: 0,
    typeIcons: {
      'document': '📄',
      'video': '🎬',
      'audio': '🎵',
      'image': '🖼️'
    },
    typeNames: {
      'document': '文档',
      'video': '视频',
      'audio': '音频',
      'image': '图片'
    }
  },

  onLoad(options) {
    const { id } = options
    if (!id) {
      wx.showToast({
        title: '资源ID无效',
        icon: 'none'
      })
      wx.navigateBack()
      return
    }

    this.setData({ resourceId: id })
    this.loadResourceDetail()
  },

  async loadResourceDetail() {
    this.setData({ loading: true })

    try {
      const resource = await supabaseAPI.getResourceById(this.data.resourceId)

      if (!resource) {
        throw new Error('资源不存在')
      }

      resource.created_at = this.formatDate(resource.created_at)
      resource.file_size = this.formatFileSize(resource.file_size)
      resource.typeIcon = this.data.typeIcons[resource.type] || '📎'
      resource.typeName = this.data.typeNames[resource.type] || '其他'

      this.setData({
        resource,
        loading: false
      })
    } catch (err) {
      console.error('加载资源详情失败:', err)
      wx.showToast({
        title: err.message || '加载失败',
        icon: 'none',
        duration: 3000
      })
      this.setData({ loading: false })
    }
  },

  async onDownload() {
    const { resource } = this.data

    if (!resource) {
      wx.showToast({
        title: '资源信息无效',
        icon: 'none'
      })
      return
    }

    if (!resource.file_url) {
      wx.showToast({
        title: '文件链接不可用',
        icon: 'none'
      })
      return
    }

    this.setData({ downloading: true, downloadProgress: 0 })

    const downloadTask = wx.downloadFile({
      url: resource.file_url,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveFile({
            tempFilePath: res.tempFilePath,
            success: () => {
              this.incrementDownloadCount()
              wx.showToast({
                title: '下载成功',
                icon: 'success'
              })
            },
            fail: () => {
              wx.showToast({
                title: '保存文件失败',
                icon: 'none'
              })
            }
          })
        } else {
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          })
        }
      },
      fail: () => {
        wx.showToast({
          title: '下载失败',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ downloading: false, downloadProgress: 0 })
      }
    })

    downloadTask.onProgressUpdate((res) => {
      this.setData({ downloadProgress: res.progress })
    })
  },

  async incrementDownloadCount() {
    try {
      const { resource } = this.data
      const newCount = (resource.download_count || 0) + 1

      await supabaseAPI.patch('resources', resource.id, {
        download_count: newCount
      })

      this.setData({
        'resource.download_count': newCount
      })
    } catch (err) {
      console.error('增加下载次数失败:', err)
    }
  },

  goBack() {
    wx.navigateBack()
  },

  formatDate(dateString) {
    if (!dateString) return '未知'
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  },

  formatFileSize(bytes) {
    if (!bytes) return '未知'
    if (typeof bytes === 'string') return bytes
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  onShareAppMessage() {
    const { resource } = this.data
    return {
      title: resource ? resource.title : '资源共享',
      path: `/pages/resources/detail/detail?id=${this.data.resourceId}`
    }
  }
})
