@echo off
set STEAMCMD_DIR=%~dp0steamcmd
set INSTALL_DIR=%~dp0scum_server_files

"%STEAMCMD_DIR%\steamcmd.exe" +@sSteamCmdForcePlatformType windows +force_install_dir "%INSTALL_DIR%" +login anonymous +app_update 3792580 validate +quit

pause