# 通用顶部状态栏组件 (custom-navbar)

## 功能特性
- ✅ 完整的挖孔屏/刘海屏适配
- ✅ 动态背景色设置
- ✅ 灵活的插槽设计
- ✅ 多主题支持
- ✅ 响应式按钮交互
- ✅ 自动安全区域处理

## 使用方法

### 1. 在页面JSON中引入组件
```json
{
  "usingComponents": {
    "custom-navbar": "/components/custom-navbar/index"
  }
}
```

### 2. 在WXML中使用
```xml
<!-- 基础用法 -->
<custom-navbar 
  title="页面标题"
  backgroundColor="rgba(255, 255, 255, 0.95)"
  showBackButton="{{true}}"
  theme="white">
</custom-navbar>

<!-- 带插槽的高级用法 -->
<custom-navbar 
  title="视频详情"
  backgroundColor="rgba(255, 255, 255, 0.95)"
  showBackButton="{{true}}"
  theme="white"
  bind:back="handleBack">
  <view slot="right">
    <view class="share-button" bindtap="shareVideo">
      <text class="share-icon">⋯</text>
    </view>
  </view>
</custom-navbar>
```

## 属性列表

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| title | String | '' | 导航栏标题 |
| backgroundColor | String | 'transparent' | 背景色 |
| showBackButton | Boolean | true | 是否显示返回按钮 |
| showNotificationButton | Boolean | false | 是否显示通知按钮 |
| hasUnreadNotifications | Boolean | false | 是否有未读通知 |
| showOverlay | Boolean | false | 是否显示背景覆盖层 |
| theme | String | 'transparent' | 主题类型 (white\|transparent\|gradient) |

## 事件列表

| 事件名 | 说明 | 参数 |
|--------|------|------|
| back | 返回按钮点击 | - |
| notification | 通知按钮点击 | - |

## 插槽说明

| 插槽名 | 说明 |
|--------|------|
| left | 左侧内容插槽 |
| center | 中间内容插槽 |
| right | 右侧内容插槽 |

## 主题说明

### transparent (透明主题)
- 背景：透明
- 文字：白色，带阴影
- 按钮：半透明白色背景
- 适用场景：有背景图的页面

### white (白色主题)  
- 背景：白色/半透明白色
- 文字：深色
- 按钮：白色背景
- 适用场景：内容页面、详情页

## 设备适配

组件自动处理以下设备的安全区域：
- iPhone X/XS (375×812)
- iPhone XR (414×896) 
- iPhone XS Max (414×896)
- iPhone 12/13/14 (390×844)
- iPhone 12/13/14 Pro Max (428×926)
- 其他支持 safe-area-inset 的设备

## 使用示例

### 首页导航栏
```xml
<custom-navbar 
  title="疼痛管理"
  backgroundColor="transparent"
  showBackButton="{{false}}"
  showNotificationButton="{{true}}"
  hasUnreadNotifications="{{hasUnreadNotifications}}"
  showOverlay="{{true}}"
  theme="transparent"
  bind:notification="showNotifications">
</custom-navbar>
```

### 视频详情页导航栏
```xml
<custom-navbar 
  title="{{videoTitle}}"
  backgroundColor="rgba(255, 255, 255, 0.95)"
  showBackButton="{{true}}"
  theme="white"
  bind:back="goBack">
  <view slot="right">
    <view class="share-button" bindtap="shareVideo">
      <text class="share-icon">⋯</text>
    </view>
  </view>
</custom-navbar>
```

## 注意事项

1. 使用组件后需要为内容区域设置 `margin-top`：
   ```xml
   <view class="content-wrapper" style="margin-top: {{navBarHeight + statusBarHeight}}rpx;">
   ```

2. 页面需要设置自定义导航栏：
   ```json
   {
     "navigationStyle": "custom"
   }
   ```

3. 确保JS中获取导航栏高度信息：
   ```javascript
   getNavBarInfo: function () {
     const systemInfo = wx.getSystemInfoSync();
     const { statusBarHeight } = systemInfo;
     const realStatusBarHeight = statusBarHeight || 20;
     const navBarHeight = realStatusBarHeight + 44 + 8;
     
     this.setData({
       statusBarHeight: realStatusBarHeight,
       navBarHeight: navBarHeight
     });
   }
   ```
