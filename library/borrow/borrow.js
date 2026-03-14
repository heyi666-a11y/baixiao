const { libraryAPI } = require('../../../utils/supabase')

Page({
  data: {
    form: {
      studentId: '',
      studentName: '',
      bookName: '',
      isbn: ''
    },
    showResult: false,
    borrowResult: {
      success: false,
      message: '',
      bookInfo: null
    },
    loading: false
  },

  onLoad() {
    // 页面加载
  },

  onInputChange(e) {
    const { field } = e.currentTarget.dataset
    const { value } = e.detail
    this.setData({
      [`form.${field}`]: value
    })
  },

  async onSubmit() {
    const { studentId, studentName, bookName } = this.data.form
    
    // 验证必填字段
    if (!studentId.trim()) {
      wx.showToast({
        title: '请输入学号',
        icon: 'none'
      })
      return
    }
    
    if (!studentName.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none'
      })
      return
    }
    
    if (!bookName.trim()) {
      wx.showToast({
        title: '请输入书名',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    try {
      // 1. 查找图书
      const { data: books, error: bookError } = await libraryAPI.getBooks({
        select: '*'
      })
      
      if (bookError) {
        throw new Error('查询图书失败')
      }

      // 根据书名或ISBN查找图书
      const book = books.find(b => 
        b.title === bookName || 
        b.isbn === this.data.form.isbn
      )

      if (!book) {
        this.setData({
          showResult: true,
          borrowResult: {
            success: false,
            message: '未找到该图书，请检查书名或ISBN是否正确',
            bookInfo: null
          },
          loading: false
        })
        return
      }

      // 2. 检查图书是否可借
      if (book.available_quantity <= 0) {
        this.setData({
          showResult: true,
          borrowResult: {
            success: false,
            message: '该图书已全部借出，暂无可借副本',
            bookInfo: book
          },
          loading: false
        })
        return
      }

      // 3. 查找或创建读者
      let { data: readers } = await libraryAPI.getReaders({
        eq: { column: 'student_id', value: studentId }
      })

      let readerId
      if (!readers || readers.length === 0) {
        // 创建新读者
        const { data: newReader, error: readerError } = await libraryAPI.addReader({
          student_id: studentId,
          name: studentName,
          class_name: '',
          max_books: 5,
          current_books: 0
        })
        if (readerError) {
          throw new Error('创建读者信息失败')
        }
        readerId = newReader[0].id
      } else {
        readerId = readers[0].id
      }

      // 4. 创建借阅记录
      const borrowDate = new Date()
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 30) // 30天借阅期

      const { data: record, error: recordError } = await libraryAPI.addBorrowRecord({
        reader_id: readerId,
        book_id: book.id,
        borrow_date: borrowDate.toISOString().split('T')[0],
        due_date: dueDate.toISOString().split('T')[0],
        status: 'borrowed'
      })

      if (recordError) {
        throw new Error('创建借阅记录失败')
      }

      // 5. 更新图书可借数量
      await libraryAPI.updateBook(book.id, {
        available_quantity: book.available_quantity - 1
      })

      // 6. 更新读者当前借阅数
      await libraryAPI.updateReader(readerId, {
        current_books: (readers[0]?.current_books || 0) + 1
      })

      // 显示成功结果
      this.setData({
        showResult: true,
        borrowResult: {
          success: true,
          message: '借书成功！',
          bookInfo: {
            ...book,
            borrowDate: borrowDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0]
          }
        },
        loading: false
      })

    } catch (err) {
      console.error('借书失败:', err)
      this.setData({
        showResult: true,
        borrowResult: {
          success: false,
          message: err.message || '借书失败，请稍后重试',
          bookInfo: null
        },
        loading: false
      })
    }
  },

  onBack() {
    if (this.data.showResult) {
      this.setData({
        showResult: false,
        borrowResult: {
          success: false,
          message: '',
          bookInfo: null
        }
      })
    } else {
      wx.navigateBack()
    }
  },

  onContinue() {
    this.setData({
      form: {
        studentId: '',
        studentName: '',
        bookName: '',
        isbn: ''
      },
      showResult: false,
      borrowResult: {
        success: false,
        message: '',
        bookInfo: null
      }
    })
  }
})
