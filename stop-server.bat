@echo off
chcp 65001 >nul
title 停止出勤管理系統伺服器 (Stop Server)
cd /d "%~dp0"

echo ========================================================
echo   🛑 正在停止出勤管理系統伺服器...
echo ========================================================
echo.

set FOUND=0
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    if not "%%a"=="" (
        set FOUND=1
        echo 偵測到伺服器處理序 (PID: %%a)，正在終止...
        taskkill /F /PID %%a >nul 2>&1
        echo ✅ 已成功停止處理序 (PID: %%a)。
    )
)

if "%FOUND%"=="0" (
    echo ℹ️ 目前沒有偵測到佔用 3000 通訊埠的伺服器。
) else (
    echo.
    echo ✅ 伺服器已完全關閉，通訊埠 3000 已釋放。
)

echo.
timeout /t 3 >nul
exit /b 0
