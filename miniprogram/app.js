App({
  globalData: {
    userInfo: null,
    isLogin: false
  },
  checkLogin: function () {
    return this.globalData.isLogin || wx.getStorageSync('userInfo');
  },
  login: function (callback) {
    if (this.checkLogin()) {
      callback && callback(true);
    } else {
      // 触发页面中的登录弹窗
      callback && callback(false);
    }
  }
});