@echo off
chcp 65001 >nul
title 出勤管理系統伺服器 (Attendance Server)
cd /d "%~dp0"

echo ========================================================
echo   🚀 出勤管理與專案看板系統伺服器
echo ========================================================
echo.

:: 1. 檢查並清理殘留的 3000 Port 處理序
echo [1/3] 正在檢查 3000 通訊埠狀態...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    if not "%%a"=="" (
        echo 偵測到通訊埠 3000 已被舊處理序 (PID: %%a) 佔用，正在關閉舊處理序...
        taskkill /F /PID %%a >nul 2>&1
    )
)
echo 通訊埠 3000 已就緒。
echo.

:: 2. 檢查是否需要前端打包 (dist 產物)
if not exist "dist\index.html" (
    echo [2/3] 首次執行或未找到前端打包檔案，正在建置生產版本 (npm run build)...
    call npm run build
    if errorlevel 1 (
        echo.
        echo ❌ 前端建置失敗，請檢查錯誤訊息。
        pause
        exit /b 1
    )
) else (
    echo [2/3] 前端生產版本 (dist/) 已就緒。
)
echo.

:: 3. 延遲 1.5 秒自動在預設瀏覽器開啟系統網址
start "" powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500; Start-Process 'http://localhost:3000'" >nul 2>&1

:: 4. 啟動後端伺服器 (前景執行，印出所有 Log)
echo [3/3] 正在啟動後端伺服器 (Port 3000)...
echo.
echo --------------------------------------------------------
echo 💡 操作提示：
echo   - 瀏覽器將於伺服器就緒後自動開啟。
echo   - 欲「關閉伺服器」，請直接關閉此命令視窗或按下 Ctrl+C。
echo --------------------------------------------------------
echo.

call npx tsx server.ts

:: 伺服器退出後的清理工作
echo.
echo 🛑 伺服器已停止運行。
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    if not "%%a"=="" (
        taskkill /F /PID %%a >nul 2>&1
    )
)
echo ✅ 通訊埠已安全釋放。
echo.
pause
