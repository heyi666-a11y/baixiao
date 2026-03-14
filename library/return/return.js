const { libraryAPI } = require('../../../utils/supabase')

Page({
  data: {
    form: {
      studentId: '',
      bookName: '',
      isbn: ''
    },
    showResult: false,
    returnResult: {
      success: false,
      message: '',
      bookInfo: null,
      overdueDays: 0,
      overdueFee: 0
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
    const { studentId, bookName } = this.data.form
    
    // 验证必填字段
    if (!studentId.trim()) {
      wx.showToast({
        title: '请输入学号',
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
      // 1. 查找读者
      const { data: readers, error: readerError } = await libraryAPI.getReaders({
        eq: { column: 'student_id', value: studentId }
      })

      if (readerError || !readers || readers.length === 0) {
        this.setData({
          showResult: true,
          returnResult: {
            success: false,
            message: '未找到该学生信息，请检查学号是否正确',
            bookInfo: null,
            overdueDays: 0,
            overdueFee: 0
          },
          loading: false
        })
        return
      }

      const reader = readers[0]

      // 2. 查找图书
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
          returnResult: {
            success: false,
            message: '未找到该图书，请检查书名或ISBN是否正确',
            bookInfo: null,
            overdueDays: 0,
            overdueFee: 0
          },
          loading: false
        })
        return
      }

      // 3. 查找借阅记录
      const { data: records, error: recordError } = await libraryAPI.getBorrowRecords({
        eq: { column: 'reader_id', value: reader.id }
      })

      if (recordError) {
        throw new Error('查询借阅记录失败')
      }

      // 查找该图书的未还借阅记录
      const borrowRecord = records.find(r => 
        r.book_id === book.id && 
        r.status === 'borrowed'
      )

      if (!borrowRecord) {
        this.setData({
          showResult: true,
          returnResult: {
            success: false,
            message: '未找到该图书的借阅记录，请检查信息是否正确',
            bookInfo: book,
            overdueDays: 0,
            overdueFee: 0
          },
          loading: false
        })
        return
      }

      // 4. 计算逾期天数和费用
      const today = new Date()
      const dueDate = new Date(borrowRecord.due_date)
      let overdueDays = 0
      let overdueFee = 0

      if (today > dueDate) {
        const diffTime = today.getTime() - dueDate.getTime()
        overdueDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        overdueFee = overdueDays * 0.5 // 每天0.5元滞纳金
      }

      // 5. 更新借阅记录
      const { error: updateError } = await libraryAPI.updateBorrowRecord(borrowRecord.id, {
        return_date: today.toISOString().split('T')[0],
        status: 'returned',
        overdue_days: overdueDays,
        overdue_fee: overdueFee
      })

      if (updateError) {
        throw new Error('更新借阅记录失败')
      }

      // 6. 更新图书可借数量
      await libraryAPI.updateBook(book.id, {
        available_quantity: book.available_quantity + 1
      })

      // 7. 更新读者当前借阅数
      await libraryAPI.updateReader(reader.id, {
        current_books: Math.max(0, (reader.current_books || 0) - 1)
      })

      // 显示成功结果
      this.setData({
        showResult: true,
        returnResult: {
          success: true,
          message: overdueDays > 0 
            ? `还书成功！逾期${overdueDays}天，滞纳金${overdueFee.toFixed(2)}元` 
            : '还书成功！',
          bookInfo: {
            ...book,
            borrowDate: borrowRecord.borrow_date,
            dueDate: borrowRecord.due_date,
            returnDate: today.toISOString().split('T')[0]
          },
          overdueDays,
          overdueFee
        },
        loading: false
      })

    } catch (err) {
      console.error('还书失败:', err)
      this.setData({
        showResult: true,
        returnResult: {
          success: false,
          message: err.message || '还书失败，请稍后重试',
          bookInfo: null,
          overdueDays: 0,
          overdueFee: 0
        },
        loading: false
      })
    }
  },

  onBack() {
    if (this.data.showResult) {
      this.setData({
        showResult: false,
        returnResult: {
          success: false,
          message: '',
          bookInfo: null,
          overdueDays: 0,
          overdueFee: 0
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
        bookName: '',
        isbn: ''
      },
      showResult: false,
      returnResult: {
        success: false,
        message: '',
        bookInfo: null,
        overdueDays: 0,
        overdueFee: 0
      }
    })
  }
})
