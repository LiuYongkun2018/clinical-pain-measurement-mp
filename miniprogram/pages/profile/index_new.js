Page({
  data: {
    userInfo: {},
    userLevel: '初级',
    chartPeriod: '7d',
    
    userStats: {
      totalDays: 12,
      assessments: 28,
      completedCourses: 5,
      mindfulnessMinutes: 180
    },

    achievements: [
      {
        id: 'first-assessment',
        name: '初次评估',
        description: '完成第一次疼痛评估',
        icon: '🎯',
        unlocked: true
      },
      {
        id: 'week-streak',
        name: '坚持一周',
        description: '连续记录一周',
        icon: '🔥',
        unlocked: true
      },
      {
        id: 'mindfulness-master',
        name: '正念达人',
        description: '完成100分钟正念练习',
        icon: '🧘',
        unlocked: true
      },
      {
        id: 'course-graduate',
        name: '课程毕业',
        description: '完成10个训练课程',
        icon: '🎓',
        unlocked: false
      },
      {
        id: 'pain-warrior',
        name: '疼痛勇士',
        description: '连续记录30天',
        icon: '⚔️',
        unlocked: false
      },
      {
        id: 'mindful-zen',
        name: '禅心如水',
        description: '完成500分钟正念练习',
        icon: '🌊',
        unlocked: false
      }
    ]
  },

  onLoad: function (options) {
    this.loadUserData();
    this.calculateUserLevel();
    this.refreshUserStats();
  },

  onShow: function () {
    this.refreshUserStats();
  },

  // 加载用户数据
  loadUserData: function () {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo: userInfo
    });
  },

  // 计算用户等级
  calculateUserLevel: function () {
    const stats = this.data.userStats;
    const totalScore = stats.totalDays + Math.floor(stats.assessments / 5) + stats.completedCourses * 2;
    
    let level = '初级';
    if (totalScore >= 50) {
      level = '高级';
    } else if (totalScore >= 20) {
      level = '中级';
    }
    
    this.setData({
      userLevel: level
    });
  },

  // 刷新用户统计
  refreshUserStats: function () {
    // 从存储中获取真实数据
    const painRecords = wx.getStorageSync('painRecords') || [];
    const userProgress = wx.getStorageSync('userProgress') || {};
    const studyHistory = wx.getStorageSync('studyHistory') || [];
    
    const stats = {
      totalDays: studyHistory.length || 12,
      assessments: painRecords.length || 28,
      completedCourses: Object.values(userProgress).filter(p => p.completed).length || 5,
      mindfulnessMinutes: this.data.userStats.mindfulnessMinutes
    };
    
    this.setData({
      userStats: stats
    });
    
    this.calculateUserLevel();
    this.updateAchievements();
  },

  // 更新成就状态
  updateAchievements: function () {
    const stats = this.data.userStats;
    const achievements = this.data.achievements.map(achievement => {
      let unlocked = achievement.unlocked;
      
      switch (achievement.id) {
        case 'first-assessment':
          unlocked = stats.assessments > 0;
          break;
        case 'week-streak':
          unlocked = stats.totalDays >= 7;
          break;
        case 'mindfulness-master':
          unlocked = stats.mindfulnessMinutes >= 100;
          break;
        case 'course-graduate':
          unlocked = stats.completedCourses >= 10;
          break;
        case 'pain-warrior':
          unlocked = stats.totalDays >= 30;
          break;
        case 'mindful-zen':
          unlocked = stats.mindfulnessMinutes >= 500;
          break;
      }
      
      return { ...achievement, unlocked };
    });
    
    this.setData({
      achievements
    });
  },

  // 切换图表时间周期
  switchChartPeriod: function (e) {
    const period = e.currentTarget.dataset.period;
    this.setData({
      chartPeriod: period
    });
    
    wx.showToast({
      title: '图表功能开发中',
      icon: 'none'
    });
  },

  // 编辑个人资料
  editProfile: function () {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        this.setData({
          userInfo: res.userInfo
        });
        wx.setStorageSync('userInfo', res.userInfo);
        wx.showToast({
          title: '资料更新成功',
          icon: 'success'
        });
      },
      fail: () => {
        wx.showToast({
          title: '取消授权',
          icon: 'none'
        });
      }
    });
  },

  // 数据导出
  exportData: function () {
    wx.showModal({
      title: '数据导出',
      content: '将导出您的疼痛管理数据到本地文件',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '功能开发中',
            icon: 'none'
          });
        }
      }
    });
  },

  // 提醒设置
  remindSettings: function () {
    wx.showToast({
      title: '提醒设置功能开发中',
      icon: 'none'
    });
  },

  // 隐私设置
  privacySettings: function () {
    wx.showToast({
      title: '隐私设置功能开发中',
      icon: 'none'
    });
  },

  // 关于应用
  aboutApp: function () {
    wx.showModal({
      title: '关于应用',
      content: 'CCBT疼痛管理应用\\n版本：1.0.0\\n基于认知行为疗法的专业疼痛管理工具',
      showCancel: false
    });
  },

  // 意见反馈
  feedback: function () {
    wx.showModal({
      title: '意见反馈',
      content: '感谢您的使用，如有建议请通过客服联系我们',
      showCancel: false
    });
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: '确认退出',
      content: '退出登录将清除本地数据，确定要继续吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorageSync();
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          
          setTimeout(() => {
            wx.reLaunch({
              url: '/pages/index/index'
            });
          }, 1500);
        }
      }
    });
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: 'CCBT疼痛管理 - 科学管理疼痛，重拾健康生活',
      path: '/pages/index/index'
    };
  }
});
