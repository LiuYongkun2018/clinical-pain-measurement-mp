Component({
  properties: {
    // 标题
    title: {
      type: String,
      value: ''
    },
    // 背景色
    backgroundColor: {
      type: String,
      value: 'transparent'
    },
    // 是否显示返回按钮
    showBackButton: {
      type: Boolean,
      value: true
    },
    // 是否显示通知按钮
    showNotificationButton: {
      type: Boolean,
      value: false
    },
    // 是否有未读通知
    hasUnreadNotifications: {
      type: Boolean,
      value: false
    },
    // 是否显示背景覆盖层
    showOverlay: {
      type: Boolean,
      value: false
    },
    // 主题类型 (white | transparent | gradient)
    theme: {
      type: String,
      value: 'transparent'
    }
  },

  data: {
    statusBarHeight: 20,
    navBarHeight: 88
  },

  lifetimes: {
    attached() {
      this.getSystemInfo();
    }
  },

  methods: {
    // 获取设备信息
    getSystemInfo() {
      const systemInfo = wx.getSystemInfoSync();
      const { statusBarHeight, safeArea, screenHeight, windowHeight } = systemInfo;
      
      // 计算真实的状态栏高度，处理不同设备的差异
      const realStatusBarHeight = statusBarHeight || 20;
      const safeAreaTop = safeArea ? safeArea.top : realStatusBarHeight;
      
      // 导航栏高度 = 状态栏高度 + 导航内容高度(44) + 额外安全距离(8)
      const navBarHeight = realStatusBarHeight + 44 + 8;
      
      console.log('navbar组件设备信息:', {
        statusBarHeight: realStatusBarHeight,
        safeAreaTop,
        navBarHeight,
        screenHeight,
        windowHeight,
        model: systemInfo.model,
        system: systemInfo.system
      });
      
      this.setData({
        statusBarHeight: realStatusBarHeight,
        safeAreaTop: safeAreaTop,
        navBarHeight: navBarHeight
      });
    },

    // 返回按钮点击事件
    goBack() {
      this.triggerEvent('back');
      // 默认行为：如果父组件没有处理，则执行默认返回
      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          wx.navigateBack({
            delta: 1
          });
        } else {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }
      }, 100);
    },

    // 通知按钮点击事件
    showNotifications() {
      this.triggerEvent('notification');
    }
  }
});
