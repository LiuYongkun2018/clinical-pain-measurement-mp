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
    ],

    painTrendData: []
  },

  onLoad: function (options) {
    this.loadUserData();
    this.calculateUserLevel();
    this.loadPainTrendData();
  },

  onShow: function () {
    this.refreshUserStats();
  },

  onReady: function () {
    setTimeout(() => {
      this.drawPainChart();
    }, 300);
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
      totalDays: studyHistory.length,
      assessments: painRecords.length,
      completedCourses: Object.values(userProgress).filter(p => p.completed).length,
      mindfulnessMinutes: this.data.userStats.mindfulnessMinutes // 这个需要单独跟踪
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

  // 加载疼痛趋势数据
  loadPainTrendData: function () {
    const painRecords = wx.getStorageSync('painRecords') || [];
    const period = this.data.chartPeriod;
    const days = period === '7d' ? 7 : 30;
    
    const trendData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const targetDateStr = targetDate.toDateString();
      
      const dayRecord = painRecords.find(record => 
        new Date(record.date).toDateString() === targetDateStr
      );
      
      trendData.push({
        date: targetDate,
        level: dayRecord ? dayRecord.painLevel : 0
      });
    }
    
    this.setData({
      painTrendData: trendData
    });
    
    this.drawPainChart();
  },

  // 切换图表时间周期
  switchChartPeriod: function (e) {
    const period = e.currentTarget.dataset.period;
    this.setData({
      chartPeriod: period
    });
    this.loadPainTrendData();
  },

  // 绘制疼痛趋势图
  drawPainChart: function () {
    const canvas = wx.createCanvasContext('painTrendChart');
    const data = this.data.painTrendData;
    
    if (data.length === 0) return;
    
    const canvasWidth = 320;
    const canvasHeight = 200;
    const padding = 30;
    const chartWidth = canvasWidth - padding * 2;
    const chartHeight = canvasHeight - padding * 2;
    
    // 清除画布
    canvas.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制背景网格
    canvas.setStrokeStyle('#f0f0f0');
    canvas.setLineWidth(1);
    
    // 水平网格线
    for (let i = 0; i <= 10; i++) {
      const y = padding + (chartHeight / 10) * i;
      canvas.moveTo(padding, y);
      canvas.lineTo(canvasWidth - padding, y);
      canvas.stroke();
    }
    
    // 垂直网格线（仅在数据点位置）
    data.forEach((_, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      canvas.moveTo(x, padding);
      canvas.lineTo(x, canvasHeight - padding);
      canvas.stroke();
    });
    
    // 绘制数据线
    if (data.length > 1) {
      canvas.setStrokeStyle('#1677ff');
      canvas.setLineWidth(3);
      canvas.beginPath();
      
      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = canvasHeight - padding - (point.level / 10) * chartHeight;
        
        if (index === 0) {
          canvas.moveTo(x, y);
        } else {
          canvas.lineTo(x, y);
        }
      });
      
      canvas.stroke();
    }
    
    // 绘制数据点
    canvas.setFillStyle('#1677ff');
    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = canvasHeight - padding - (point.level / 10) * chartHeight;
      
      canvas.beginPath();
      canvas.arc(x, y, 4, 0, 2 * Math.PI);
      canvas.fill();
    });
    
    canvas.draw();
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
      }
    });
  },

  // 数据导出
  exportData: function () {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 提醒设置
  remindSettings: function () {
    wx.navigateTo({
      url: '/pages/settings/remind'
    });
  },

  // 隐私设置
  privacySettings: function () {
    wx.navigateTo({
      url: '/pages/settings/privacy'
    });
  },

  // 关于应用
  aboutApp: function () {
    wx.navigateTo({
      url: '/pages/about/index'
    });
  },

  // 意见反馈
  feedback: function () {
    wx.navigateTo({
      url: '/pages/feedback/index'
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
          wx.reLaunch({
            url: '/pages/index/index'
          });
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