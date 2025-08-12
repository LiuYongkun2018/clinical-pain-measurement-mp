// pages/profile/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    hasUserInfo: false,
    isLoggedIn: false,
    openid: '',
    loginLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkLoginStatus()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    const openid = wx.getStorageSync('openid')
    
    if (userInfo && openid) {
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true,
        isLoggedIn: true,
        openid: openid
      })
    } else {
      this.setData({
        userInfo: null,
        hasUserInfo: false,
        isLoggedIn: false,
        openid: ''
      })
    }
  },

  /**
   * 获取用户信息并登录
   */
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (res) => {
        console.log('获取用户信息成功', res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', res.userInfo)
        // 获取openid
        this.getOpenId()
      },
      fail: (err) => {
        console.log('获取用户信息失败', err)
        wx.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 获取用户openid
   */
  getOpenId() {
    this.setData({
      loginLoading: true
    })

    wx.showLoading({
      title: '登录中...',
      mask: true
    })

    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'getOpenId'
      },
      success: res => {
        wx.hideLoading()
        console.log('获取openid成功', res)
        const { openid } = res.result
        
        this.setData({
          openid: openid,
          isLoggedIn: true,
          loginLoading: false
        })
        
        // 保存openid到本地存储
        wx.setStorageSync('openid', openid)
        
        // 保存用户信息到云数据库
        this.saveUserInfoToCloud()
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
      },
      fail: err => {
        wx.hideLoading()
        console.error('获取openid失败', err)
        this.setData({
          loginLoading: false
        })
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      }
    })
  },

  /**
   * 保存用户信息到云数据库
   */
  saveUserInfoToCloud() {
    if (!this.data.userInfo || !this.data.openid) return

    wx.cloud.callFunction({
      name: 'quickstartFunctions',
      data: {
        type: 'saveUserInfo',
        userInfo: this.data.userInfo,
        openid: this.data.openid
      },
      success: res => {
        console.log('用户信息保存成功', res)
      },
      fail: err => {
        console.error('用户信息保存失败', err)
      }
    })
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('openid')
          
          // 重置页面数据
          this.setData({
            userInfo: null,
            hasUserInfo: false,
            isLoggedIn: false,
            openid: ''
          })
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  /**
   * 复制openid
   */
  copyOpenId() {
    wx.setClipboardData({
      data: this.data.openid,
      success: () => {
        wx.showToast({
          title: '已复制OpenID',
          icon: 'success'
        })
      }
    })
  },

  /**
   * 查看我的记录
   */
  viewMyRecords() {
    if (!this.data.isLoggedIn) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    // 这里可以跳转到记录页面或展示用户的历史记录
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  /**
   * 关于我们
   */
  showAbout() {
    wx.showModal({
      title: '关于CCBT疼痛疗法',
      content: '本小程序致力于为慢性疼痛患者提供基于计算机化认知行为疗法(CCBT)的专业指导和评估工具，帮助患者更好地管理和应对疼痛。',
      showCancel: false,
      confirmText: '我知道了'
    })
  }
})
