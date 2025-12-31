// 工具函数库

/**
 * 加载提示
 */
const loading = {
  show: (title = '加载中...') => {
    wx.showLoading({
      title,
      mask: true
    });
  },
  hide: () => {
    wx.hideLoading();
  }
};

/**
 * 消息提示
 */
const toast = {
  success: (title, duration = 2000) => {
    wx.showToast({
      title,
      icon: 'success',
      duration
    });
  },
  error: (title = '操作失败', duration = 2000) => {
    wx.showToast({
      title,
      icon: 'none',
      duration
    });
  },
  info: (title, duration = 2000) => {
    wx.showToast({
      title,
      icon: 'none',
      duration
    });
  }
};

/**
 * 确认对话框
 */
const confirm = (options) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title: options.title || '提示',
      content: options.content || '',
      confirmText: options.confirmText || '确定',
      cancelText: options.cancelText || '取消',
      success: (res) => {
        if (res.confirm) {
          resolve(true);
        } else {
          reject(false);
        }
      },
      fail: () => {
        reject(false);
      }
    });
  });
};

/**
 * 云函数调用封装
 */
const callFunction = (name, data = {}) => {
  return new Promise((resolve, reject) => {
    loading.show();
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        loading.hide();
        if (res.result && res.result.success) {
          resolve(res.result.data);
        } else {
          const errorMsg = res.result?.message || '请求失败';
          toast.error(errorMsg);
          reject(new Error(errorMsg));
        }
      },
      fail: (err) => {
        loading.hide();
        console.error('云函数调用失败:', err);
        toast.error('网络请求失败');
        reject(err);
      }
    });
  });
};

/**
 * 数据验证
 */
const validate = {
  // 验证疼痛等级 (0-10)
  painLevel: (level) => {
    if (typeof level !== 'number') {
      return { valid: false, message: '疼痛等级必须是数字' };
    }
    if (level < 0 || level > 10) {
      return { valid: false, message: '疼痛等级必须在0-10之间' };
    }
    return { valid: true };
  },

  // 验证非空
  required: (value, fieldName = '该字段') => {
    if (value === null || value === undefined || value === '') {
      return { valid: false, message: `${fieldName}不能为空` };
    }
    return { valid: true };
  },

  // 验证手机号
  phone: (phone) => {
    const reg = /^1[3-9]\d{9}$/;
    if (!reg.test(phone)) {
      return { valid: false, message: '手机号格式不正确' };
    }
    return { valid: true };
  }
};

/**
 * 格式化日期
 */
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

/**
 * 格式化时间差
 */
const formatTimeDiff = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`;
  } else {
    return formatDate(timestamp, 'YYYY-MM-DD');
  }
};

/**
 * 防抖函数
 */
const debounce = (fn, delay = 300) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

/**
 * 节流函数
 */
const throttle = (fn, delay = 300) => {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
};

/**
 * 本地存储封装
 */
const storage = {
  set: (key, value) => {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.error('存储失败:', e);
      return false;
    }
  },
  
  get: (key, defaultValue = null) => {
    try {
      const value = wx.getStorageSync(key);
      return value !== '' ? value : defaultValue;
    } catch (e) {
      console.error('读取失败:', e);
      return defaultValue;
    }
  },
  
  remove: (key) => {
    try {
      wx.removeStorageSync(key);
      return true;
    } catch (e) {
      console.error('删除失败:', e);
      return false;
    }
  },
  
  clear: () => {
    try {
      wx.clearStorageSync();
      return true;
    } catch (e) {
      console.error('清空失败:', e);
      return false;
    }
  }
};

/**
 * 深拷贝
 */
const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }
  if (obj instanceof Object) {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
};

/**
 * 数组去重
 */
const uniqueArray = (arr, key = null) => {
  if (!key) {
    return [...new Set(arr)];
  }
  const seen = new Set();
  return arr.filter(item => {
    const k = item[key];
    return seen.has(k) ? false : seen.add(k);
  });
};

/**
 * 生成唯一ID
 */
const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 获取系统信息
 */
const getSystemInfo = () => {
  return new Promise((resolve, reject) => {
    wx.getSystemInfo({
      success: resolve,
      fail: reject
    });
  });
};

/**
 * 检查网络状态
 */
const checkNetwork = () => {
  return new Promise((resolve, reject) => {
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          toast.error('网络连接失败');
          reject(new Error('网络连接失败'));
        } else {
          resolve(res.networkType);
        }
      },
      fail: reject
    });
  });
};

/**
 * 页面跳转封装
 */
const navigation = {
  // 保留当前页面，跳转到应用内的某个页面
  navigateTo: (url, params = {}) => {
    const query = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const fullUrl = query ? `${url}?${query}` : url;
    
    wx.navigateTo({
      url: fullUrl,
      fail: (err) => {
        console.error('页面跳转失败:', err);
        toast.error('页面跳转失败');
      }
    });
  },

  // 关闭当前页面，跳转到应用内的某个页面
  redirectTo: (url, params = {}) => {
    const query = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');
    const fullUrl = query ? `${url}?${query}` : url;
    
    wx.redirectTo({
      url: fullUrl,
      fail: (err) => {
        console.error('页面重定向失败:', err);
        toast.error('页面重定向失败');
      }
    });
  },

  // 返回上一页
  navigateBack: (delta = 1) => {
    wx.navigateBack({
      delta,
      fail: (err) => {
        console.error('返回失败:', err);
      }
    });
  }
};

module.exports = {
  loading,
  toast,
  confirm,
  callFunction,
  validate,
  formatDate,
  formatTimeDiff,
  debounce,
  throttle,
  storage,
  deepClone,
  uniqueArray,
  generateId,
  getSystemInfo,
  checkNetwork,
  navigation
};
