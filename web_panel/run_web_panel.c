#include <windows.h>
#include <stdio.h>
#include <string.h>

PROCESS_INFORMATION pi;
BOOL bProcessRunning = FALSE;

// 헬퍼: 자식 프로세스 트리를 강제 박멸하여 포트 및 리소스를 완벽히 정리
void TerminateProcessTree(DWORD pid) {
    char killCmd[128];
    // /F(강제 종료) /T(자식 프로세스 트리 전체 소거) 플래그를 사용하여 포트 점유를 원천 해결
    snprintf(killCmd, sizeof(killCmd), "taskkill /f /t /pid %d", (int)pid);
    
    STARTUPINFO siKill;
    PROCESS_INFORMATION piKill;
    ZeroMemory(&siKill, sizeof(siKill));
    siKill.cb = sizeof(siKill);
    siKill.dwFlags = STARTF_USESHOWWINDOW;
    siKill.wShowWindow = SW_HIDE;
    ZeroMemory(&piKill, sizeof(piKill));
    
    if (CreateProcess(NULL, killCmd, NULL, NULL, FALSE, CREATE_NO_WINDOW, NULL, NULL, &siKill, &piKill)) {
        WaitForSingleObject(piKill.hProcess, 2000); // taskkill 완료 대기
        CloseHandle(piKill.hProcess);
        CloseHandle(piKill.hThread);
    } else {
        // taskkill 호출 실패 시 일반 TerminateProcess 백업 기동
        TerminateProcess(pi.hProcess, 0);
    }
}

// 콘솔 닫기 버튼 클릭 감지 처리기
BOOL WINAPI ConsoleHandler(DWORD CntrlEvent) {
    if (CntrlEvent == CTRL_CLOSE_EVENT || CntrlEvent == CTRL_C_EVENT) {
        if (bProcessRunning) {
            TerminateProcessTree(pi.dwProcessId);
            CloseHandle(pi.hProcess);
            CloseHandle(pi.hThread);
            bProcessRunning = FALSE;
        }
        return TRUE;
    }
    return FALSE;
}

int main() {
    // 중복 실행 방지 뮤텍스
    HANDLE hMutex = CreateMutex(NULL, TRUE, "SCUM_Web_Panel_Launcher_Mutex");
    if (GetLastError() == ERROR_ALREADY_EXISTS) {
        printf("[INFO] SCUM Web Panel is already running.\n");
        printf("Please find the existing command console window on your desktop.\n");
        printf("Press Enter key to exit...");
        getchar();
        return 0;
    }

    SetConsoleCtrlHandler(ConsoleHandler, TRUE);

    printf("==========================================================\n");
    printf("[SCUM Dedicated Server Web GUI Panel Console Launcher]\n");
    printf("==========================================================\n");
    printf("[*] Starting backend database and server logs stream...\n");

    // 대시보드 브라우저 자동 오픈 (관리자 권한 승격 상태에서 크롬 차단 방지를 위해 explorer.exe에 위임)
    ShellExecute(NULL, "open", "explorer.exe", "http://localhost:3000", NULL, SW_SHOWNORMAL);

    char path[MAX_PATH];
    GetModuleFileName(NULL, path, MAX_PATH);
    char *lastSlash = strrchr(path, '\\');
    if (lastSlash != NULL) {
        *lastSlash = '\0';
    }
    
    char cmd[MAX_PATH * 2];
    snprintf(cmd, sizeof(cmd), "node \"%s\\web_panel\\server.js\"", path);

    STARTUPINFO si;
    ZeroMemory(&si, sizeof(si));
    si.cb = sizeof(si);
    si.dwFlags = STARTF_USESTDHANDLES;
    si.hStdInput = GetStdHandle(STD_INPUT_HANDLE);
    si.hStdOutput = GetStdHandle(STD_OUTPUT_HANDLE);
    si.hStdError = GetStdHandle(STD_ERROR_HANDLE);

    ZeroMemory(&pi, sizeof(pi));

    // 시작 시간 기록
    DWORD startTime = GetTickCount();

    if (CreateProcess(NULL, cmd, NULL, NULL, TRUE, 0, NULL, path, &si, &pi)) {
        bProcessRunning = TRUE;
        printf("[OK] Backend node process attached successfully (PID: %d).\n", (int)pi.dwProcessId);
        printf("[*] Logs stream active. DO NOT close this window unless you want to stop the server.\n");
        printf("==========================================================\n\n");

        // 자식 프로세스 종료 시까지 스레드 블로킹 대기
        WaitForSingleObject(pi.hProcess, INFINITE);

        if (bProcessRunning) {
            TerminateProcessTree(pi.dwProcessId);
            bProcessRunning = FALSE;
        }
        
        // 실행 후 종료 시간 검사 (3초 이내에 죽은 경우 비정상 기동으로 판단)
        DWORD duration = GetTickCount() - startTime;
        if (duration < 3000) {
            printf("\n[ERROR] Backend node process terminated unexpectedly fast (under 3 seconds).\n");
            printf("----------------------------------------------------------\n");
            printf("Potential Causes:\n");
            printf(" 1. Node.js is not globally installed or path is not set.\n");
            printf(" 2. Port 3000 is already in use by another process.\n");
            printf(" 3. config.json at the root contains invalid JSON or paths.\n");
            printf("----------------------------------------------------------\n");
            printf("Press Enter key to exit this console window...");
            getchar();
        }

        CloseHandle(pi.hProcess);
        CloseHandle(pi.hThread);
    } else {
        printf("\n[FATAL ERROR] Failed to launch Node.js child process.\n");
        printf("Command attempted: %s\n\n", cmd);
        printf("Please ensure NodeJS is installed on your Windows PC and 'node' command is accessible.\n");
        printf("Press Enter key to exit this console window...");
        getchar();
    }

    ReleaseMutex(hMutex);
    CloseHandle(hMutex);
    return 0;
}
