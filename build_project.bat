@echo off
title SCUM Server Web Panel Project Builder
echo ==========================================================
echo [SCUM Dedicated Server Web GUI - Full Project Builder]
echo ==========================================================

:: 1. Frontend Build
echo [*] Step 1: Building frontend assets...
cd /d "%~dp0web_panel\frontend"
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Frontend build failed.
    goto error
)
echo [OK] Frontend build succeeded.

:: 2. Resource & Executable Compilation
echo [*] Step 2: Compiling metadata and linking launcher...
cd /d "%~dp0web_panel"

windres resource.rc -O coff -o resource.res
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Resource compilation failed.
    goto error
)

gcc -O2 run_web_panel.c resource.res -o ..\run_web_panel.exe -mwindows
if %ERRORLEVEL% neq 0 (
    echo [ERROR] GCC compiler linking failed.
    goto error
)

:: Clean intermediate object files
del resource.res
echo [OK] run_web_panel.exe launcher built successfully.

:: 3. Packing Release Distribution Folder
echo [*] Step 3: Generating clean release distribution...
set RELEASE_DIR=%~dp0release
if exist "%RELEASE_DIR%" rd /s /q "%RELEASE_DIR%"
md "%RELEASE_DIR%"
md "%RELEASE_DIR%\web_panel"
md "%RELEASE_DIR%\web_panel\frontend"
md "%RELEASE_DIR%\web_panel\frontend\dist"

:: Copy Root Executables & Scripts
copy "%~dp0run_web_panel.exe" "%RELEASE_DIR%" > nul
copy "%~dp0start_scum_server.bat" "%RELEASE_DIR%" > nul
copy "%~dp0update_scum_server.bat" "%RELEASE_DIR%" > nul
copy "%~dp0apply_server_settings.bat" "%RELEASE_DIR%" > nul
copy "%~dp0apply_server_settings.ps1" "%RELEASE_DIR%" > nul
copy "%~dp0steamcmd_script.txt" "%RELEASE_DIR%" > nul
copy "%~dp0config.json" "%RELEASE_DIR%" > nul
if exist "%~dp0README.md" copy "%~dp0README.md" "%RELEASE_DIR%" > nul
if exist "%~dp0LICENSE" copy "%~dp0LICENSE" "%RELEASE_DIR%" > nul
if exist "%~dp0docs" xcopy "%~dp0docs" "%RELEASE_DIR%\docs" /e /h /y > nul

:: Copy Backend Source files
copy "%~dp0web_panel\server.js" "%RELEASE_DIR%\web_panel" > nul
copy "%~dp0web_panel\package.json" "%RELEASE_DIR%\web_panel" > nul
copy "%~dp0web_panel\package-lock.json" "%RELEASE_DIR%\web_panel" > nul

:: Copy Frontend distribution build files
xcopy "%~dp0web_panel\frontend\dist" "%RELEASE_DIR%\web_panel\frontend\dist" /e /h /y > nul
echo [OK] Release folder generated at: %RELEASE_DIR%

echo ==========================================================
echo [SUCCESS] Project build and packaging completed.
echo ==========================================================
goto end

:error
echo ==========================================================
echo [FAILURE] Build pipeline aborted due to errors.
echo ==========================================================

:end
pause
