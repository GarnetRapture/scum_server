@echo off
title SCUM Server Settings Injector
echo ==========================================================
echo [SCUM Server Settings Auto-Injector]
echo ==========================================================
echo - Safely executing apply_server_settings.ps1...
echo ==========================================================

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply_server_settings.ps1"

pause
