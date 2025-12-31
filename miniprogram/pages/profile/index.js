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
    console.log('加载用户数据:', userInfo);
    this.setData({
      userInfo: userInfo
    });
  },

  // 计算用户等级
  calculateUserLevel: function () {
    const stats = this.data.userStats;
    let level = '初级';
    
    if (stats.totalDays >= 30 && stats.completedCourses >= 10) {
      level = '高级';
    } else if (stats.totalDays >= 14 && stats.completedCourses >= 5) {
      level = '中级';
    }
    
    this.setData({
      userLevel: level
    });
  },

  // 刷新用户统计数据
  refreshUserStats: function () {
    // 从存储中获取真实数据
    const painRecords = wx.getStorageSync('painRecords') || [];
    const completedCourses = wx.getStorageSync('completedCourses') || [];
    const mindfulnessLogs = wx.getStorageSync('mindfulnessLogs') || [];
    
    // 计算使用天数
    const firstRecord = painRecords[0];
    const totalDays = firstRecord ? 
      Math.ceil((Date.now() - new Date(firstRecord.date).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
    
    // 计算正念时长
    const mindfulnessMinutes = mindfulnessLogs.reduce((total, log) => total + (log.duration || 0), 0);
    
    this.setData({
      userStats: {
        totalDays: Math.max(totalDays, 12), // 至少显示12天
        assessments: painRecords.length || 28,
        completedCourses: completedCourses.length || 5,
        mindfulnessMinutes: mindfulnessMinutes || 180
      }
    });
  },

  // 加载疼痛趋势数据
  loadPainTrendData: function () {
    const period = this.data.chartPeriod;
    const painRecords = wx.getStorageSync('painRecords') || [];
    
    let painTrendData = [];
    let xAxisLabels = [];
    
    if (period === '7d') {
      // 7天数据
      xAxisLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      if (painRecords.length > 0) {
        // 使用真实数据的最近7天
        painTrendData = this.getRecentDaysData(painRecords, 7);
      } else {
        // 使用测试数据
        painTrendData = [7, 5, 6, 4, 3, 5, 4];
      }
    } else {
      // 30天数据（按周平均）
      xAxisLabels = ['1周', '2周', '3周', '4周'];
      if (painRecords.length > 0) {
        painTrendData = this.getWeeklyAverageData(painRecords, 4);
      } else {
        // 使用测试数据
        painTrendData = [6.2, 5.1, 4.8, 4.3];
      }
    }
    
    // 计算平均值和趋势
    const validData = painTrendData.filter(val => val > 0);
    const averagePain = validData.length > 0 ? 
      (validData.reduce((a, b) => a + b, 0) / validData.length).toFixed(1) : 0;
    
    const painTrend = validData.length >= 2 ? 
      (validData[validData.length - 1] - validData[0]).toFixed(1) : 0;
    
    this.setData({
      painTrendData: painTrendData,
      xAxisLabels: xAxisLabels,
      averagePain: averagePain,
      painTrend: parseFloat(painTrend)
    });
  },

  // 获取最近几天的数据
  getRecentDaysData: function (records, days) {
    const result = new Array(days).fill(0);
    const now = new Date();
    
    records.forEach(record => {
      const recordDate = new Date(record.date);
      const daysDiff = Math.floor((now - recordDate) / (1000 * 60 * 60 * 24));
      if (daysDiff >= 0 && daysDiff < days) {
        result[days - 1 - daysDiff] = record.level || 0;
      }
    });
    
    return result;
  },

  // 获取按周平均的数据
  getWeeklyAverageData: function (records, weeks) {
    const result = new Array(weeks).fill(0);
    const now = new Date();
    
    for (let week = 0; week < weeks; week++) {
      const weekStart = new Date(now.getTime() - (week + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - week * 7 * 24 * 60 * 60 * 1000);
      
      const weekRecords = records.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= weekStart && recordDate < weekEnd;
      });
      
      if (weekRecords.length > 0) {
        const average = weekRecords.reduce((sum, record) => sum + (record.level || 0), 0) / weekRecords.length;
        result[weeks - 1 - week] = parseFloat(average.toFixed(1));
      }
    }
    
    return result;
  },

  // 切换图表时间周期
  switchChartPeriod: function (e) {
    const period = e.currentTarget.dataset.period;
    console.log('切换图表时间段:', period);
    
    this.setData({
      chartPeriod: period
    });
    
    // 重新加载数据
    this.loadPainTrendData();
    
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

  // 初始化疼痛趋势图表 
  initChart: function () {
    console.log('开始初始化图表', this.data.painTrendData);
    
    if (!this.data.painTrendData || this.data.painTrendData.length === 0) {
      console.log('没有图表数据');
      return;
    }
    
    // 优先使用备用可视化图表（更兼容安卓）
    this.setData({
      canvasSupported: false
    });
    
    // 尝试使用Canvas 2D绘制（作为增强）
    try {
      this.drawChart2D();
    } catch (error) {
      console.error('Canvas 2D绘制失败:', error);
      // 已经设置了备用图表，无需额外处理
    }
  },

  // 使用Canvas 2D API绘制（更好的安卓兼容性）
  drawChart2D: function () {
    const query = wx.createSelectorQuery();
    query.select('#profilePainChart')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res || !res[0]) {
          console.log('Canvas节点获取失败，使用备用图表');
          return;
        }

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const painData = this.data.painTrendData;
        
        if (!painData || painData.length === 0) return;

        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        const canvasWidth = res[0].width;
        const canvasHeight = res[0].height;
        const padding = 40;
        const chartWidth = canvasWidth - padding * 2;
        const chartHeight = canvasHeight - padding * 2;

        // 清除画布
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // 绘制背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // 绘制网格线和Y轴标签
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#999999';
        ctx.font = '10px sans-serif';

        for (let i = 0; i <= 10; i += 2) {
          const y = padding + chartHeight - (i / 10) * chartHeight;
          ctx.beginPath();
          ctx.moveTo(padding, y);
          ctx.lineTo(canvasWidth - padding, y);
          ctx.stroke();
          
          // Y轴标签
          ctx.fillText(i.toString(), padding - 20, y + 4);
        }

        // 绘制数据线
        const validData = painData.filter(val => val > 0);
        if (validData.length > 0) {
          // 绘制渐变背景区域
          const gradient = ctx.createLinearGradient(0, padding, 0, canvasHeight - padding);
          gradient.addColorStop(0, 'rgba(22, 119, 255, 0.2)');
          gradient.addColorStop(1, 'rgba(22, 119, 255, 0.05)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.moveTo(padding, canvasHeight - padding);
          
          painData.forEach((value, index) => {
            const x = padding + (chartWidth / (painData.length - 1)) * index;
            const y = value > 0 ? padding + chartHeight - (value / 10) * chartHeight : canvasHeight - padding;
            ctx.lineTo(x, y);
          });
          
          ctx.lineTo(canvasWidth - padding, canvasHeight - padding);
          ctx.closePath();
          ctx.fill();

          // 绘制线条
          ctx.strokeStyle = '#1677ff';
          ctx.lineWidth = 2.5;
          ctx.beginPath();

          let firstPoint = true;
          painData.forEach((value, index) => {
            if (value > 0) {
              const x = padding + (chartWidth / (painData.length - 1)) * index;
              const y = padding + chartHeight - (value / 10) * chartHeight;

              if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
              } else {
                ctx.lineTo(x, y);
              }
            }
          });
          ctx.stroke();

          // 绘制数据点
          ctx.fillStyle = '#1677ff';
          painData.forEach((value, index) => {
            if (value > 0) {
              const x = padding + (chartWidth / (painData.length - 1)) * index;
              const y = padding + chartHeight - (value / 10) * chartHeight;

              // 外圈
              ctx.beginPath();
              ctx.arc(x, y, 5, 0, 2 * Math.PI);
              ctx.fill();
              
              // 内圈白色
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
              ctx.fill();
              ctx.fillStyle = '#1677ff';
            }
          });
        }

        // 绘制X轴标签
        ctx.fillStyle = '#999999';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        const labels = this.data.xAxisLabels || [];
        labels.forEach((label, index) => {
          const x = padding + (chartWidth / (painData.length - 1)) * index;
          ctx.fillText(label, x, canvasHeight - padding + 20);
        });

        console.log('Canvas 2D绘制成功');
        // 绘制成功，可以显示Canvas
        this.setData({
          canvasSupported: true
        });
      });
  },

  // 图表触摸事件
  onChartTouchStart: function(e) {
    console.log('图表触摸开始:', e);
  },

  onChartTouchMove: function(e) {
    console.log('图表触摸移动:', e);
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
          title: '更新成功',
          icon: 'success'
        });
      },
      fail: (err) => {
        console.log('获取用户信息失败:', err);
        wx.showToast({
          title: '获取信息失败',
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
    wx.navigateTo({
      url: '/pages/remind-settings/index'
    });
  },

  // 隐私设置
  privacySettings: function () {
    wx.showModal({
      title: '隐私设置',
      content: '您可以设置数据的隐私级别和分享权限',
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

  // 关于应用
  aboutApp: function () {
    wx.showModal({
      title: 'CCBT疼痛管理',
      content: '版本：1.0.0\n基于认知行为疗法的疼痛管理应用\n帮助您科学管理疼痛，重拾健康生活',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 意见反馈
  feedback: function () {
    wx.showModal({
      title: '意见反馈',
      content: '请通过客服或邮件联系我们',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '感谢您的反馈',
            icon: 'success'
          });
        }
      }
    });
  },

  // 退出登录
  logout: function () {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户数据
          wx.removeStorageSync('userInfo');
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
          // 返回首页
          setTimeout(() => {
            wx.switchTab({
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
