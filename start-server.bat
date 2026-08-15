@echo off
chcp 65001 >nul
title 出勤管理系統伺服器 (Attendance Server)
echo ========================================================
echo   出勤管理系統伺服器 (Attendance System Server)
echo ========================================================
echo.
echo 正在檢查與啟動伺服器...
echo.

npm run server

pause
