# 修复编译错误指南

## 问题描述
```
[ WXML 文件编译错误] 
WXML file not found: ./pages/video-player/index.wxml
(env: Windows,mp,1.06.2405020; lib: 3.9.0)
```

## 解决方案

### 方法 1：清理缓存（推荐）
1. 关闭微信开发者工具
2. 删除以下目录的缓存：
   - `C:\Users\你的用户名\AppData\Local\微信开发者工具\User Data\Default\Cache`
   - `C:\Users\你的用户名\AppData\Local\微信开发者工具\User Data\Default\Code Cache`
3. 重新打开项目

### 方法 2：重新编译
1. 在微信开发者工具中点击：工具 -> 编译设置
2. 勾选"编译前清理缓存"
3. 点击"清缓存" -> "清除所有缓存"
4. 重新编译

### 方法 3：检查配置文件
确保 `project.config.json` 中的配置正确：
```json
{
  "miniprogramRoot": "miniprogram/",
  "compileType": "miniprogram"
}
```

### 方法 4：重新添加页面
1. 在开发者工具中右键 `pages` 文件夹
2. 选择"新建页面"
3. 输入 `video-player/index`
4. 如果提示已存在，选择覆盖

### 方法 5：检查文件编码
确保所有 `.wxml` 文件使用 UTF-8 编码（无BOM）

### 方法 6：终极方案
1. 备份项目
2. 删除项目根目录下的 `.vscode` 文件夹（如果有）
3. 删除 `miniprogram` 目录下所有 `.wxss.map` 和 `.js.map` 文件
4. 重新导入项目到微信开发者工具

## 预防措施
- 定期清理缓存
- 保持开发者工具更新
- 使用版本控制（Git）
- 避免在编译时修改文件
