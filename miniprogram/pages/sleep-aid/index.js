// pages/sleep-aid/index.js
Page({
  data: {
    // 自然音数据
    natureList: [
      {
        id: 1,
        title: "雨声",
        coverImage: "https://picsum.photos/id/1015/400/400",
        audioUrl: "https://example.com/rain.mp3"
      },
      {
        id: 2,
        title: "森林",
        coverImage: "https://picsum.photos/id/1019/400/400",
        audioUrl: "https://example.com/forest.mp3"
      },
      {
        id: 3,
        title: "海浪",
        coverImage: "https://picsum.photos/id/1022/400/400",
        audioUrl: "https://example.com/ocean.mp3"
      },
      {
        id: 4,
        title: "鸟鸣",
        coverImage: "https://picsum.photos/id/1039/400/400",
        audioUrl: "https://example.com/birds.mp3"
      },
      {
        id: 5,
        title: "溪流",
        coverImage: "https://picsum.photos/id/1061/400/400",
        audioUrl: "https://example.com/stream.mp3"
      },
      {
        id: 6,
        title: "雷电",
        coverImage: "https://picsum.photos/id/15/400/400",
        audioUrl: "https://example.com/thunder.mp3"
      }
    ],
    
    // 助眠曲数据
    sleepList: [
      {
        id: 7,
        title: "睡眠安抚",
        description: "舒缓的旋律帮助快速入睡，缓解失眠困扰",
        coverImage: "https://picsum.photos/id/1025/800/400",
        categoryId: "sleep_comfort"
      },
      {
        id: 8,
        title: "静心疗愈",
        description: "结合自然元素与轻柔音乐，舒缓心灵压力",
        coverImage: "https://picsum.photos/id/1068/800/400",
        categoryId: "meditation_heal"
      },
      {
        id: 9,
        title: "自然奇境之旅",
        description: "沉浸式自然声音体验，带你进入宁静奇境",
        coverImage: "https://picsum.photos/id/1036/800/400",
        categoryId: "nature_journey"
      },
      {
        id: 10,
        title: "冥想学前课",
        description: "适合初学者的冥想引导音乐，培养正念",
        coverImage: "https://picsum.photos/id/1058/800/400",
        categoryId: "meditation_basic"
      },
      {
        id: 11,
        title: "深度睡眠练习",
        description: "专业设计的音频引导，帮助进入深度睡眠状态",
        coverImage: "https://picsum.photos/id/1059/800/400",
        categoryId: "deep_sleep"
      }
    ],

    // 当前播放音频
    currentAudio: null,
    isPlaying: false
  },

  onLoad() {
    console.log('助眠模块页面加载');
    
    // 设置页面分享信息
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    
    // 检查用户偏好设置
    this.loadUserPreferences();
  },

  onShow() {
    // 页面显示时的逻辑
    console.log('助眠页面显示');
  },

  onHide() {
    // 页面隐藏时暂停音频
    if (this.data.currentAudio) {
      this.data.currentAudio.pause();
      this.setData({
        isPlaying: false
      });
    }
  },

  onUnload() {
    // 页面卸载时清理音频资源
    if (this.data.currentAudio) {
      this.data.currentAudio.destroy();
    }
  },

  // 点击自然音卡片
  onNatureCardTap(e) {
    const item = e.currentTarget.dataset.item;
    console.log('点击自然音卡片:', item.title);
    
    // 这里可以跳转到自然音详情页面或者显示更多选项
    wx.showToast({
      title: `进入${item.title}分类`,
      icon: 'none'
    });
  },

  // 播放自然音
  onPlayNature(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.natureList.find(item => item.id === id);
    
    if (item) {
      this.playAudio(item.audioUrl, item.title);
    }
  },

  // 点击助眠曲卡片
  onSleepCardTap(e) {
    const item = e.currentTarget.dataset.item;
    console.log('点击助眠曲卡片:', item.title);
    
    // 跳转到助眠曲列表页面
    wx.navigateTo({
      url: `/pages/sleep-category/index?categoryId=${item.categoryId}&title=${item.title}`
    });
  },

  // 播放助眠曲
  onPlaySleep(e) {
    const id = e.currentTarget.dataset.id;
    const item = this.data.sleepList.find(item => item.id === id);
    
    if (item) {
      // 这里应该播放该分类的第一首音乐或者推荐音乐
      wx.showToast({
        title: `播放${item.title}`,
        icon: 'none'
      });
    }
  },

  // 播放音频的通用方法
  playAudio(audioUrl, title) {
    // 如果已经有音频在播放，先停止
    if (this.data.currentAudio) {
      this.data.currentAudio.destroy();
    }

    // 创建音频实例
    const audio = wx.createInnerAudioContext();
    audio.src = audioUrl;
    
    audio.onPlay(() => {
      console.log('开始播放:', title);
      this.setData({
        isPlaying: true
      });
      wx.showToast({
        title: `播放${title}`,
        icon: 'none'
      });
    });

    audio.onError((res) => {
      console.error('音频播放失败:', res);
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      });
    });

    audio.onEnded(() => {
      console.log('音频播放结束');
      this.setData({
        isPlaying: false
      });
    });

    // 开始播放
    audio.play();
    
    this.setData({
      currentAudio: audio
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '音视频助眠 - 让你安然入睡',
      path: '/pages/sleep-aid/index',
      imageUrl: 'https://picsum.photos/id/1025/400/300'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '音视频助眠 - 放松身心，安然入睡',
      imageUrl: 'https://picsum.photos/id/1025/400/300'
    };
  },

  // 加载用户偏好设置
  loadUserPreferences() {
    try {
      const preferences = wx.getStorageSync('sleep_preferences');
      if (preferences) {
        console.log('加载用户偏好设置:', preferences);
        // 可以根据用户偏好调整推荐内容
      }
    } catch (e) {
      console.error('加载用户偏好失败:', e);
    }
  },

  // 保存用户偏好
  saveUserPreferences(preferences) {
    try {
      wx.setStorageSync('sleep_preferences', preferences);
      console.log('用户偏好已保存');
    } catch (e) {
      console.error('保存用户偏好失败:', e);
    }
  }
});
