@echo off
chcp 65001 > nul
echo ============================================
echo    微信小程序编译错误修复工具
echo ============================================
echo.

echo [1/5] 正在检查项目文件...
if not exist "miniprogram\pages\video-player\index.wxml" (
    echo ❌ 错误: index.wxml 文件不存在
    pause
    exit /b 1
)
echo ✓ 文件检查通过

echo.
echo [2/5] 正在清理本地缓存...
if exist ".wxcompile" (
    rmdir /s /q .wxcompile
    echo ✓ 已清理 .wxcompile 目录
)

echo.
echo [3/5] 正在清理临时文件...
del /s /q *.map 2>nul
echo ✓ 已清理 map 文件

echo.
echo [4/5] 正在验证项目配置...
if not exist "project.config.json" (
    echo ❌ 错误: project.config.json 文件不存在
    pause
    exit /b 1
)
echo ✓ 配置文件验证通过

echo.
echo [5/5] 正在检查文件完整性...
set ERROR=0
if not exist "miniprogram\pages\video-player\index.js" set ERROR=1
if not exist "miniprogram\pages\video-player\index.json" set ERROR=1
if not exist "miniprogram\pages\video-player\index.wxml" set ERROR=1
if not exist "miniprogram\pages\video-player\index.wxss" set ERROR=1

if %ERROR%==1 (
    echo ❌ 错误: video-player 页面文件不完整
    pause
    exit /b 1
)
echo ✓ 文件完整性检查通过

echo.
echo ============================================
echo ✓ 修复完成！
echo ============================================
echo.
echo 请按照以下步骤操作：
echo 1. 关闭微信开发者工具（如果已打开）
echo 2. 重新打开微信开发者工具
echo 3. 导入此项目
echo 4. 点击"编译" -> "清除缓存" -> "清除所有缓存"
echo 5. 重新编译项目
echo.
echo 如果问题仍然存在，请尝试：
echo - 更新微信开发者工具到最新版本
echo - 删除用户缓存目录：
echo   %%LOCALAPPDATA%%\微信开发者工具\User Data\Default\Cache
echo.
pause
