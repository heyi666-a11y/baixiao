const { libraryAPI, supabase } = require('../../../../utils/supabase')

const statusMap = {
  'all': { label: '全部状态', value: '' },
  'available': { label: '在馆', value: 'available' },
  'borrowed': { label: '借出', value: 'borrowed' },
  'lost': { label: '遗失', value: 'lost' },
  'removed': { label: '下架', value: 'removed' }
}

const statusTextMap = {
  'available': '在馆',
  'borrowed': '借出',
  'lost': '遗失',
  'removed': '下架'
}

Page({
  data: {
    isSidebarOpen: false,
    books: [],
    searchKeyword: '',
    statusOptions: Object.values(statusMap),
    statusIndex: 0,
    currentStatus: '',
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    
    // 弹窗相关
    showBookModal: false,
    showBatchModal: false,
    isEditing: false,
    isSaving: false,
    isSearchingISBN: false,
    
    // 表单数据
    bookForm: {
      id: '',
      isbn: '',
      title: '',
      author: '',
      category: '',
      publisher: '',
      total_quantity: 1,
      status: 'available'
    },
    categories: ['文学', '科技', '历史', '艺术', '教育', '哲学', '经济', '其他'],
    categoryIndex: 0,
    bookStatusOptions: [
      { label: '在馆', value: 'available' },
      { label: '借出', value: 'borrowed' },
      { label: '遗失', value: 'lost' },
      { label: '下架', value: 'removed' }
    ],
    bookStatusIndex: 0,
    
    // 批量导入
    batchISBNs: '',
    batchBooks: [],
    isSearchingBatch: false,
    isBatchAdding: false
  },

  onLoad() {
    this.checkLogin()
    this.loadBooks()
  },

  onShow() {
    this.loadBooks()
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
    if (page === 'books') {
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

  // 搜索和筛选
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  searchBooks() {
    this.setData({
      page: 1,
      books: [],
      hasMore: true
    })
    this.loadBooks()
  },

  onStatusChange(e) {
    const index = parseInt(e.detail.value)
    const status = this.data.statusOptions[index].value
    this.setData({
      statusIndex: index,
      currentStatus: status,
      page: 1,
      books: [],
      hasMore: true
    })
    this.loadBooks()
  },

  // 加载图书列表
  async loadBooks(isLoadMore = false) {
    if (this.data.isLoading || (isLoadMore && !this.data.hasMore)) return

    this.setData({
      isLoading: !isLoadMore,
      isLoadingMore: isLoadMore
    })

    try {
      const { searchKeyword, currentStatus, page, pageSize } = this.data
      
      let options = {
        select: '*',
        order: { column: 'created_at', ascending: false },
        limit: pageSize,
        offset: (page - 1) * pageSize
      }

      if (currentStatus) {
        options.eq = { column: 'status', value: currentStatus }
      }

      const { data, error } = await libraryAPI.getBooks(options)

      if (error) throw error

      let books = data || []
      
      // 客户端搜索过滤
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase()
        books = books.filter(book => 
          (book.title && book.title.toLowerCase().includes(keyword)) ||
          (book.isbn && book.isbn.includes(keyword)) ||
          (book.author && book.author.toLowerCase().includes(keyword))
        )
      }

      // 处理图书数据
      books = books.map(book => ({
        ...book,
        statusText: statusTextMap[book.status] || '未知',
        available_quantity: book.total_quantity - (book.borrowed_quantity || 0)
      }))

      this.setData({
        books: isLoadMore ? [...this.data.books, ...books] : books,
        hasMore: books.length === pageSize,
        page: isLoadMore ? page + 1 : page
      })
    } catch (err) {
      console.error('加载图书失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({
        isLoading: false,
        isLoadingMore: false
      })
    }
  },

  loadMore() {
    this.loadBooks(true)
  },

  // 添加图书弹窗
  showAddModal() {
    this.setData({
      showBookModal: true,
      isEditing: false,
      bookForm: {
        id: '',
        isbn: '',
        title: '',
        author: '',
        category: '',
        publisher: '',
        total_quantity: 1,
        status: 'available'
      },
      categoryIndex: 0,
      bookStatusIndex: 0
    })
  },

  // 编辑图书
  editBook(e) {
    const id = e.currentTarget.dataset.id
    const book = this.data.books.find(b => b.id === id)
    if (!book) return

    const categoryIndex = this.data.categories.indexOf(book.category)
    const statusIndex = this.data.bookStatusOptions.findIndex(s => s.value === book.status)

    this.setData({
      showBookModal: true,
      isEditing: true,
      bookForm: {
        id: book.id,
        isbn: book.isbn || '',
        title: book.title,
        author: book.author || '',
        category: book.category || '',
        publisher: book.publisher || '',
        total_quantity: book.total_quantity,
        status: book.status
      },
      categoryIndex: categoryIndex >= 0 ? categoryIndex : 0,
      bookStatusIndex: statusIndex >= 0 ? statusIndex : 0
    })
  },

  closeBookModal() {
    this.setData({
      showBookModal: false
    })
  },

  // 表单输入
  onBookFormInput(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      [`bookForm.${field}`]: value
    })
  },

  onCategoryChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      categoryIndex: index,
      'bookForm.category': this.data.categories[index]
    })
  },

  onBookStatusChange(e) {
    const index = parseInt(e.detail.value)
    this.setData({
      bookStatusIndex: index,
      'bookForm.status': this.data.bookStatusOptions[index].value
    })
  },

  // ISBN搜索图书信息
  async searchByISBN() {
    const { isbn } = this.data.bookForm
    if (!isbn.trim()) {
      wx.showToast({ title: '请输入ISBN', icon: 'none' })
      return
    }

    this.setData({ isSearchingISBN: true })

    try {
      // 调用豆瓣API或类似服务获取图书信息
      const bookInfo = await this.fetchBookByISBN(isbn.trim())
      
      if (bookInfo) {
        // 处理author字段，可能是数组或字符串
        let authorStr = '';
        if (bookInfo.author) {
          if (Array.isArray(bookInfo.author)) {
            authorStr = bookInfo.author.join(', ');
          } else {
            authorStr = String(bookInfo.author);
          }
        }
        
        this.setData({
          'bookForm.title': bookInfo.title || '',
          'bookForm.author': authorStr,
          'bookForm.publisher': bookInfo.publisher || '',
          'bookForm.category': bookInfo.category || ''
        })
        wx.showToast({ title: '查询成功', icon: 'success' })
      } else {
        wx.showToast({ title: '未找到图书信息', icon: 'none' })
      }
    } catch (err) {
      console.error('ISBN查询失败:', err)
      wx.showToast({ title: '查询失败', icon: 'none' })
    } finally {
      this.setData({ isSearchingISBN: false })
    }
  },

  // 使用智谱AI API查询ISBN
  async fetchBookByISBN(isbn) {
    const API_KEY = '7c5aa00d14c84e9ba6d362a4739a124f.dXkOfhNlXFeOJLVi';
    const apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    
    console.log('开始调用智谱AI API查询ISBN:', isbn);
    console.log('API URL:', apiUrl);
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: apiUrl,
        method: 'POST',
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        data: {
          model: 'glm-4',
          messages: [
            {
              role: 'system',
              content: `你是一个图书信息查询助手，请根据用户提供的ISBN号，返回该图书的详细信息。
请严格按照以下JSON格式返回，不要添加任何额外内容：
{
    "title": "图书标题",
    "author": "作者",
    "publisher": "出版社",
    "category": "分类"
}
如果无法查询到该ISBN对应的图书信息，请返回：{"error": "未找到该ISBN对应的图书信息"}`
            },
            {
              role: 'user',
              content: `请查询ISBN号为${isbn}的图书信息`
            }
          ],
          temperature: 0.1
        },
        success: (res) => {
          console.log('AI API调用成功，响应:', res);
          try {
            if (res.statusCode === 200 && res.data) {
              console.log('响应数据:', res.data);
              
              // 处理不同格式的响应
              let responseText;
              if (res.data.choices && res.data.choices.length > 0) {
                responseText = res.data.choices[0].message?.content;
              } else {
                console.log('响应格式未知:', res.data);
                resolve(null);
                return;
              }
              
              console.log('AI响应内容:', responseText);
              
              // 提取JSON部分
              const jsonMatch = responseText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                try {
                  const bookInfo = JSON.parse(jsonMatch[0]);
                  console.log('解析出的图书信息:', bookInfo);
                  
                  // 检查是否有错误
                  if (bookInfo.error) {
                    console.log('AI返回错误:', bookInfo.error);
                    resolve(null);
                    return;
                  }
                  
                  resolve(bookInfo);
                } catch (parseError) {
                  console.error('解析JSON失败:', parseError);
                  resolve(null);
                }
              } else {
                console.log('未找到JSON格式数据');
                resolve(null);
              }
            } else {
              console.log('响应状态码:', res.statusCode);
              console.log('响应数据:', res.data);
              resolve(null);
            }
          } catch (error) {
            console.error('处理响应失败:', error);
            resolve(null);
          }
        },
        fail: (err) => {
          console.error('AI API调用失败:', err);
          resolve(null);
        }
      });
    });
  },

  // 保存图书
  async saveBook() {
    const { bookForm, isEditing } = this.data

    if (!bookForm.title.trim()) {
      wx.showToast({ title: '请输入书名', icon: 'none' })
      return
    }

    this.setData({ isSaving: true })

    try {
      const bookData = {
        isbn: bookForm.isbn,
        title: bookForm.title,
        author: bookForm.author,
        category: bookForm.category,
        publisher: bookForm.publisher,
        total_quantity: parseInt(bookForm.total_quantity) || 1,
        status: bookForm.status
      }

      if (isEditing) {
        const { error } = await libraryAPI.updateBook(bookForm.id, bookData)
        if (error) throw error
        wx.showToast({ title: '更新成功', icon: 'success' })
      } else {
        const { error } = await libraryAPI.addBook(bookData)
        if (error) throw error
        wx.showToast({ title: '添加成功', icon: 'success' })
      }

      this.closeBookModal()
      this.loadBooks()
    } catch (err) {
      console.error('保存图书失败:', err)
      wx.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      this.setData({ isSaving: false })
    }
  },

  // 删除图书
  deleteBook(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这本图书吗？此操作不可恢复。',
      success: async (res) => {
        if (res.confirm) {
          try {
            const { error } = await libraryAPI.deleteBook(id)
            if (error) throw error
            
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadBooks()
          } catch (err) {
            console.error('删除图书失败:', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  // 批量导入
  showBatchModal() {
    this.setData({
      showBatchModal: true,
      batchISBNs: '',
      batchBooks: []
    })
  },

  closeBatchModal() {
    this.setData({
      showBatchModal: false
    })
  },

  onBatchInput(e) {
    this.setData({
      batchISBNs: e.detail.value
    })
  },

  // 批量搜索ISBN
  async searchBatchISBNs() {
    const { batchISBNs } = this.data
    if (!batchISBNs.trim()) {
      wx.showToast({ title: '请输入ISBN列表', icon: 'none' })
      return
    }

    this.setData({ isSearchingBatch: true })

    try {
      const isbns = batchISBNs.split('\n').map(s => s.trim()).filter(s => s)
      const batchBooks = []

      for (const isbn of isbns) {
        const bookInfo = await this.fetchBookByISBN(isbn)
        batchBooks.push({
          isbn,
          title: bookInfo ? bookInfo.title : '未找到',
          found: !!bookInfo,
          ...bookInfo
        })
      }

      this.setData({ batchBooks })
    } catch (err) {
      console.error('批量搜索失败:', err)
      wx.showToast({ title: '搜索失败', icon: 'none' })
    } finally {
      this.setData({ isSearchingBatch: false })
    }
  },

  // 批量添加图书
  async batchAddBooks() {
    const { batchBooks } = this.data
    const validBooks = batchBooks.filter(b => b.found)

    if (validBooks.length === 0) {
      wx.showToast({ title: '没有可添加的图书', icon: 'none' })
      return
    }

    this.setData({ isBatchAdding: true })

    try {
      let successCount = 0
      
      for (const book of validBooks) {
        const bookData = {
          isbn: book.isbn,
          title: book.title,
          author: book.author ? book.author.join(', ') : '',
          publisher: book.publisher || '',
          category: book.category || '其他',
          total_quantity: 1,
          status: 'available'
        }
        
        const { error } = await libraryAPI.addBook(bookData)
        if (!error) successCount++
      }

      wx.showToast({ 
        title: `成功添加${successCount}本图书`, 
        icon: 'success' 
      })
      
      this.closeBatchModal()
      this.loadBooks()
    } catch (err) {
      console.error('批量添加失败:', err)
      wx.showToast({ title: '批量添加失败', icon: 'none' })
    } finally {
      this.setData({ isBatchAdding: false })
    }
  },

  // 导出报表
  exportBooks() {
    const { books } = this.data
    if (books.length === 0) {
      wx.showToast({ title: '暂无数据可导出', icon: 'none' })
      return
    }

    // 构建CSV内容
    const headers = ['书名', 'ISBN', '作者', '分类', '出版社', '状态', '总数量', '可用数量']
    const rows = books.map(book => [
      book.title,
      book.isbn || '',
      book.author || '',
      book.category || '',
      book.publisher || '',
      book.statusText,
      book.total_quantity,
      book.available_quantity
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    
    // 复制到剪贴板
    wx.setClipboardData({
      data: csvContent,
      success: () => {
        wx.showModal({
          title: '导出成功',
          content: '图书数据已复制到剪贴板，您可以粘贴到Excel中',
          showCancel: false
        })
      }
    })
  }
})
