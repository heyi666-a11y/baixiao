const supabaseAPI = require('../../../utils/supabaseAPI.js');

Page({
  data: {
    // 学校ID（广东北江中学）
    schoolId: '550e8400-e29b-41d4-a716-446655440000',
    // 编辑模式
    isEdit: false,
    // 新闻ID（编辑时使用）
    newsId: '',
    // 表单数据
    form: {
      title: '',
      content: '',
      summary: '',
      author: '',
      category: 'general',
      isTop: false,
      isPublished: true
    },
    // 分类选项
    categories: [
      { id: 'general', name: '综合' },
      { id: 'notice', name: '通知' },
      { id: 'activity', name: '活动' },
      { id: 'honor', name: '荣誉' }
    ],
    // 加载状态
    loading: false,
    // 提交中
    submitting: false
  },

  onLoad(options) {
    // 检查是否是编辑模式
    if (options.mode === 'edit' && options.id) {
      this.setData({
        isEdit: true,
        newsId: options.id
      })
      this.loadNewsDetail(options.id)
    }
  },

  // 加载新闻详情
  async loadNewsDetail(id) {
    this.setData({ loading: true })
    
    try {
      const result = await supabaseAPI.getNewsById(id)
      console.log('加载新闻详情:', result)
      
      if (result) {
        this.setData({
          form: {
            title: result.title,
            content: result.content,
            summary: result.summary || '',
            author: result.author || '',
            category: result.category || 'general',
            isTop: result.is_top || false,
            isPublished: result.is_published !== false
          }
        })
      } else {
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('加载新闻详情失败:', err)
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 输入标题
  onTitleInput(e) {
    this.setData({
      'form.title': e.detail.value
    })
  },

  // 输入作者
  onAuthorInput(e) {
    this.setData({
      'form.author': e.detail.value
    })
  },

  // 输入摘要
  onSummaryInput(e) {
    this.setData({
      'form.summary': e.detail.value
    })
  },

  // 输入内容
  onContentInput(e) {
    this.setData({
      'form.content': e.detail.value
    })
  },

  // 选择分类
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      'form.category': category
    })
  },

  // 切换置顶
  onTopChange(e) {
    this.setData({
      'form.isTop': e.detail.value
    })
  },

  // 切换发布状态
  onPublishChange(e) {
    this.setData({
      'form.isPublished': e.detail.value
    })
  },

  // 验证表单
  validateForm() {
    const { form } = this.data
    
    if (!form.title.trim()) {
      wx.showToast({
        title: '请输入标题',
        icon: 'none'
      })
      return false
    }
    
    if (!form.content.trim()) {
      wx.showToast({
        title: '请输入内容',
        icon: 'none'
      })
      return false
    }
    
    if (!form.author.trim()) {
      wx.showToast({
        title: '请输入作者',
        icon: 'none'
      })
      return false
    }
    
    return true
  },

  // 提交表单
  async onSubmit() {
    if (!this.validateForm()) return
    
    this.setData({ submitting: true })
    
    try {
      const { form, isEdit, newsId, schoolId } = this.data
      
      // 构建提交数据
      const submitData = {
        title: form.title.trim(),
        content: form.content.trim(),
        summary: form.summary.trim() || form.content.trim().substring(0, 100) + '...',
        author: form.author.trim(),
        category: form.category,
        is_top: form.isTop,
        is_published: form.isPublished,
        school_id: schoolId
      }
      
      // 如果是发布状态，设置发布时间
      if (form.isPublished) {
        submitData.published_at = new Date().toISOString()
      }
      
      let result
      
      if (isEdit) {
        // 更新新闻
        result = await supabaseAPI.updateNews(newsId, submitData)
      } else {
        // 创建新闻
        result = await supabaseAPI.createNews(submitData)
      }
      
      if (!result.error) {
        wx.showToast({
          title: isEdit ? '更新成功' : '发布成功',
          icon: 'success'
        })
        
        // 延迟返回
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: isEdit ? '更新失败' : '发布失败',
          icon: 'none'
        })
      }
    } catch (err) {
      console.error('提交失败:', err)
      wx.showToast({
        title: '提交失败',
        icon: 'none'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 返回上一页
  goBack() {
    wx.navigateBack()
  }
})
