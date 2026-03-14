const supabaseAPI = require('../../../utils/supabaseAPI')

Page({
  data: {
    books: [],
    filteredBooks: [],
    categories: ['全部', '文学', '科技', '历史', '艺术', '教育', '其他'],
    searchKeyword: '',
    selectedCategory: '全部',
    statusFilter: 'all', // all, available
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    // 搜索相关
    showSearchHistory: false,
    searchHistory: [],
    hotSearches: ['数学', '英语', '物理', '化学', '语文', '历史', '地理', '生物'],
    isSearching: false
  },

  onLoad() {
    this.loadBooks()
    this.loadSearchHistory()
  },

  // 加载搜索历史
  loadSearchHistory() {
    const history = wx.getStorageSync('librarySearchHistory') || []
    this.setData({ searchHistory: history.slice(0, 10) }) // 最多显示10条
  },

  // 保存搜索历史
  saveSearchHistory(keyword) {
    if (!keyword.trim()) return
    
    let history = wx.getStorageSync('librarySearchHistory') || []
    // 去重并放到最前面
    history = history.filter(item => item !== keyword)
    history.unshift(keyword)
    // 最多保存20条
    history = history.slice(0, 20)
    
    wx.setStorageSync('librarySearchHistory', history)
    this.setData({ searchHistory: history.slice(0, 10) })
  },

  // 清除搜索历史
  clearSearchHistory() {
    wx.removeStorageSync('librarySearchHistory')
    this.setData({ searchHistory: [] })
  },

  // 搜索输入聚焦
  onSearchFocus() {
    this.setData({ showSearchHistory: true })
  },

  // 搜索输入失焦
  onSearchBlur() {
    // 延迟隐藏，让点击事件先执行
    setTimeout(() => {
      this.setData({ showSearchHistory: false })
    }, 200)
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  // 执行搜索
  async doSearch() {
    const keyword = this.data.searchKeyword.trim()
    if (!keyword) {
      this.setData({ 
        isSearching: false,
        showSearchHistory: false 
      })
      this.filterBooks()
      return
    }

    this.saveSearchHistory(keyword)
    this.setData({ 
      isSearching: true,
      showSearchHistory: false,
      loading: true 
    })

    try {
      // 使用Supabase搜索
      const results = await supabaseAPI.searchBooks(keyword)
      this.setData({
        filteredBooks: results,
        isSearching: false,
        loading: false
      })
    } catch (err) {
      console.error('搜索失败:', err)
      wx.showToast({ title: '搜索失败', icon: 'none' })
      this.setData({ 
        isSearching: false,
        loading: false 
      })
    }
  },

  // 点击搜索历史
  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ searchKeyword: keyword })
    this.doSearch()
  },

  // 点击热门搜索
  onHotSearchTap(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ searchKeyword: keyword })
    this.doSearch()
  },

  // 清除搜索
  clearSearch() {
    this.setData({ 
      searchKeyword: '',
      showSearchHistory: false
    })
    this.filterBooks()
  },

  async loadBooks() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    
    try {
      console.log('开始加载图书，页码:', this.data.page)
      const { data, error } = await supabaseAPI.getBooks({
        limit: this.data.pageSize,
        offset: (this.data.page - 1) * this.data.pageSize
      })
      
      console.log('加载图书结果:', { data, error })
      
      if (error) {
        console.error('加载图书错误:', error)
        throw new Error('加载图书失败: ' + (error.message || JSON.stringify(error)))
      }
      
      const books = data || []
      console.log('获取到的图书数量:', books.length)
      const hasMore = books.length === this.data.pageSize
      
      this.setData({
        books: this.data.page === 1 ? books : [...this.data.books, ...books],
        hasMore,
        loading: false
      })
      
      this.filterBooks()
    } catch (err) {
      console.error('加载图书失败:', err)
      wx.showToast({
        title: err.message || '加载图书失败',
        icon: 'none',
        duration: 3000
      })
      this.setData({ loading: false })
    }
  },

  filterBooks() {
    // 如果正在搜索，不执行本地过滤
    if (this.data.searchKeyword.trim()) return

    let filtered = [...this.data.books]
    
    // 分类过滤
    if (this.data.selectedCategory !== '全部') {
      filtered = filtered.filter(book => 
        book.category === this.data.selectedCategory
      )
    }
    
    // 状态过滤
    if (this.data.statusFilter === 'available') {
      filtered = filtered.filter(book => 
        book.available > 0
      )
    }
    
    this.setData({
      filteredBooks: filtered
    })
  },

  onCategoryChange(e) {
    const index = e.detail.value
    this.setData({
      selectedCategory: this.data.categories[index]
    })
    this.filterBooks()
  },

  onStatusChange(e) {
    const status = e.currentTarget.dataset.status
    this.setData({
      statusFilter: status
    })
    this.filterBooks()
  },

  onBookTap(e) {
    const { book } = e.currentTarget.dataset
    wx.showModal({
      title: book.title,
      content: `作者：${book.author || '未知'}\n出版社：${book.publisher || '未知'}\nISBN：${book.isbn || '未知'}\n分类：${book.category || '未分类'}\n在馆数量：${book.available}/${book.copies}`,
      showCancel: false,
      confirmText: '知道了'
    })
  },

  onBack() {
    wx.navigateBack()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading && !this.data.searchKeyword) {
      this.setData({
        page: this.data.page + 1
      })
      this.loadBooks()
    }
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      books: [],
      searchKeyword: ''
    })
    this.loadBooks().then(() => {
      wx.stopPullDownRefresh()
    })
  }
})
