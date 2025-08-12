// pages/promotion/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formData: {
      paintsId: '',
      paintName: '',
      painLevelDescriptions: ''
    },
    isSubmitting: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  submitForm: function(e) {
    const { paintsId, paintName, painLevelDescriptions } = e.detail.value
    console.log("表单数据: ", e.detail.value)
    
    // 检查登录状态
    const openid = wx.getStorageSync('openid')
    const userInfo = wx.getStorageSync('userInfo')
    
    if (!openid || !userInfo) {
      wx.showModal({
        title: '提示',
        content: '请先登录后再提交信息',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/profile/index'
            })
          }
        }
      })
      return
    }
    
    // 防止重复提交
    if (this.data.isSubmitting) {
      return
    }
    
    // 验证表单数据
    if (!paintsId || !paintsId.trim()) {
      this.showError('请输入病例ID')
      return
    }
    if (!paintName || !paintName.trim()) {
      this.showError('请输入患者姓名')
      return
    }
    if (!painLevelDescriptions || !painLevelDescriptions.trim()) {
      this.showError('请输入疼痛描述')
      return
    }
    
    // 设置提交状态
    this.setData({
      isSubmitting: true
    })
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...',
      mask: true
    })
    
    wx.cloud.callFunction({
      name: 'quickstartFunctions',  // 修正云函数名称
      data: {
        type: 'savePaintRecord',    // 指定要调用的具体方法
        paintsId: paintsId.trim(),
        paintName: paintName.trim(),
        painLevelDescriptions: painLevelDescriptions.trim(),
        openid: openid,  // 关联用户openid
        submitTime: new Date().toISOString()
      },
      success: res => {
        wx.hideLoading()
        console.log('调用成功', res)
        
        if (res.result && res.result.success) {
          wx.showToast({ 
            title: '提交成功',
            icon: 'success',
            duration: 2000
          })
          // 清空表单
          this.resetForm()
        } else {
          this.showError(res.result.errMsg || '保存失败')
        }
      },
      fail: err => {
        wx.hideLoading()
        console.error('提交失败', err)
        this.showError('网络错误，请检查网络后重试')
      },
      complete: () => {
        // 重置提交状态
        this.setData({
          isSubmitting: false
        })
      }
    })
  },
  
  // 显示错误提示
  showError: function(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    })
  },
  
  // 重置表单
  resetForm: function() {
    // 注意：小程序中无法直接清空表单，需要用户手动清空
    // 或者使用双向绑定来控制表单值
    setTimeout(() => {
      wx.showModal({
        title: '提示',
        content: '信息已提交成功，请手动清空表单以录入新信息',
        showCancel: false,
        confirmText: '知道了'
      })
    }, 1500)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})