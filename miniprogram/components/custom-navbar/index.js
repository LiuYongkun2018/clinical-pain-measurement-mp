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
    navBarHeight: 44  // 导航栏内容高度（不包含状态栏）
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
      const { statusBarHeight, screenWidth } = systemInfo;
      
      // 状态栏高度（px）
      const statusBarHeightPx = statusBarHeight || 20;
      
      // 计算屏幕宽度的缩放比例，将px转换为rpx
      // rpx是相对于设计稿宽度750的单位
      const ratio = 750 / screenWidth;
      const statusBarHeightRpx = Math.ceil(statusBarHeightPx * ratio);
      
      // 导航栏内容高度固定为 44px
      const navBarHeightPx = 44;
      const navBarHeightRpx = Math.ceil(navBarHeightPx * ratio);
      
      console.log('navbar组件设备信息:', {
        screenWidth,
        ratio,
        statusBarHeightPx,
        statusBarHeightRpx,
        navBarHeightPx,
        navBarHeightRpx,
        totalHeightRpx: statusBarHeightRpx + navBarHeightRpx,
        model: systemInfo.model,
        system: systemInfo.system
      });
      
      this.setData({
        statusBarHeight: statusBarHeightRpx,
        navBarHeight: navBarHeightRpx
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
