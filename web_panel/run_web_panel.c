#include <windows.h>
#include <shellapi.h>
#include <stdio.h>
#include <string.h>

int APIENTRY WinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, LPSTR lpCmdLine, int nCmdShow) {
    ShellExecute(NULL, "open", "http://localhost:3000", NULL, NULL, SW_SHOWNORMAL);

    char path[MAX_PATH];
    GetModuleFileName(NULL, path, MAX_PATH);
    char *lastSlash = strrchr(path, '\\');
    if (lastSlash != NULL) {
        *lastSlash = '\0';
    }
    
    char cmd[MAX_PATH * 2];
    snprintf(cmd, sizeof(cmd), "cmd.exe /c node \"%s\\web_panel\\server.js\"", path);

    STARTUPINFO si;
    PROCESS_INFORMATION pi;
    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESHOWWINDOW;
    si.wShowWindow = SW_HIDE;

    ZeroMemory(&pi, sizeof(pi));

    if (CreateProcess(NULL, cmd, NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, path, &si, &pi)) {
        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
    } else {
        MessageBox(NULL, "Node.js 백엔드 패널 서비스를 실행하지 못했습니다.", "실행 실패", MB_OK | MB_ICONERROR);
        return 1;
    }

    return 0;
}
