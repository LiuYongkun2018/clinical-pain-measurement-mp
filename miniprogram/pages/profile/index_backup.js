Page({
  data: {
    userInfo: {},
    userLevel: '初级',
    chartPeriod: '7d',
    painTrendData: [7, 5, 6, 4, 3, 5, 4], // 测试数据
    averagePain: 4.9,
    painTrend: -1.2,
    canvasSupported: true,
    xAxisLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    
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
    this.loadPainTrendData();
  },

  onReady: function () {
    console.log('页面准备就绪');
    // 延时初始化图表确保元素已渲染
    setTimeout(() => {
      this.initChart();
    }, 500);
  },

  onShow: function () {
    this.refreshUserStats();
    this.loadPainTrendData();
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
      
      trendData.push(dayRecord ? dayRecord.level : 0);
    }
    
    // 如果没有真实数据，提供示例数据用于演示
    if (painRecords.length === 0) {
      if (period === '7d') {
        // 7天示例数据
        trendData.splice(0, 7, 4, 3, 5, 2, 3, 4, 3);
      } else {
        // 30天示例数据
        const sampleData = [4, 3, 5, 2, 3, 4, 3, 5, 4, 2, 3, 4, 5, 3, 2, 4, 3, 5, 4, 3, 2, 4, 3, 5, 3, 4, 2, 3, 4, 5];
        trendData.splice(0, 30, ...sampleData);
      }
    }
    
    // 计算统计数据
    const validData = trendData.filter(value => value > 0);
    const averagePain = validData.length > 0 
      ? (validData.reduce((sum, val) => sum + val, 0) / validData.length).toFixed(1)
      : 0;
    
    // 计算趋势（最近一半与前一半的对比）
    let painTrend = 0;
    if (validData.length > 0) {
      const halfPoint = Math.floor(days / 2);
      const recentData = trendData.slice(halfPoint).filter(v => v > 0);
      const earlierData = trendData.slice(0, halfPoint).filter(v => v > 0);
      
      if (recentData.length > 0 && earlierData.length > 0) {
        const recentAvg = recentData.reduce((sum, val) => sum + val, 0) / recentData.length;
        const earlierAvg = earlierData.reduce((sum, val) => sum + val, 0) / earlierData.length;
        painTrend = recentAvg - earlierAvg;
      }
    }
    
    this.setData({
      painTrendData: trendData,
      averagePain: averagePain,
      painTrend: painTrend
    });
  },

  // 初始化疼痛趋势图表 
  initChart: function () {
    console.log('开始初始化图表', this.data.painTrendData);
    
    if (!this.data.painTrendData || this.data.painTrendData.length === 0) {
      console.log('没有图表数据');
      return;
    }
    
    // 尝试使用Canvas绘制
    try {
      this.drawSimpleChart();
    } catch (error) {
      console.error('Canvas绘制失败:', error);
      // 使用备用的可视化图表
      this.setData({
        canvasSupported: false
      });
    }
  },

  // 简化的Canvas绘制
  drawSimpleChart: function () {
    const ctx = wx.createCanvasContext('profilePainChart', this);
    const painData = this.data.painTrendData;
    
    if (!painData || painData.length === 0) return;
    
    const canvasWidth = 300;
    const canvasHeight = 150;
    const padding = 30;
    const chartWidth = canvasWidth - padding * 2;
    const chartHeight = canvasHeight - padding * 2;
    
    // 清除画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 设置背景
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制网格线
    ctx.setStrokeStyle('#f0f0f0');
    ctx.setLineWidth(1);
    
    // 水平网格线
    for (let i = 0; i <= 10; i += 2) {
      const y = padding + chartHeight - (i / 10) * chartHeight;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(canvasWidth - padding, y);
      ctx.stroke();
    }
    
    // 绘制数据线
    const validData = painData.filter(val => val > 0);
    if (validData.length > 0) {
      ctx.setStrokeStyle('#1677ff');
      ctx.setLineWidth(2);
      ctx.beginPath();
      
      painData.forEach((value, index) => {
        if (value > 0) {
          const x = padding + (chartWidth / (painData.length - 1)) * index;
          const y = padding + chartHeight - (value / 10) * chartHeight;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      });
      ctx.stroke();
      
      // 绘制数据点
      ctx.setFillStyle('#1677ff');
      painData.forEach((value, index) => {
        if (value > 0) {
          const x = padding + (chartWidth / (painData.length - 1)) * index;
          const y = padding + chartHeight - (value / 10) * chartHeight;
          
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      });
    }
    
    ctx.draw();
  },

  // 图表触摸事件
  onChartTouchStart: function(e) {
    console.log('图表触摸开始:', e);
  },

  onChartTouchMove: function(e) {
    console.log('图表触摸移动:', e);
  },

  // 兼容旧版Canvas API
  drawChartLegacy: function () {
    const canvas = wx.createCanvasContext('profilePainChart');
    const painData = this.data.painTrendData;
    const period = this.data.chartPeriod;
    
    if (!painData || painData.length === 0 || !painData.some(val => val > 0)) {
      return;
    }
    
    const canvasWidth = 320;
    const canvasHeight = 180;
    const padding = 40;
    const chartWidth = canvasWidth - padding * 2;
    const chartHeight = canvasHeight - padding * 2;
    
    // 清除画布
    canvas.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制背景
    canvas.setFillStyle('#fafbfc');
    canvas.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制背景网格
    canvas.setStrokeStyle('#f0f0f0');
    canvas.setLineWidth(1);
    
    // 水平网格线
    for (let i = 0; i <= 10; i += 2) {
      const y = padding + chartHeight - (i / 10) * chartHeight;
      canvas.beginPath();
      canvas.moveTo(padding, y);
      canvas.lineTo(canvasWidth - padding, y);
      canvas.stroke();
      
      // Y轴标签
      if (i % 2 === 0) {
        canvas.setFillStyle('#999');
        canvas.setFontSize(10);
        canvas.fillText(i.toString(), padding - 15, y + 3);
      }
    }
    
    // 垂直网格线
    const stepCount = period === '7d' ? 6 : 5;
    for (let i = 0; i <= stepCount; i++) {
      const x = padding + (chartWidth / stepCount) * i;
      canvas.beginPath();
      canvas.moveTo(x, padding);
      canvas.lineTo(x, padding + chartHeight);
      canvas.stroke();
    }
    
    // 绘制数据线和填充区域
    const validPoints = [];
    painData.forEach((value, index) => {
      if (value > 0) {
        const x = padding + (chartWidth / (painData.length - 1)) * index;
        const y = padding + chartHeight - (value / 10) * chartHeight;
        validPoints.push({ x, y, value, index });
      }
    });
    
    if (validPoints.length > 0) {
      // 绘制填充区域
      canvas.setFillStyle('rgba(22, 119, 255, 0.1)');
      canvas.beginPath();
      canvas.moveTo(validPoints[0].x, padding + chartHeight);
      validPoints.forEach(point => {
        canvas.lineTo(point.x, point.y);
      });
      canvas.lineTo(validPoints[validPoints.length - 1].x, padding + chartHeight);
      canvas.closePath();
      canvas.fill();
      
      // 绘制数据线
      canvas.setStrokeStyle('#1677ff');
      canvas.setLineWidth(3);
      canvas.setLineCap('round');
      canvas.setLineJoin('round');
      canvas.beginPath();
      validPoints.forEach((point, index) => {
        if (index === 0) {
          canvas.moveTo(point.x, point.y);
        } else {
          canvas.lineTo(point.x, point.y);
        }
      });
      canvas.stroke();
      
      // 绘制数据点
      validPoints.forEach(point => {
        // 外圈
        canvas.setFillStyle('#1677ff');
        canvas.beginPath();
        canvas.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        canvas.fill();
        
        // 内圈
        canvas.setFillStyle('#fff');
        canvas.beginPath();
        canvas.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        canvas.fill();
        
        // 数值标签
        if (period === '7d' || validPoints.length <= 15) {
          canvas.setFillStyle('#333');
          canvas.setFontSize(10);
          canvas.fillText(point.value.toString(), point.x - 4, point.y - 10);
        }
      });
    }
    
    // 绘制坐标轴
    canvas.setStrokeStyle('#ddd');
    canvas.setLineWidth(2);
    canvas.beginPath();
    // Y轴
    canvas.moveTo(padding, padding);
    canvas.lineTo(padding, padding + chartHeight);
    // X轴
    canvas.moveTo(padding, padding + chartHeight);
    canvas.lineTo(padding + chartWidth, padding + chartHeight);
    canvas.stroke();
    
    // 添加标题和说明
    canvas.setFillStyle('#333');
    canvas.setFontSize(12);
    canvas.fillText('疼痛等级', 5, 20);
    canvas.setFontSize(10);
    canvas.fillText(`${period === '7d' ? '最近7天' : '最近30天'}`, 
                    canvasWidth - 60, canvasHeight - 5);
    
    // 重要：必须调用draw()方法
    canvas.draw(true, () => {
      console.log('图表绘制完成');
    });
  },

  // 切换图表时间周期
  switchChartPeriod: function (e) {
    const period = e.currentTarget.dataset.period;
    console.log('切换图表时间段:', period);
    
    // 根据时间段更新X轴标签
    let xAxisLabels = [];
    let painTrendData = [];
    
    if (period === '7d') {
      xAxisLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      painTrendData = [7, 5, 6, 4, 3, 5, 4]; // 7天测试数据
    } else {
      xAxisLabels = ['1周', '2周', '3周', '4周'];
      painTrendData = [6.2, 5.1, 4.8, 4.3]; // 30天测试数据
    }
    
    this.setData({
      chartPeriod: period,
      xAxisLabels: xAxisLabels,
      painTrendData: painTrendData,
      averagePain: (painTrendData.reduce((a, b) => a + b, 0) / painTrendData.length).toFixed(1)
    });
    
    // 重新绘制图表
    setTimeout(() => {
      this.initChart();
    }, 100);
    
    wx.showToast({
      title: `切换到${period === '7d' ? '7天' : '30天'}视图`,
      icon: 'success',
      duration: 1000
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
