Page({
  handleLogin: function () {
    wx.login({
      success: (res) => {
        if (res.code) {
          wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (userRes) => {
              const userInfo = userRes.userInfo;
              wx.cloud.callFunction({
                name: 'login',
                data: { code: res.code, userInfo },
                success: (cloudRes) => {
                  console.log('登录成功', cloudRes.result);
                  getApp().globalData.userInfo = userInfo;
                  wx.setStorageSync('userInfo', userInfo);
                  wx.navigateBack();
                },
                fail: (err) => {
                  console.error('登录失败', err);
                }
              });
            },
            fail: (err) => {
              console.error('获取用户信息失败', err);
            }
          });
        }
      },
      fail: (err) => {
        console.error('微信登录失败', err);
      }
    });
  }
});