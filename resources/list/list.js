const supabaseAPI = require('../../../utils/supabaseAPI')

Page({
  data: {
    resources: [],
    filteredResources: [],
    resourceTypes: [
      { name: '全部', value: 'all', icon: '📁' },
      { name: '文档', value: 'document', icon: '📄' },
      { name: '视频', value: 'video', icon: '🎬' },
      { name: '音频', value: 'audio', icon: '🎵' },
      { name: '图片', value: 'image', icon: '🖼️' }
    ],
    selectedType: 'all',
    searchKeyword: '',
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  onLoad() {
    this.loadResources()
  },

  onShow() {
    this.setData({
      page: 1,
      resources: []
    })
    this.loadResources()
  },

  async loadResources() {
    if (this.data.loading) return

    this.setData({ loading: true })

    try {
      const options = {
        limit: this.data.pageSize,
        offset: (this.data.page - 1) * this.data.pageSize,
        order: { column: 'created_at', ascending: false }
      }

      if (this.data.selectedType !== 'all') {
        options.eq = { column: 'type', value: this.data.selectedType }
      }

      const { data, error } = await supabaseAPI.getResources(options)

      if (error) {
        console.error('加载资源列表错误:', error)
        throw new Error('加载资源失败')
      }

      const resources = data || []
      const formattedResources = resources.map(item => ({
        ...item,
        created_at: this.formatDate(item.created_at),
        file_size: this.formatFileSize(item.file_size),
        typeIcon: this.getTypeIcon(item.type)
      }))

      const hasMore = resources.length === this.data.pageSize

      this.setData({
        resources: this.data.page === 1 ? formattedResources : [...this.data.resources, ...formattedResources],
        filteredResources: this.data.page === 1 ? formattedResources : [...this.data.resources, ...formattedResources],
        hasMore,
        loading: false
      })
    } catch (err) {
      console.error('加载资源失败:', err)
      wx.showToast({
        title: err.message || '加载资源失败',
        icon: 'none',
        duration: 3000
      })
      this.setData({ loading: false })
    }
  },

  getTypeIcon(type) {
    const iconMap = {
      'document': '📄',
      'video': '🎬',
      'audio': '🎵',
      'image': '🖼️'
    }
    return iconMap[type] || '📎'
  },

  onTypeChange(e) {
    const type = e.currentTarget.dataset.type
    this.setData({
      selectedType: type,
      page: 1,
      resources: []
    })
    this.loadResources()
  },

  onSearchInput(e) {
    const keyword = e.detail.value.toLowerCase()
    this.setData({ searchKeyword: keyword })
    this.filterResources()
  },

  onSearchConfirm() {
    this.setData({
      page: 1,
      resources: []
    })
    this.loadResources()
  },

  clearSearch() {
    this.setData({
      searchKeyword: '',
      page: 1,
      resources: []
    })
    this.loadResources()
  },

  filterResources() {
    const keyword = this.data.searchKeyword.toLowerCase()
    let filtered = this.data.resources

    if (keyword) {
      filtered = filtered.filter(resource =>
        (resource.title && resource.title.toLowerCase().includes(keyword)) ||
        (resource.description && resource.description.toLowerCase().includes(keyword)) ||
        (resource.uploader_name && resource.uploader_name.toLowerCase().includes(keyword))
      )
    }

    this.setData({ filteredResources: filtered })
  },

  onResourceTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/resources/detail/detail?id=${id}`
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadResources()
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      resources: []
    })
    this.loadResources().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  formatDate(dateString) {
    if (!dateString) return '未知'
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date

    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return minutes < 1 ? '刚刚' : `${minutes}分钟前`
    }
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    }
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`
    }

    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  },

  formatFileSize(bytes) {
    if (!bytes) return '未知'
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
})
