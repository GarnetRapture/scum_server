@echo off
title SCUM Server Web Panel Launcher
echo ==========================================================
echo [SCUM Dedicated Server Web GUI Panel 구동기]
echo ==========================================================
echo - 웹 관리 패널 백엔드를 기동합니다.
echo - 구동 완료 후 웹브라우저(http://localhost:3000)를 자동으로 개방합니다.
echo ==========================================================

cd /d "%~dp0web_panel"
start http://localhost:3000
node server.js

pause
