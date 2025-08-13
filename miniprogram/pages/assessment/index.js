Page({
  data: {
    painLevel: 0,
    painDescription: '无痛',
    selectedAreas: [],
    selectedDuration: '',
    selectedFactors: [],
    selectedQualities: [],
    emotions: [
      { id: 'anxiety', name: '焦虑', value: 0 },
      { id: 'depression', name: '沮丧', value: 0 },
      { id: 'anger', name: '愤怒', value: 0 },
      { id: 'fear', name: '恐惧', value: 0 }
    ],
    bodyAreas: [
      { id: 'head', name: '头部', icon: '🧠' },
      { id: 'neck', name: '颈部', icon: '🦒' },
      { id: 'shoulder', name: '肩膀', icon: '💪' },
      { id: 'back', name: '背部', icon: '🫸' },
      { id: 'chest', name: '胸部', icon: '🫁' },
      { id: 'arm', name: '手臂', icon: '💪' },
      { id: 'hand', name: '手部', icon: '✋' },
      { id: 'abdomen', name: '腹部', icon: '🫃' },
      { id: 'leg', name: '腿部', icon: '🦵' },
      { id: 'foot', name: '足部', icon: '🦶' }
    ],
    durationOptions: [
      { value: 'minutes', label: '几分钟' },
      { value: 'hours', label: '几小时' },
      { value: 'days', label: '几天' },
      { value: 'weeks', label: '几周' },
      { value: 'months', label: '几个月' },
      { value: 'chronic', label: '长期慢性疼痛' }
    ],
    triggerFactors: [
      { id: 'movement', name: '活动/运动', icon: '🏃' },
      { id: 'weather', name: '天气变化', icon: '🌤️' },
      { id: 'stress', name: '压力/情绪', icon: '😰' },
      { id: 'sleep', name: '睡眠不足', icon: '😴' },
      { id: 'position', name: '姿势不当', icon: '🪑' },
      { id: 'fatigue', name: '疲劳', icon: '😪' }
    ],
    painQualities: [
      { id: 'sharp', name: '尖锐刺痛' },
      { id: 'dull', name: '钝痛' },
      { id: 'burning', name: '灼热痛' },
      { id: 'throbbing', name: '跳痛' },
      { id: 'cramping', name: '痉挛痛' },
      { id: 'tingling', name: '麻木刺痛' }
    ],
    scaleRect: null,
    isDragging: false,
    canSubmit: false
  },

  onLoad: function (options) {
    this.updatePainDescription();
    this.checkCanSubmit();
  },

  onReady: function () {
    // 获取滑块区域的位置信息
    const query = wx.createSelectorQuery();
    query.select('.scale-track').boundingClientRect((rect) => {
      this.setData({
        scaleRect: rect
      });
    }).exec();
  },

  // VAS量表滑块操作
  onScaleStart: function (e) {
    this.setData({
      isDragging: true
    });
  },

  onScaleMove: function (e) {
    if (!this.data.isDragging || !this.data.scaleRect) return;

    const touch = e.touches[0];
    const rect = this.data.scaleRect;
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const level = Math.round((percentage / 100) * 10);

    this.setData({
      painLevel: level
    });
    
    this.updatePainDescription();
    this.checkCanSubmit();
  },

  onScaleEnd: function (e) {
    this.setData({
      isDragging: false
    });
  },

  // 更新疼痛描述
  updatePainDescription: function () {
    const level = this.data.painLevel;
    let description = '';
    
    if (level === 0) {
      description = '无痛';
    } else if (level <= 2) {
      description = '轻微疼痛';
    } else if (level <= 4) {
      description = '中度疼痛';
    } else if (level <= 6) {
      description = '较重疼痛';
    } else if (level <= 8) {
      description = '重度疼痛';
    } else {
      description = '剧烈疼痛';
    }
    
    this.setData({
      painDescription: description
    });
  },

  // 选择身体部位
  toggleArea: function (e) {
    const areaId = e.currentTarget.dataset.id;
    let selectedAreas = [...this.data.selectedAreas];
    
    const index = selectedAreas.indexOf(areaId);
    if (index > -1) {
      selectedAreas.splice(index, 1);
    } else {
      selectedAreas.push(areaId);
    }
    
    this.setData({
      selectedAreas: selectedAreas
    });
    
    this.checkCanSubmit();
    this.provideFeedback();
  },

  // 选择疼痛持续时间
  selectDuration: function (e) {
    const duration = e.currentTarget.dataset.value;
    this.setData({
      selectedDuration: duration
    });
    
    this.checkCanSubmit();
    this.provideFeedback();
  },

  // 选择触发因素
  toggleFactor: function (e) {
    const factorId = e.currentTarget.dataset.id;
    let selectedFactors = [...this.data.selectedFactors];
    
    const index = selectedFactors.indexOf(factorId);
    if (index > -1) {
      selectedFactors.splice(index, 1);
    } else {
      selectedFactors.push(factorId);
    }
    
    this.setData({
      selectedFactors: selectedFactors
    });
    
    this.provideFeedback();
  },

  // 选择疼痛性质
  toggleQuality: function (e) {
    const qualityId = e.currentTarget.dataset.id;
    let selectedQualities = [...this.data.selectedQualities];
    
    const index = selectedQualities.indexOf(qualityId);
    if (index > -1) {
      selectedQualities.splice(index, 1);
    } else {
      selectedQualities.push(qualityId);
    }
    
    this.setData({
      selectedQualities: selectedQualities
    });
    
    this.provideFeedback();
  },

  // 情绪评分变化
  onEmotionChange: function (e) {
    const emotion = e.currentTarget.dataset.emotion;
    const value = e.detail.value;
    const emotions = [...this.data.emotions];
    
    const emotionIndex = emotions.findIndex(item => item.id === emotion);
    if (emotionIndex > -1) {
      emotions[emotionIndex].value = value;
      this.setData({
        emotions: emotions
      });
    }
  },

  // 检查是否可以提交
  checkCanSubmit: function () {
    const canSubmit = this.data.selectedAreas.length > 0 && this.data.selectedDuration !== '';
    this.setData({
      canSubmit: canSubmit
    });
  },

  // 提供触觉反馈
  provideFeedback: function () {
    wx.vibrateShort({
      type: 'light'
    });
  },

  // 提交评估
  submitAssessment: function () {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请完成必填项目',
        icon: 'none'
      });
      return;
    }

    // 收集评估数据
    const assessmentData = {
      painLevel: this.data.painLevel,
      painDescription: this.data.painDescription,
      areas: this.data.selectedAreas,
      duration: this.data.selectedDuration,
      factors: this.data.selectedFactors,
      qualities: this.data.selectedQualities,
      emotions: this.data.emotions.reduce((obj, emotion) => {
        obj[emotion.id] = emotion.value;
        return obj;
      }, {}),
      timestamp: new Date(),
      date: new Date().toDateString()
    };

    // 保存到本地存储
    let painRecords = wx.getStorageSync('painRecords') || [];
    painRecords.push(assessmentData);
    wx.setStorageSync('painRecords', painRecords);

    // 更新今日任务状态
    this.updateTodayTasks();

    // 显示成功提示
    wx.showToast({
      title: '评估完成',
      icon: 'success',
      duration: 2000
    });

    // 延迟跳转回首页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 2000);
  },

  // 更新今日任务状态
  updateTodayTasks: function () {
    let todayTasks = wx.getStorageSync('todayTasks') || [];
    const taskIndex = todayTasks.findIndex(task => task.id === 1); // 疼痛记录任务
    
    if (taskIndex > -1) {
      todayTasks[taskIndex].completed = true;
      wx.setStorageSync('todayTasks', todayTasks);
    }
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: 'CCBT疼痛管理 - 科学评估，精准管理',
      path: '/pages/index/index'
    };
  }
});