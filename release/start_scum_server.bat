@echo off
set SERVER_BIN_DIR=%~dp0scum_server_files\SCUM\Binaries\Win64

cd /d "%SERVER_BIN_DIR%"

echo ==========================================================
echo [SCUM Dedicated Server 구동기 (서버/클라 동시 구동 최적화)]
echo ==========================================================
echo - 할당 CPU 코어: 0, 1, 2, 3번 프로세서 강제 지정 (/affinity F)
echo - 게임 클라이언트 및 OS에 나머지 4~15번 코어를 보장하여 렉 발생을 방지합니다.
echo ==========================================================

start "" /affinity F "%SERVER_BIN_DIR%\SCUM_Server.exe" -log -USEALLAVAILABLECORES -unattended -NoSafemode

pause
