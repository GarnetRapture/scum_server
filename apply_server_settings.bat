@echo off
echo ==========================================================
echo [SCUM 서버 최적화 설정 자동 주입기]
echo ==========================================================
echo - apply_server_settings.ps1 스크립트를 안전하게 호출합니다.
echo ==========================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply_server_settings.ps1"

pause
