const { createApp } = Vue;

createApp({
  data() {
    return {
      // 当前选中的分类
      currentCategory: 'school',

      // 分类标签
      categories: [
        { id: 'school', name: '学校荣誉', icon: '🏫' },
        { id: 'teacher', name: '教师荣誉', icon: '👨‍🏫' },
        { id: 'student', name: '学生荣誉', icon: '👨‍🎓' }
      ],

      // 学校荣誉数据
      schoolHonors: [
        {
          id: 1,
          title: '广东省文明校园',
          year: '2026',
          level: '省级'
        },
        {
          id: 2,
          title: '国家级示范性普通高中',
          year: '2025',
          level: '国家级'
        },
        {
          id: 3,
          title: '广东省一级学校',
          year: '2024',
          level: '省级'
        },
        {
          id: 4,
          title: '广东省普通高中教学水平优秀学校',
          year: '2023',
          level: '省级'
        }
      ],

      // 教师荣誉数据
      teacherHonors: [
        {
          id: 1,
          name: '张三',
          avatar: '👨‍🏫',
          title: '特级教师',
          award: '广东省特级教师',
          year: '2025'
        },
        {
          id: 2,
          name: '李四',
          avatar: '👩‍🏫',
          title: '优秀教师',
          award: '广东省优秀教师',
          year: '2024'
        },
        {
          id: 3,
          name: '王五',
          avatar: '👨‍🏫',
          title: '学科带头人',
          award: '韶关市学科带头人',
          year: '2023'
        }
      ],

      // 学生荣誉数据
      studentHonors: [
        {
          id: 1,
          name: '赵六',
          avatar: '👨‍🎓',
          tag: '数学竞赛',
          award: '全国数学奥林匹克竞赛一等奖',
          year: '2025'
        },
        {
          id: 2,
          name: '孙七',
          avatar: '👩‍🎓',
          tag: '科技创新',
          award: '广东省科技创新大赛一等奖',
          year: '2024'
        },
        {
          id: 3,
          name: '周八',
          avatar: '👨‍🎓',
          tag: '作文大赛',
          award: '广东省作文大赛一等奖',
          year: '2023'
        }
      ],

      // 统计数据
      stats: {
        school: 4,
        teacher: 3,
        student: 3
      }
    };
  },

  mounted() {
    // 页面加载
    console.log('荣誉公示页面加载完成');
  },

  methods: {
    // 切换分类
    onCategoryTap(id) {
      this.currentCategory = id;
    },

    // 查看荣誉详情
    onHonorTap(id) {
      alert('查看荣誉详情');
    }
  }
}).mount('.container');
