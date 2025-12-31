Page({
  data: {
    currentTab: 'cognitive',
    categoryTabs: [
      { id: 'cognitive', name: '认知重构' },
      { id: 'behavioral', name: '行为激活' },
      { id: 'integrated', name: '综合训练' }
    ],
    
    // 认知重构训练模块
    cognitiveModules: [
      {
        id: 'thought-record',
        title: '思维记录',
        description: '学会识别和记录消极自动思维，是认知重构的第一步',
        icon: '📝',
        duration: '15分钟',
        difficulty: '初级',
        progress: 0,
        completed: false
      },
      {
        id: 'thought-challenge',
        title: '思维质疑',
        description: '质疑消极思维的真实性和合理性，寻找更平衡的观点',
        icon: '🤔',
        duration: '20分钟',
        difficulty: '中级',
        progress: 0,
        completed: false
      },
      {
        id: 'cognitive-reframe',
        title: '认知重构',
        description: '用更积极、现实的思维替代消极的自动思维',
        icon: '🔄',
        duration: '25分钟',
        difficulty: '中级',
        progress: 0,
        completed: false
      },
      {
        id: 'behavioral-experiment',
        title: '行为实验',
        description: '通过实际行动来验证和改变消极的思维假设',
        icon: '🧪',
        duration: '30分钟',
        difficulty: '高级',
        progress: 0,
        completed: false
      }
    ],

    // 行为激活训练模块
    behavioralModules: [
      {
        id: 'activity-monitoring',
        title: '活动监测',
        description: '记录日常活动和相关的情绪、疼痛体验',
        icon: '📊',
        duration: '每日10分钟',
        difficulty: '初级',
        progress: 0,
        completed: false
      },
      {
        id: 'activity-scheduling',
        title: '活动安排',
        description: '计划有意义和愉悦的活动，逐步增加积极体验',
        icon: '📅',
        duration: '20分钟',
        difficulty: '中级',
        progress: 0,
        completed: false
      },
      {
        id: 'graded-activity',
        title: '分级活动',
        description: '从简单活动开始，逐步增加活动的复杂性和持续时间',
        icon: '📈',
        duration: '30分钟',
        difficulty: '中级',
        progress: 0,
        completed: false
      },
      {
        id: 'social-activation',
        title: '社交激活',
        description: '重新建立社交联系，通过人际互动提升情绪状态',
        icon: '👥',
        duration: '45分钟',
        difficulty: '高级',
        progress: 0,
        completed: false
      }
    ],

    // 综合训练模块
    integratedModules: [
      {
        id: 'pain-coping',
        title: '疼痛应对策略',
        description: '结合认知和行为技巧的综合疼痛管理方案',
        icon: '🛡️',
        duration: '40分钟',
        difficulty: '高级',
        progress: 0,
        completed: false
      },
      {
        id: 'relapse-prevention',
        title: '复发预防',
        description: '识别危险信号，制定预防策略，维持治疗效果',
        icon: '🚨',
        duration: '35分钟',
        difficulty: '高级',
        progress: 0,
        completed: false
      },
      {
        id: 'stress-management',
        title: '压力管理',
        description: '学习有效的压力管理技巧，降低疼痛的心理影响',
        icon: '🧘',
        duration: '30分钟',
        difficulty: '中级',
        progress: 0,
        completed: false
      }
    ],

    // 统计数据
    totalProgress: 0,
    completedCourses: 0,
    studyDays: 0,

    // 本周学习进度
    weeklyProgress: [
      { day: '周一', completed: false },
      { day: '周二', completed: true },
      { day: '周三', completed: true },
      { day: '周四', completed: false },
      { day: '周五', completed: false },
      { day: '周六', completed: false },
      { day: '周日', completed: false }
    ],

    // 推荐课程
    recommendedCourses: []
  },

  onLoad: function (options) {
    this.loadUserProgress();
    this.generateRecommendations();
    this.calculateStats();
  },

  onShow: function () {
    this.refreshData();
  },

  // 切换标签页
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    
    // 触觉反馈
    wx.vibrateShort({
      type: 'light'
    });
  },

  // 开始课程
  startCourse: function (e) {
    const courseId = e.currentTarget.dataset.course;
    const courseType = e.currentTarget.dataset.type;
    
    // 触觉反馈
    wx.vibrateShort();
    
    // 根据课程类型和ID跳转到具体的课程页面
    wx.navigateTo({
      url: `/pages/course-detail/index?id=${courseId}&type=${courseType}`
    });
  },

  // 加载用户学习进度
  loadUserProgress: function () {
    const userProgress = wx.getStorageSync('userProgress') || {};
    
    // 更新认知重构模块进度
    const cognitiveModules = this.data.cognitiveModules.map(module => {
      const progress = userProgress[module.id] || { progress: 0, completed: false };
      return {
        ...module,
        progress: progress.progress,
        completed: progress.completed
      };
    });

    // 更新行为激活模块进度
    const behavioralModules = this.data.behavioralModules.map(module => {
      const progress = userProgress[module.id] || { progress: 0, completed: false };
      return {
        ...module,
        progress: progress.progress,
        completed: progress.completed
      };
    });

    // 更新综合训练模块进度
    const integratedModules = this.data.integratedModules.map(module => {
      const progress = userProgress[module.id] || { progress: 0, completed: false };
      return {
        ...module,
        progress: progress.progress,
        completed: progress.completed
      };
    });

    this.setData({
      cognitiveModules,
      behavioralModules,
      integratedModules
    });
  },

  // 生成个性化推荐
  generateRecommendations: function () {
    const painRecords = wx.getStorageSync('painRecords') || [];
    const userProgress = wx.getStorageSync('userProgress') || {};
    const recommendations = [];

    // 基于最近的疼痛评估生成推荐
    if (painRecords.length > 0) {
      const latestRecord = painRecords[painRecords.length - 1];
      
      // 如果疼痛程度较高，推荐应对策略
      if (latestRecord.painLevel >= 6) {
        recommendations.push({
          id: 'pain-coping',
          title: '疼痛应对策略',
          reason: '基于您的高疼痛水平推荐',
          icon: '🛡️',
          type: 'integrated'
        });
      }

      // 如果情绪状态不佳，推荐认知重构
      const emotionScore = Object.values(latestRecord.emotions || {}).reduce((sum, score) => sum + score, 0);
      if (emotionScore > 20) {
        recommendations.push({
          id: 'thought-challenge',
          title: '思维质疑',
          reason: '帮助改善情绪状态',
          icon: '🤔',
          type: 'cognitive'
        });
      }
    }

    // 基于学习进度推荐下一步课程
    const completedCount = Object.values(userProgress).filter(p => p.completed).length;
    if (completedCount === 0) {
      recommendations.push({
        id: 'thought-record',
        title: '思维记录',
        reason: '建议从基础课程开始',
        icon: '📝',
        type: 'cognitive'
      });
    }

    this.setData({
      recommendedCourses: recommendations.slice(0, 3) // 最多显示3个推荐
    });
  },

  // 计算统计数据
  calculateStats: function () {
    const allModules = [
      ...this.data.cognitiveModules,
      ...this.data.behavioralModules,
      ...this.data.integratedModules
    ];

    const totalModules = allModules.length;
    const completedModules = allModules.filter(module => module.completed).length;
    const totalProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    // 计算学习天数
    const studyHistory = wx.getStorageSync('studyHistory') || [];
    const studyDays = studyHistory.length;

    this.setData({
      totalProgress,
      completedCourses: completedModules,
      studyDays
    });
  },

  // 刷新数据
  refreshData: function () {
    this.loadUserProgress();
    this.generateRecommendations();
    this.calculateStats();
    this.updateWeeklyProgress();
  },

  // 更新本周学习进度
  updateWeeklyProgress: function () {
    const studyHistory = wx.getStorageSync('studyHistory') || [];
    const now = new Date();
    const currentWeek = this.getWeekDates(now);
    
    const weeklyProgress = this.data.weeklyProgress.map((day, index) => {
      const targetDate = currentWeek[index];
      const hasStudied = studyHistory.some(date => 
        new Date(date).toDateString() === targetDate.toDateString()
      );
      
      return {
        ...day,
        completed: hasStudied
      };
    });

    this.setData({
      weeklyProgress
    });
  },

  // 获取本周日期
  getWeekDates: function (date) {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // 周一作为第一天
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }

    return week;
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    this.refreshData();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: 'CCBT疼痛管理训练 - 科学有效的认知行为疗法',
      path: '/pages/training/index'
    };
  }
});
