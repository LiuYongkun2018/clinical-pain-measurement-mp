Page({
  data: {
    painLevel: 0,
    painDescription: '无痛',
    selectedArea: '', // 改为单个选择
    selectedDuration: '',
    selectedFactor: '', // 疼痛触发因素(单选)
    selectedQuality: '', // 改为单个选择
    selectedQualities: [], // 疼痛性质(多选)
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
      { id: 'tingling', name: '麻木刺痛' },
      { id: 'aching', name: '酸痛' },
      { id: 'shooting', name: '射痛' },
      { id: 'stabbing', name: '刺痛' }
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

  // 选择身体部位（单选模式，支持取消选择）
  selectArea: function (e) {
    const areaId = e.currentTarget.dataset.id;
    
    // 如果点击的是已选中的项，则取消选择；否则选择新项
    const newSelectedArea = this.data.selectedArea === areaId ? '' : areaId;
    
    this.setData({
      selectedArea: newSelectedArea
    });
    
    this.checkCanSubmit();
    this.provideFeedback();
  },

  // 选择疼痛持续时间（单选模式，支持取消选择）
  selectDuration: function (e) {
    const duration = e.currentTarget.dataset.value;
    
    // 如果点击的是已选中的项，则取消选择；否则选择新项
    const newSelectedDuration = this.data.selectedDuration === duration ? '' : duration;
    
    this.setData({
      selectedDuration: newSelectedDuration
    });
    
    this.checkCanSubmit();
    this.provideFeedback();
  },

  // 选择触发因素(单选模式，支持取消选择)
  selectFactor: function (e) {
    const factorId = e.currentTarget.dataset.id;
    
    // 如果点击的是已选中的项，则取消选择；否则选择新项
    const newSelectedFactor = this.data.selectedFactor === factorId ? '' : factorId;
    
    this.setData({
      selectedFactor: newSelectedFactor
    });
    
    this.provideFeedback();
  },

  // 切换疼痛性质选择(多选模式)
  toggleQuality: function (e) {
    const qualityId = e.currentTarget.dataset.id;
    let selectedQualities = [...this.data.selectedQualities];
    
    // 如果已选中，则移除；如果未选中，则添加
    const index = selectedQualities.indexOf(qualityId);
    if (index > -1) {
      selectedQualities.splice(index, 1);
    } else {
      selectedQualities.push(qualityId);
    }
    
    this.setData({
      selectedQualities: selectedQualities
    });
    
    this.checkCanSubmit();
    this.provideFeedback();
  },

  // 清空疼痛性质选择
  clearQualities: function () {
    this.setData({
      selectedQualities: []
    });
    wx.showToast({
      title: '已清空选择',
      icon: 'success',
      duration: 1000
    });
    this.checkCanSubmit();
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

  // 检查是否可以提交(优化版本)
  checkCanSubmit: function () {
    const { selectedArea, selectedDuration, painLevel } = this.data;
    const canSubmit = selectedArea !== '' && selectedDuration !== '' && painLevel > 0;
    
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

  // 提交评估(添加更完整的数据验证)
  submitAssessment: function () {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请完成必填项目',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 收集评估数据
    const assessmentData = {
      painLevel: this.data.painLevel,
      painDescription: this.data.painDescription,
      area: this.data.selectedArea,
      duration: this.data.selectedDuration,
      factor: this.data.selectedFactor || null, // 触发因素可选
      quality: this.data.selectedQuality || null, // 疼痛性质可选（保持向下兼容）
      qualities: this.data.selectedQualities || [], // 疼痛性质(多选)
      emotions: this.data.emotions.reduce((obj, emotion) => {
        obj[emotion.id] = emotion.value;
        return obj;
      }, {}),
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    };

    console.log('提交的评估数据:', assessmentData);

    try {
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
    } catch (error) {
      console.error('保存评估数据失败:', error);
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
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