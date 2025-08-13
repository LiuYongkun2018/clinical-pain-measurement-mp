Page({
  data: {
    activeTab: 'mindfulness',
    
    // 正念音频训练
    mindfulnessAudios: [
      {
        id: 'body-scan',
        title: '身体扫描冥想',
        description: '通过专注身体各部位来放松身心',
        duration: '15分钟',
        cover: '/images/mindfulness/body-scan.jpg',
        url: '/audios/body-scan.mp3'
      },
      {
        id: 'breath-meditation',
        title: '呼吸冥想',
        description: '专注呼吸节奏，平静心神',
        duration: '10分钟', 
        cover: '/images/mindfulness/breath.jpg',
        url: '/audios/breath-meditation.mp3'
      },
      {
        id: 'pain-acceptance',
        title: '疼痛接纳练习',
        description: '学会与疼痛和平共处',
        duration: '20分钟',
        cover: '/images/mindfulness/acceptance.jpg', 
        url: '/audios/pain-acceptance.mp3'
      }
    ],

    // 情绪日志
    emotionLogs: [
      {
        id: 1,
        date: '2025-08-13',
        mood: 'good',
        moodText: '较好',
        note: '今天疼痛有所缓解，心情不错。完成了正念练习。'
      },
      {
        id: 2,
        date: '2025-08-12', 
        mood: 'neutral',
        moodText: '一般',
        note: '疼痛程度中等，有些焦虑。需要多做放松练习。'
      }
    ],

    // 放松技巧
    relaxationTechniques: [
      {
        id: 'progressive-relaxation',
        title: '渐进式肌肉放松',
        description: '依次紧张和放松各组肌肉',
        duration: '15分钟',
        icon: '💪'
      },
      {
        id: 'deep-breathing',
        title: '深呼吸练习',
        description: '通过控制呼吸来放松身心',
        duration: '5分钟',
        icon: '🫁'
      },
      {
        id: 'visualization',
        title: '想象放松法',
        description: '通过想象美好场景来放松',
        duration: '10分钟',
        icon: '🌅'
      }
    ],

    // 音频播放状态
    currentAudio: null,
    isPlaying: false,
    showPlayer: false,
    currentTime: '00:00',
    playProgress: 0,
    audioContext: null
  },

  onLoad: function (options) {
    this.loadEmotionLogs();
    if (options.tab) {
      this.setData({
        activeTab: options.tab
      });
    }
  },

  onUnload: function () {
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }
  },

  // 切换标签
  switchTab: function (e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab
    });
    
    // 触觉反馈
    wx.vibrateShort({
      type: 'light'
    });
  },

  // 播放音频
  playAudio: function (e) {
    const audio = e.currentTarget.dataset.audio;
    
    if (this.data.currentAudio && this.data.currentAudio.id === audio.id) {
      // 如果是同一个音频，切换播放状态
      this.togglePlay();
    } else {
      // 播放新音频
      this.startNewAudio(audio);
    }
  },

  // 开始播放新音频
  startNewAudio: function (audio) {
    // 停止当前音频
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }

    // 创建新的音频上下文
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = audio.url;
    
    audioContext.onPlay(() => {
      this.setData({
        isPlaying: true,
        showPlayer: true
      });
    });

    audioContext.onPause(() => {
      this.setData({
        isPlaying: false
      });
    });

    audioContext.onEnded(() => {
      this.setData({
        isPlaying: false,
        playProgress: 0
      });
    });

    audioContext.onTimeUpdate(() => {
      if (audioContext.duration) {
        const progress = (audioContext.currentTime / audioContext.duration) * 100;
        const currentTime = this.formatTime(audioContext.currentTime);
        this.setData({
          playProgress: progress,
          currentTime: currentTime
        });
      }
    });

    this.setData({
      currentAudio: audio,
      audioContext: audioContext,
      playProgress: 0,
      currentTime: '00:00'
    });

    audioContext.play();
  },

  // 切换播放状态
  togglePlay: function () {
    if (!this.data.audioContext) return;

    if (this.data.isPlaying) {
      this.data.audioContext.pause();
    } else {
      this.data.audioContext.play();
    }
  },

  // 格式化时间
  formatTime: function (seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // 添加情绪日志
  addEmotionLog: function () {
    wx.navigateTo({
      url: '/pages/emotion-log/index'
    });
  },

  // 开始放松技巧
  startTechnique: function (e) {
    const technique = e.currentTarget.dataset.technique;
    wx.navigateTo({
      url: `/pages/relaxation-detail/index?id=${technique.id}`
    });
  },

  // 加载情绪日志
  loadEmotionLogs: function () {
    const logs = wx.getStorageSync('emotionLogs') || [];
    this.setData({
      emotionLogs: logs.slice(-10) // 显示最近10条
    });
  },

  // 分享功能
  onShareAppMessage: function () {
    return {
      title: 'CCBT心理工具 - 正念训练与情绪管理',
      path: '/pages/tools/index'
    };
  }
});
