const { mockTeachers, mockStudents } = require('../../../utils/mockData')
const { canteenAPI } = require('../../../utils/canteenAPI')

Page({
  data: {
    adminUser: null,
    stats: {
      teacherCount: 0,
      studentCount: 0,
      orderCount: 0,
      menuCount: 0
    },
    modules: [
      {
        id: 'teachers',
        name: '教师管理',
        icon: '👨‍🏫',
        description: '管理教师信息、课程安排',
        color: '#667eea',
        path: '/pages/school-admin/teachers/teachers'
      },
      {
        id: 'teacher-attendance',
        name: '教师考勤',
        icon: '📅',
        description: '查看和管理教师考勤',
        color: '#fa709a',
        path: '/pages/school-admin/teacher-attendance/teacher-attendance'
      },
      {
        id: 'teacher-schedule',
        name: '课表管理',
        icon: '📋',
        description: '管理教师课程安排',
        color: '#30cfd0',
        path: '/pages/school-admin/teacher-schedule/teacher-schedule'
      },
      {
        id: 'students',
        name: '学生管理',
        icon: '👨‍🎓',
        description: '管理学生信息、成绩记录',
        color: '#f093fb',
        path: '/pages/school-admin/students/students'
      },
      {
        id: 'student-grades',
        name: '成绩管理',
        icon: '📝',
        description: '录入和查看学生成绩',
        color: '#a8edea',
        path: '/pages/school-admin/student-grades/student-grades'
      },
      {
        id: 'student-attendance',
        name: '学生考勤',
        icon: '✅',
        description: '管理学生每日考勤',
        color: '#ffecd2',
        path: '/pages/school-admin/student-attendance/student-attendance'
      },
      {
        id: 'student-rewards',
        name: '奖惩管理',
        icon: '🏆',
        description: '记录学生奖惩情况',
        color: '#fcb69f',
        path: '/pages/school-admin/student-rewards/student-rewards'
      },
      {
        id: 'leave-approval',
        name: '请假审批',
        icon: '📄',
        description: '审批学生请假申请',
        color: '#ff9a9e',
        path: '/pages/school-admin/leave-approval/leave-approval'
      },
      {
        id: 'canteen',
        name: '饭堂管理',
        icon: '🍽️',
        description: '菜单管理、订单查看',
        color: '#4facfe',
        path: '/pages/school-admin/canteen/canteen'
      },
      {
        id: 'canteen-stats',
        name: '营收统计',
        icon: '💰',
        description: '查看饭堂营收数据',
        color: '#43e97b',
        path: '/pages/school-admin/canteen-stats/canteen-stats'
      },
      {
        id: 'canteen-analysis',
        name: '菜品分析',
        icon: '📊',
        description: '分析菜品销售情况',
        color: '#38f9d7',
        path: '/pages/school-admin/canteen-analysis/canteen-analysis'
      },
      {
        id: 'school-news',
        name: '新闻管理',
        icon: '📰',
        description: '发布和管理学校新闻',
        color: '#ff6b6b',
        path: '/pages/school-admin/school-news/school-news'
      }
    ]
  },

  onLoad() {
    // 检查登录状态
    const adminToken = wx.getStorageSync('schoolAdminToken')
    if (!adminToken) {
      wx.redirectTo({
        url: '/pages/school-admin/login/login'
      })
      return
    }

    const adminUser = wx.getStorageSync('schoolAdminUser')
    this.setData({ adminUser })
    
    this.loadStats()
  },

  onShow() {
    this.loadStats()
  },

  // 加载统计数据
  loadStats() {
    // 获取教师数量
    const teacherCount = mockTeachers.length
    
    // 获取学生数量
    const studentCount = mockStudents.length
    
    // 获取订单数量（从本地存储）
    const orders = wx.getStorageSync('canteenOrders') || []
    const orderCount = orders.length
    
    // 获取菜单数量（从本地存储）
    const menuItems = wx.getStorageSync('canteenMenu') || []
    const menuCount = menuItems.length || 12 // 默认12个菜品

    this.setData({
      'stats.teacherCount': teacherCount,
      'stats.studentCount': studentCount,
      'stats.orderCount': orderCount,
      'stats.menuCount': menuCount
    })
  },

  // 跳转到模块
  navigateToModule(e) {
    const { path } = e.currentTarget.dataset
    wx.navigateTo({ url: path })
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('schoolAdminToken')
          wx.removeStorageSync('schoolAdminUser')
          wx.redirectTo({
            url: '/pages/school-admin/login/login'
          })
        }
      }
    })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadStats()
    wx.stopPullDownRefresh()
  }
})
