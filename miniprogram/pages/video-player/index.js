Page({
  data: {
    videoSrc: '',
    videoTitle: '疼痛科普视频',
    viewCount: '1.2万',
    isLoading: true,
    isDescExpanded: false,
    currentTime: 0,
    duration: 0,
    formattedDuration: '00:00',
    videoContext: null,
    statusBarHeight: 0,
    safeAreaTop: 0,
    navBarHeight: 88
  },

  onLoad: function (options) {
    // 获取设备信息
    this.getSystemInfo();
    
    // 获取传入的参数
    const { src, title } = options;
    
    this.setData({
      videoSrc: decodeURIComponent(src || ''),
      videoTitle: decodeURIComponent(title || '疼痛科普视频')
    });

    // 检查网络状态
    this.checkNetworkStatus();

    // 创建视频上下文
    this.data.videoContext = wx.createVideoContext('painVideo', this);
    
    // 更新观看统计
    this.updateViewCount();
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: this.data.videoTitle
    });
  },

  // 获取设备信息
  getSystemInfo: function () {
    const systemInfo = wx.getSystemInfoSync();
    const { statusBarHeight, safeArea } = systemInfo;
    
    this.setData({
      statusBarHeight: statusBarHeight,
      safeAreaTop: safeArea ? safeArea.top : statusBarHeight,
      navBarHeight: statusBarHeight + 44 // 状态栏高度 + 导航栏内容高度
    });
  },

  // 检查网络状态
  checkNetworkStatus: function () {
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType;
        if (networkType === 'none') {
          wx.showModal({
            title: '网络错误',
            content: '请检查网络连接后重试',
            showCancel: false
          });
        } else if (networkType === '2g' || networkType === '3g') {
          wx.showModal({
            title: '网络提醒',
            content: '当前网络较慢，建议在Wi-Fi环境下观看视频',
            confirmText: '继续观看',
            cancelText: '稍后再看'
          });
        }
      }
    });
  },

  onReady: function () {
    // 页面渲染完成后隐藏加载状态
    setTimeout(() => {
      this.setData({
        isLoading: false
      });
    }, 1000);
  },

  onShow: function () {
    // 页面显示时记录观看行为
    this.recordWatchBehavior('enter');
  },

  onHide: function () {
    // 页面隐藏时暂停视频
    if (this.data.videoContext) {
      this.data.videoContext.pause();
    }
    this.recordWatchBehavior('leave');
  },

  onUnload: function () {
    // 页面卸载时清理资源
    if (this.data.videoContext) {
      this.data.videoContext.stop();
    }
  },

  // 视频播放事件
  onVideoPlay: function () {
    console.log('视频开始播放');
    this.recordWatchBehavior('play');
    
    // 隐藏加载状态
    this.setData({
      isLoading: false
    });
  },

  // 视频暂停事件
  onVideoPause: function () {
    console.log('视频暂停');
    this.recordWatchBehavior('pause');
  },

  // 视频结束事件
  onVideoEnd: function () {
    console.log('视频播放结束');
    this.recordWatchBehavior('complete');
    
    // 显示完成提示
    wx.showToast({
      title: '视频播放完成',
      icon: 'success',
      duration: 2000
    });
  },

  // 视频错误事件
  onVideoError: function (e) {
    console.error('视频播放错误:', e);
    this.setData({
      isLoading: false
    });
    
    wx.showModal({
      title: '播放错误',
      content: '视频加载失败，请检查网络连接或稍后重试。',
      showCancel: false,
      confirmText: '确定'
    });
  },

  // 视频时间更新
  onTimeUpdate: function (e) {
    const { currentTime, duration } = e.detail;
    this.setData({
      currentTime: currentTime,
      duration: duration,
      formattedDuration: this.formatTime(duration)
    });
  },

  // 视频元数据加载完成
  onVideoLoaded: function (e) {
    console.log('视频元数据加载完成:', e.detail);
    const { duration } = e.detail;
    this.setData({
      duration: duration,
      formattedDuration: this.formatTime(duration)
    });
  },

  // 格式化时间
  formatTime: function (seconds) {
    if (!seconds || isNaN(seconds)) return '00:00';
    
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  },

  // 切换描述展开状态
  toggleDescription: function () {
    this.setData({
      isDescExpanded: !this.data.isDescExpanded
    });
  },

  // 返回上一页
  goBack: function () {
    wx.navigateBack({
      delta: 1
    });
  },

  // 分享视频
  shareVideo: function () {
    wx.showActionSheet({
      itemList: ['分享给朋友', '收藏视频', '复制链接'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            this.shareToFriend();
            break;
          case 1:
            this.collectVideo();
            break;
          case 2:
            this.copyVideoLink();
            break;
        }
      }
    });
  },

  // 分享给朋友
  shareToFriend: function () {
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  // 收藏视频
  collectVideo: function () {
    // 保存到本地收藏
    let collections = wx.getStorageSync('videoCollections') || [];
    const videoInfo = {
      src: this.data.videoSrc,
      title: this.data.videoTitle,
      collectTime: new Date().toISOString()
    };
    
    // 检查是否已收藏
    const exists = collections.some(item => item.src === videoInfo.src);
    if (!exists) {
      collections.push(videoInfo);
      wx.setStorageSync('videoCollections', collections);
      
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    } else {
      wx.showToast({
        title: '已收藏过了',
        icon: 'none'
      });
    }
  },

  // 复制视频链接
  copyVideoLink: function () {
    wx.setClipboardData({
      data: this.data.videoSrc,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  // 播放相关视频
  playRelatedVideo: function (e) {
    const videoId = e.currentTarget.dataset.id;
    // 这里可以根据videoId跳转到对应的视频
    wx.showToast({
      title: '相关视频功能开发中',
      icon: 'none'
    });
  },

  // 更新观看统计
  updateViewCount: function () {
    let videoStats = wx.getStorageSync('videoStats') || {
      views: 0,
      totalViews: 12000
    };
    
    // 增加观看次数
    videoStats.views += 1;
    wx.setStorageSync('videoStats', videoStats);
    
    // 更新显示
    const totalViews = videoStats.totalViews + videoStats.views;
    let viewsText = '';
    
    if (totalViews >= 10000) {
      viewsText = (totalViews / 10000).toFixed(1) + '万';
    } else if (totalViews >= 1000) {
      viewsText = (totalViews / 1000).toFixed(1) + 'k';
    } else {
      viewsText = totalViews.toString();
    }
    
    this.setData({
      viewCount: viewsText
    });
  },

  // 记录观看行为
  recordWatchBehavior: function (action) {
    const behaviorData = {
      action: action,
      videoSrc: this.data.videoSrc,
      videoTitle: this.data.videoTitle,
      currentTime: this.data.currentTime,
      timestamp: new Date().toISOString()
    };
    
    // 保存观看行为记录
    let watchHistory = wx.getStorageSync('watchHistory') || [];
    watchHistory.push(behaviorData);
    
    // 只保留最近100条记录
    if (watchHistory.length > 100) {
      watchHistory = watchHistory.slice(-100);
    }
    
    wx.setStorageSync('watchHistory', watchHistory);
    
    console.log('记录观看行为:', behaviorData);
  },

  // 页面分享配置
  onShareAppMessage: function () {
    return {
      title: this.data.videoTitle,
      path: `/pages/video-player/index?src=${encodeURIComponent(this.data.videoSrc)}&title=${encodeURIComponent(this.data.videoTitle)}`,
      imageUrl: '/images/relaxation_music_bg.jpg'
    };
  }
});
