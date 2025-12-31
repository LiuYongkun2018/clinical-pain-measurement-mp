// 引入量表配置
const scaleConfig = require('../../utils/scaleConfig.js');

Page({
  data: {
    // 视图控制
    currentView: 'home', // 'home', 'nrs', 'sas', 'sds'
    showScaleIntro: true, // 是否显示量表介绍页
    
    // NRS评估相关数据
    painLevel: 0,
    painDescription: '无痛',
    painLevelClass: 'none', // 用于样式控制
    selectedArea: '',
    selectedDuration: '',
    selectedFactor: '',
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
      { value: 'chronic', label: '慢性疼痛' }
    ],
    triggerFactors: [
      { id: 'movement', name: '活动运动', icon: '🏃' },
      { id: 'weather', name: '天气变化', icon: '🌤️' },
      { id: 'stress', name: '压力情绪', icon: '😰' },
      { id: 'sleep', name: '睡眠不足', icon: '😴' },
      { id: 'position', name: '姿势不当', icon: '🪑' },
      { id: 'fatigue', name: '身体疲劳', icon: '😪' }
    ],
    painQualities: [
      { id: 'sharp', name: '尖锐刺痛' },
      { id: 'dull', name: '钝痛' },
      { id: 'burning', name: '灼热痛' },
      { id: 'throbbing', name: '跳痛' },
      { id: 'cramping', name: '痉挛痛' },
      { id: 'tingling', name: '麻刺痛' },
      { id: 'aching', name: '酸痛' },
      { id: 'shooting', name: '放射痛' }
    ],
    scaleRect: null,
    isDragging: false,
    canSubmit: false,

    // SAS/SDS量表配置
    scaleConfig: null
  },

  onLoad: function (options) {
    // 如果有传入评估类型，直接跳转
    if (options && options.type) {
      this.selectAssessment({ currentTarget: { dataset: { type: options.type } } });
    }
    this.updatePainDescription();
    this.checkCanSubmit();
  },

  onReady: function () {
    // 延迟获取滑块区域位置信息
    setTimeout(() => {
      this.updateScaleRect();
    }, 300);
  },

  // 获取滑块区域位置
  updateScaleRect: function() {
    const query = wx.createSelectorQuery();
    query.select('.scale-track').boundingClientRect((rect) => {
      if (rect) {
        this.setData({ scaleRect: rect });
      }
    }).exec();
  },

  // ============ 视图切换相关 ============
  
  // 选择评估类型
  selectAssessment: function(e) {
    const type = e.currentTarget.dataset.type;
    
    if (type === 'nrs') {
      this.setData({ currentView: 'nrs' });
      // 延迟获取滑块位置
      setTimeout(() => this.updateScaleRect(), 100);
    } else if (type === 'sas') {
      this.setData({
        currentView: 'sas',
        showScaleIntro: true,
        scaleConfig: scaleConfig.SAS
      });
    } else if (type === 'sds') {
      this.setData({
        currentView: 'sds',
        showScaleIntro: true,
        scaleConfig: scaleConfig.SDS
      });
    }
    
    this.provideFeedback();
  },

  // 返回首页
  goBack: function() {
    this.setData({
      currentView: 'home',
      showScaleIntro: true
    });
    this.provideFeedback();
  },

  // 查看历史记录
  viewHistory: function() {
    wx.navigateTo({
      url: '/pages/assessment-history/index'
    });
  },

  // 开始量表测评
  startScale: function() {
    this.setData({ showScaleIntro: false });
    this.provideFeedback();
  },

  // ============ NRS评估相关 ============

  // 选择疼痛等级（点击数字）
  selectPainLevel: function(e) {
    const level = e.currentTarget.dataset.level;
    this.setData({ painLevel: level });
    this.updatePainDescription();
    this.checkCanSubmit();
    this.provideFeedback();
  },

  // VAS量表滑块操作
  onScaleStart: function (e) {
    this.updateScaleRect();
    this.setData({ isDragging: true });
    this.handleScaleTouch(e);
  },

  onScaleMove: function (e) {
    if (!this.data.isDragging) return;
    this.handleScaleTouch(e);
  },

  handleScaleTouch: function(e) {
    if (!this.data.scaleRect) return;
    
    const touch = e.touches[0];
    const rect = this.data.scaleRect;
    const x = touch.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const level = Math.round((percentage / 100) * 10);

    this.setData({ painLevel: level });
    this.updatePainDescription();
    this.checkCanSubmit();
  },

  onScaleEnd: function (e) {
    this.setData({ isDragging: false });
  },

  // 更新疼痛描述
  updatePainDescription: function () {
    const level = this.data.painLevel;
    let description = '';
    let levelClass = '';
    
    if (level === 0) {
      description = '无痛';
      levelClass = 'none';
    } else if (level <= 3) {
      description = '轻度疼痛';
      levelClass = 'mild';
    } else if (level <= 6) {
      description = '中度疼痛';
      levelClass = 'moderate';
    } else {
      description = '重度疼痛';
      levelClass = 'severe';
    }
    
    this.setData({
      painDescription: description,
      painLevelClass: levelClass
    });
  },

  // 选择身体部位
  selectArea: function (e) {
    const areaId = e.currentTarget.dataset.id;
    const newSelectedArea = this.data.selectedArea === areaId ? '' : areaId;
    
    this.setData({ selectedArea: newSelectedArea });
    this.checkCanSubmit();
    this.provideFeedback();
  },

  // 选择疼痛持续时间
  selectDuration: function (e) {
    const duration = e.currentTarget.dataset.value;
    const newSelectedDuration = this.data.selectedDuration === duration ? '' : duration;
    
    this.setData({ selectedDuration: newSelectedDuration });
    
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

  // 提交NRS评估
  submitNRS: function () {
    if (!this.data.canSubmit) {
      wx.showToast({
        title: '请完成必填项目',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({ title: '提交中...' });

    // 收集评估数据
    const assessmentData = {
      type: 'NRS',
      painLevel: this.data.painLevel,
      painDescription: this.data.painDescription,
      area: this.data.selectedArea,
      duration: this.data.selectedDuration,
      factor: this.data.selectedFactor || null,
      qualities: this.data.selectedQualities || [],
      emotions: this.data.emotions.reduce((obj, emotion) => {
        obj[emotion.id] = emotion.value;
        return obj;
      }, {}),
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('zh-CN')
    };

    // 调用云函数保存数据
    wx.cloud.callFunction({
      name: 'assessmentFunctions',
      data: {
        action: 'saveNRS',
        data: assessmentData
      }
    }).then(res => {
      wx.hideLoading();
      
      // 同时保存到本地
      let painRecords = wx.getStorageSync('painRecords') || [];
      painRecords.push(assessmentData);
      wx.setStorageSync('painRecords', painRecords);

      this.updateTodayTasks();
      
      wx.showToast({
        title: '评估完成',
        icon: 'success'
      });

      setTimeout(() => {
        this.setData({ currentView: 'home' });
        this.resetNRSForm();
      }, 1500);
    }).catch(err => {
      wx.hideLoading();
      console.error('保存NRS评估失败:', err);
      
      // 失败时仍然保存到本地
      let painRecords = wx.getStorageSync('painRecords') || [];
      painRecords.push(assessmentData);
      wx.setStorageSync('painRecords', painRecords);

      wx.showToast({
        title: '已保存到本地',
        icon: 'success'
      });

      setTimeout(() => {
        this.setData({ currentView: 'home' });
        this.resetNRSForm();
      }, 1500);
    });
  },

  // 重置NRS表单
  resetNRSForm: function() {
    this.setData({
      painLevel: 0,
      painDescription: '无痛',
      painLevelClass: 'none',
      selectedArea: '',
      selectedDuration: '',
      selectedFactor: '',
      selectedQualities: [],
      emotions: this.data.emotions.map(e => ({ ...e, value: 0 })),
      canSubmit: false
    });
  },

  // ============ SAS/SDS量表相关 ============

  // 量表完成事件
  onScaleComplete: function(e) {
    const result = e.detail;
    console.log('量表完成:', result);
    
    // 显示结果
    this.showScaleResult(result);
  },

  // 量表保存事件
  onScaleSave: function(e) {
    const result = e.detail;
    console.log('量表保存:', result);
    
    wx.showLoading({ title: '保存中...' });

    const scaleType = this.data.currentView.toUpperCase();
    
    wx.cloud.callFunction({
      name: 'assessmentFunctions',
      data: {
        action: scaleType === 'SAS' ? 'saveSAS' : 'saveSDS',
        data: {
          ...result,
          timestamp: new Date().toISOString(),
          date: new Date().toLocaleDateString('zh-CN')
        }
      }
    }).then(res => {
      wx.hideLoading();
      
      // 保存到本地
      const storageKey = scaleType === 'SAS' ? 'sasRecords' : 'sdsRecords';
      let records = wx.getStorageSync(storageKey) || [];
      records.push(result);
      wx.setStorageSync(storageKey, records);

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });

      setTimeout(() => {
        this.setData({ 
          currentView: 'home',
          showScaleIntro: true
        });
      }, 1500);
    }).catch(err => {
      wx.hideLoading();
      console.error('保存量表数据失败:', err);
      
      // 失败时保存到本地
      const storageKey = scaleType === 'SAS' ? 'sasRecords' : 'sdsRecords';
      let records = wx.getStorageSync(storageKey) || [];
      records.push(result);
      wx.setStorageSync(storageKey, records);

      wx.showToast({
        title: '已保存到本地',
        icon: 'success'
      });

      setTimeout(() => {
        this.setData({ 
          currentView: 'home',
          showScaleIntro: true
        });
      }, 1500);
    });
  },

  // 显示量表结果
  showScaleResult: function(result) {
    const scaleType = this.data.currentView.toUpperCase();
    const interpretation = this.getScoreInterpretation(scaleType, result.standardScore);
    
    wx.showModal({
      title: `${scaleType}测评结果`,
      content: `标准分: ${result.standardScore}\n${interpretation.level}\n\n${interpretation.description}`,
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 获取分数解读
  getScoreInterpretation: function(scaleType, score) {
    const config = scaleType === 'SAS' ? scaleConfig.SAS : scaleConfig.SDS;
    const interpretations = config.interpretation;
    
    for (let item of interpretations) {
      if (score >= item.min && score <= item.max) {
        return item;
      }
    }
    
    return { level: '未知', description: '请咨询专业人士' };
  },

  // 更新今日任务状态
  updateTodayTasks: function () {
    let todayTasks = wx.getStorageSync('todayTasks') || [];
    const taskIndex = todayTasks.findIndex(task => task.id === 1);
    
    if (taskIndex > -1) {
      todayTasks[taskIndex].completed = true;
      wx.setStorageSync('todayTasks', todayTasks);
    }
  },

  // 提供触觉反馈
  provideFeedback: function () {
    wx.vibrateShort({ type: 'light' });
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: 'CCBT疼痛管理 - 科学评估，精准管理',
      path: '/pages/index/index'
    };
  }
});