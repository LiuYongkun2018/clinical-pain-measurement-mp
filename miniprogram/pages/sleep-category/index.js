// pages/sleep-category/index.js
Page({
  data: {
    categoryInfo: {
      title: '',
      description: '',
      coverImage: ''
    },
    audioList: [],
    currentAudio: null,
    currentPlayingId: null,
    isPlaying: false,
    audioContext: null
  },

  onLoad(options) {
    const { categoryId, title } = options;
    
    // 设置分类信息
    this.setCategoryInfo(categoryId, title);
    
    // 加载音频列表
    this.loadAudioList(categoryId);
  },

  onUnload() {
    // 页面卸载时清理音频资源
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }
  },

  // 设置分类信息
  setCategoryInfo(categoryId, title) {
    const categoryMap = {
      sleep_comfort: {
        title: '睡眠安抚',
        description: '舒缓的旋律帮助快速入睡，缓解失眠困扰',
        coverImage: 'https://picsum.photos/id/1025/800/400'
      },
      meditation_heal: {
        title: '静心疗愈',
        description: '结合自然元素与轻柔音乐，舒缓心灵压力',
        coverImage: 'https://picsum.photos/id/1068/800/400'
      },
      nature_journey: {
        title: '自然奇境之旅',
        description: '沉浸式自然声音体验，带你进入宁静奇境',
        coverImage: 'https://picsum.photos/id/1036/800/400'
      },
      meditation_basic: {
        title: '冥想学前课',
        description: '适合初学者的冥想引导音乐，培养正念',
        coverImage: 'https://picsum.photos/id/1058/800/400'
      },
      deep_sleep: {
        title: '深度睡眠练习',
        description: '专业设计的音频引导，帮助进入深度睡眠状态',
        coverImage: 'https://picsum.photos/id/1059/800/400'
      }
    };

    const info = categoryMap[categoryId] || { title: title || '助眠音乐', description: '让你安然入睡', coverImage: 'https://picsum.photos/800/400' };
    
    this.setData({
      categoryInfo: info
    });
    
    wx.setNavigationBarTitle({
      title: info.title
    });
  },

  // 加载音频列表
  loadAudioList(categoryId) {
    // 模拟音频数据，实际应该从服务器获取
    const mockAudioList = {
      sleep_comfort: [
        {
          id: 101,
          title: "深夜雨声",
          artist: "自然之声",
          duration: "45:30",
          coverImgUrl: "https://picsum.photos/id/1025/300/300",
          audioUrl: "https://example.com/rain-night.mp3",
          isFavorite: false
        },
        {
          id: 102,
          title: "森林晚风",
          artist: "自然之声",
          duration: "38:20",
          coverImgUrl: "https://picsum.photos/id/1019/300/300",
          audioUrl: "https://example.com/forest-wind.mp3",
          isFavorite: true
        },
        {
          id: 103,
          title: "安静海浪",
          artist: "自然之声",
          duration: "52:15",
          coverImgUrl: "https://picsum.photos/id/1022/300/300",
          audioUrl: "https://example.com/calm-ocean.mp3",
          isFavorite: false
        }
      ],
      meditation_heal: [
        {
          id: 201,
          title: "内心宁静",
          artist: "冥想大师",
          duration: "30:00",
          coverImgUrl: "https://picsum.photos/id/1068/300/300",
          audioUrl: "https://example.com/inner-peace.mp3",
          isFavorite: false
        },
        {
          id: 202,
          title: "心灵净化",
          artist: "冥想大师",
          duration: "25:45",
          coverImgUrl: "https://picsum.photos/id/1070/300/300",
          audioUrl: "https://example.com/soul-cleanse.mp3",
          isFavorite: true
        }
      ],
      nature_journey: [
        {
          id: 301,
          title: "山谷回音",
          artist: "自然探索",
          duration: "40:10",
          coverImgUrl: "https://picsum.photos/id/1036/300/300",
          audioUrl: "https://example.com/valley-echo.mp3",
          isFavorite: false
        },
        {
          id: 302,
          title: "溪流潺潺",
          artist: "自然探索",
          duration: "35:30",
          coverImgUrl: "https://picsum.photos/id/1061/300/300",
          audioUrl: "https://example.com/stream-flow.mp3",
          isFavorite: false
        }
      ],
      meditation_basic: [
        {
          id: 401,
          title: "呼吸练习",
          artist: "冥想入门",
          duration: "15:00",
          coverImgUrl: "https://picsum.photos/id/1058/300/300",
          audioUrl: "https://example.com/breathing.mp3",
          isFavorite: true
        },
        {
          id: 402,
          title: "正念觉知",
          artist: "冥想入门",
          duration: "20:30",
          coverImgUrl: "https://picsum.photos/id/1055/300/300",
          audioUrl: "https://example.com/mindfulness.mp3",
          isFavorite: false
        }
      ],
      deep_sleep: [
        {
          id: 501,
          title: "深层放松",
          artist: "睡眠专家",
          duration: "60:00",
          coverImgUrl: "https://picsum.photos/id/1059/300/300",
          audioUrl: "https://example.com/deep-relax.mp3",
          isFavorite: false
        },
        {
          id: 502,
          title: "渐进式肌肉放松",
          artist: "睡眠专家",
          duration: "45:20",
          coverImgUrl: "https://picsum.photos/id/1062/300/300",
          audioUrl: "https://example.com/muscle-relax.mp3",
          isFavorite: true
        }
      ]
    };

    const audioList = mockAudioList[categoryId] || [];
    this.setData({
      audioList
    });
  },

  // 播放音频
  playAudio(e) {
    const item = e.currentTarget.dataset.item;
    
    // 如果点击的是当前播放的音频，则切换播放状态
    if (this.data.currentPlayingId === item.id) {
      this.togglePlay();
      return;
    }

    // 停止当前播放
    if (this.data.audioContext) {
      this.data.audioContext.destroy();
    }

    // 创建新的音频实例
    const audioContext = wx.createInnerAudioContext();
    audioContext.src = item.audioUrl;
    
    audioContext.onPlay(() => {
      console.log('开始播放:', item.title);
      this.setData({
        isPlaying: true,
        currentPlayingId: item.id,
        currentAudio: item
      });
    });

    audioContext.onPause(() => {
      console.log('音频暂停');
      this.setData({
        isPlaying: false
      });
    });

    audioContext.onError((res) => {
      console.error('音频播放失败:', res);
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      });
    });

    audioContext.onEnded(() => {
      console.log('音频播放结束');
      this.setData({
        isPlaying: false,
        currentPlayingId: null,
        currentAudio: null
      });
    });

    // 开始播放
    audioContext.play();
    
    this.setData({
      audioContext
    });
  },

  // 切换播放暂停
  togglePlay() {
    if (!this.data.audioContext) {
      return;
    }

    if (this.data.isPlaying) {
      this.data.audioContext.pause();
    } else {
      this.data.audioContext.play();
    }
  },

  // 切换收藏状态
  toggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const audioList = this.data.audioList.map(item => {
      if (item.id === id) {
        return { ...item, isFavorite: !item.isFavorite };
      }
      return item;
    });

    this.setData({
      audioList
    });

    // 显示提示
    const item = audioList.find(item => item.id === id);
    wx.showToast({
      title: item.isFavorite ? '已收藏' : '已取消收藏',
      icon: 'none'
    });
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: `${this.data.categoryInfo.title} - 助你安然入睡`,
      path: `/pages/sleep-category/index?categoryId=${this.data.categoryId}&title=${this.data.categoryInfo.title}`
    };
  }
});
