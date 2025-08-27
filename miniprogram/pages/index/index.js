Page({
  data: {
    userName: '用户',
    currentDate: '',
    currentPainLevel: 3,
    consecutiveDays: 7,
    completedCourses: 5,
    hasUnreadNotifications: true,
    statusBarHeight: 0,
    safeAreaTop: 0,
    navBarHeight: 88,
    todayProgress: {
      completed: 2,
      total: 4
    },
    // 视频数据
    videoInfo: {
      title: '认知行为疗法：改变对疼痛的认知',
      description: '了解如何通过认知重构来管理慢性疼痛',
      duration: '02:38',
      views: '1218',  // 设置默认观看次数为1218
      tag: '推荐'
    },
    todayTasks: [
      {
        id: 1,
        title: '记录疼痛水平',
        description: '评估今天的疼痛强度',
        icon: '📝',
        completed: true
      },
      {
        id: 2,
        title: '完成认知重构练习',
        description: '识别和改变负面思维模式',
        icon: '🧠',
        completed: true
      },
      {
        id: 3,
        title: '正念冥想练习',
        description: '10分钟引导式正念练习',
        icon: '🧘',
        completed: false
      },
      {
        id: 4,
        title: '行为激活计划',
        description: '完成今日活动计划',
        icon: '🎯',
        completed: false
      }
    ],
    painTrendData: [4, 3, 5, 2, 3, 4, 3] // 过去7天的疼痛数据
  },

  onLoad: function (options) {
    // 初始化观看次数数据
    this.initializeVideoViewCount();
    
    this.setCurrentDate();
    this.loadUserData();
    this.updateVideoViewCount();
  },

  // 初始化视频观看次数数据
  initializeVideoViewCount: function () {
    let videoStats = wx.getStorageSync('videoStats');
    
    // 如果数据无效或不存在，重置为默认值
    if (!videoStats || typeof videoStats !== 'object' || 
        isNaN(videoStats.totalViews) || isNaN(videoStats.views)) {
      videoStats = {
        views: 0,
        totalViews: 1218
      };
      wx.setStorageSync('videoStats', videoStats);
    }
    
    // 确保数据为整数
    if (videoStats.totalViews) {
      videoStats.totalViews = parseInt(videoStats.totalViews) || 1218;
    }
    if (videoStats.views) {
      videoStats.views = parseInt(videoStats.views) || 0;
    }
    
    wx.setStorageSync('videoStats', videoStats);
  },

  onShow: function () {
    this.refreshData();
    setTimeout(() => {
      this.initChart();
    }, 300);
    // 更新视频观看数显示
    this.updateVideoViewCount();
  },

  // 设置当前日期
  setCurrentDate: function () {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[now.getDay()];
    
    this.setData({
      currentDate: `${month}月${day}日 ${weekDay}`
    });
  },

  // 加载用户数据
  loadUserData: function () {
    // 从本地存储或服务器获取用户数据
    const userData = wx.getStorageSync('userData') || {};
    if (userData.name) {
      this.setData({
        userName: userData.name
      });
    }

    // 加载疼痛记录数据
    const painRecords = wx.getStorageSync('painRecords') || [];
    if (painRecords.length > 0) {
      const today = new Date().toDateString();
      const todayRecord = painRecords.find(record => 
        new Date(record.date).toDateString() === today
      );
      
      if (todayRecord) {
        this.setData({
          currentPainLevel: todayRecord.level
        });
      }

      // 计算连续记录天数
      this.calculateConsecutiveDays(painRecords);
      
      // 更新疼痛趋势数据
      this.updatePainTrendData(painRecords);
    }

    // 加载任务完成情况
    this.loadTodayTasks();
  },

  // 计算连续记录天数
  calculateConsecutiveDays: function (records) {
    if (records.length === 0) {
      this.setData({ consecutiveDays: 0 });
      return;
    }

    const sortedRecords = records.sort((a, b) => new Date(b.date) - new Date(a.date));
    let consecutiveDays = 0;
    let currentDate = new Date();

    for (let record of sortedRecords) {
      const recordDate = new Date(record.date);
      const diffTime = currentDate - recordDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === consecutiveDays) {
        consecutiveDays++;
        currentDate = recordDate;
      } else {
        break;
      }
    }

    this.setData({ consecutiveDays });
  },

  // 更新疼痛趋势数据
  updatePainTrendData: function (records) {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - i);
      const targetDateStr = targetDate.toDateString();
      
      const dayRecord = records.find(record => 
        new Date(record.date).toDateString() === targetDateStr
      );
      
      last7Days.push(dayRecord ? dayRecord.level : 0);
    }
    
    this.setData({
      painTrendData: last7Days
    });
  },

  // 加载今日任务
  loadTodayTasks: function () {
    const todayTasksData = wx.getStorageSync('todayTasks') || this.data.todayTasks;
    const completedCount = todayTasksData.filter(task => task.completed).length;
    
    this.setData({
      todayTasks: todayTasksData,
      'todayProgress.completed': completedCount,
      'todayProgress.total': todayTasksData.length
    });
  },

  // 刷新数据
  refreshData: function () {
    this.loadUserData();
  },

  // 初始化图表
  initChart: function () {
    const canvas = wx.createCanvasContext('painChart');
    const painData = this.data.painTrendData;
    const canvasWidth = 300;
    const canvasHeight = 150;
    const padding = 20;
    const chartWidth = canvasWidth - padding * 2;
    const chartHeight = canvasHeight - padding * 2;
    
    // 清除画布
    canvas.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // 绘制网格线
    canvas.setStrokeStyle('#f0f0f0');
    canvas.setLineWidth(1);
    
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      canvas.moveTo(padding, y);
      canvas.lineTo(canvasWidth - padding, y);
      canvas.stroke();
    }
    
    // 绘制数据线
    if (painData.length > 0) {
      canvas.setStrokeStyle('#1677ff');
      canvas.setLineWidth(3);
      canvas.beginPath();
      
      painData.forEach((value, index) => {
        const x = padding + (chartWidth / (painData.length - 1)) * index;
        const y = padding + chartHeight - (value / 10) * chartHeight;
        
        if (index === 0) {
          canvas.moveTo(x, y);
        } else {
          canvas.lineTo(x, y);
        }
      });
      
      canvas.stroke();
      
      // 绘制数据点
      canvas.setFillStyle('#1677ff');
      painData.forEach((value, index) => {
        const x = padding + (chartWidth / (painData.length - 1)) * index;
        const y = padding + chartHeight - (value / 10) * chartHeight;
        
        canvas.beginPath();
        canvas.arc(x, y, 4, 0, 2 * Math.PI);
        canvas.fill();
      });
    }
    
    canvas.draw();
  },

  // 切换任务完成状态
  toggleTask: function (e) {
    const taskId = e.currentTarget.dataset.id;
    const tasks = this.data.todayTasks;
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = !tasks[taskIndex].completed;
      const completedCount = tasks.filter(task => task.completed).length;
      
      this.setData({
        todayTasks: tasks,
        'todayProgress.completed': completedCount
      });
      
      // 保存到本地存储
      wx.setStorageSync('todayTasks', tasks);
      
      // 播放反馈音效
      if (tasks[taskIndex].completed) {
        wx.vibrateShort();
        wx.showToast({
          title: '任务完成！',
          icon: 'success',
          duration: 1000
        });
      }
    }
  },

  // 播放疼痛科普视频
  playEducationVideo: function () {
    // 显示加载动画
    wx.showLoading({
      title: '准备视频...',
      mask: true
    });

    // 记录用户行为
    this.recordVideoAction('view');

    // 模拟加载过程
    setTimeout(() => {
      wx.hideLoading();
      
      // 直接跳转到视频播放页面
      wx.navigateTo({
        url: '/pages/video-player/index?src=cloud://cloud1-0ghb31rxf59a59fa.636c-cloud1-0ghb31rxf59a59fa-1307936480/pain.mp4&title=认知行为疗法：改变对疼痛的认知'
      });
    }, 500);
  },

  // 记录视频相关行为
  recordVideoAction: function (action) {
    const videoStats = wx.getStorageSync('videoStats') || {
      views: 0,
      later: 0,
      lastView: null
    };
    
    if (action === 'view') {
      videoStats.views += 1;
      videoStats.lastView = new Date().toISOString();
    } else if (action === 'later') {
      videoStats.later += 1;
    }
    
    wx.setStorageSync('videoStats', videoStats);
    
    // 更新视频观看数显示
    this.updateVideoViewCount();
    
    // 触觉反馈
    wx.vibrateShort();
  },

  // 更新视频观看数显示
  updateVideoViewCount: function () {
    const videoStats = wx.getStorageSync('videoStats') || { 
      views: 0,
      totalViews: 1218  // 设置默认基础观看数为1218
    };
    
    // 计算总观看次数，确保为整数
    const baseViews = parseInt(videoStats.totalViews || 1218);
    const userViews = parseInt(videoStats.views || 0);
    const totalViews = baseViews + userViews;
    
    let viewsText = '';
    
    // 防止NaN显示
    if (isNaN(totalViews) || totalViews <= 0) {
      viewsText = '1218';
    } else if (totalViews >= 10000) {
      viewsText = (Math.floor(totalViews / 1000) / 10).toFixed(1) + '万';
      // 如果是整万，去掉小数点
      if (viewsText.endsWith('.0万')) {
        viewsText = viewsText.replace('.0万', '万');
      }
    } else if (totalViews >= 1000) {
      viewsText = (Math.floor(totalViews / 100) / 10).toFixed(1) + 'k';
      // 如果是整千，去掉小数点  
      if (viewsText.endsWith('.0k')) {
        viewsText = viewsText.replace('.0k', 'k');
      }
    } else {
      viewsText = totalViews.toString();
    }
    
    console.log('首页观看次数更新:', {
      baseViews: baseViews,
      userViews: userViews,
      totalViews: totalViews,
      displayText: viewsText
    });
    
    this.setData({
      'videoInfo.views': viewsText
    });
  },

  // 记录疼痛
  recordPain: function () {
    wx.navigateTo({
      url: '/pages/assessment/index'
    });
  },

  // 开始正念练习
  startMindfulness: function () {
    wx.navigateTo({
      url: '/pages/tools/index?tab=mindfulness'
    });
  },

  // 查看课程
  viewCourses: function () {
    wx.navigateTo({
      url: '/pages/training/index'
    });
  },

  // 情绪日志
  emotionLog: function () {
    wx.navigateTo({
      url: '/pages/tools/index?tab=emotion'
    });
  },

  // 返回上一页
  goBack: function () {
    // 检查是否有上一页
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({
        delta: 1
      });
    } else {
      // 如果是首页，可以显示提示或执行其他操作
      wx.showToast({
        title: '已在首页',
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 显示通知
  showNotifications: function () {
    wx.showActionSheet({
      itemList: ['查看系统通知', '疼痛提醒设置', '课程更新通知'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.viewSystemNotifications();
            break;
          case 1:
            this.setPainReminders();
            break;
          case 2:
            this.viewCourseUpdates();
            break;
        }
      }
    });
  },

  // 查看系统通知
  viewSystemNotifications: function () {
    wx.showModal({
      title: '系统通知',
      content: '暂无新通知',
      showCancel: false
    });
    
    // 清除通知红点
    this.setData({
      hasUnreadNotifications: false
    });
  },

  // 设置疼痛提醒
  setPainReminders: function () {
    wx.showToast({
      title: '提醒设置功能开发中',
      icon: 'none'
    });
  },

  // 查看课程更新
  viewCourseUpdates: function () {
    wx.navigateTo({
      url: '/pages/training/index'
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
