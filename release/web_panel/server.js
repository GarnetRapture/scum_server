const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { Rcon } = require('rcon-client');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;
const CONFIG_FILE_PATH = path.resolve(__dirname, '../config.json');

app.use(express.json());
// Vite React 빌드 디렉터리를 static 폴더로 호스팅
app.use(express.static(path.join(__dirname, 'frontend/dist')));

// 헬퍼: config.json 로드
function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE_PATH)) {
        throw new Error("config.json 마스터 설정 파일이 누락되었습니다. 루트 디렉터리에 config.json을 올바르게 배치하십시오.");
    }
    return JSON.parse(fs.readFileSync(CONFIG_FILE_PATH, 'utf-8'));
}

// 헬퍼: config.json 저장
function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), 'utf-8');
}

// 동적 경로 도출 함수
function getPaths() {
    const config = loadConfig();
    const root = config.serverRootDir;
    return {
        serverSettings: path.join(root, 'scum_server_files/SCUM/Saved/Config/WindowsServer/ServerSettings.ini'),
        engineSettings: path.join(root, 'scum_server_files/SCUM/Saved/Config/WindowsServer/Engine.ini'),
        startBat: path.join(root, 'start_scum_server.bat')
    };
}

// 0. Config 조회 및 수정 API
app.get('/api/config', (req, res) => {
    try {
        const config = loadConfig();
        res.json({ success: true, config });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/config', (req, res) => {
    try {
        const { config } = req.body;
        saveConfig(config);
        res.json({ success: true, message: 'config.json 설정이 정상적으로 갱신되었습니다.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// SteamCMD 자동 다운로드 및 구성 API
app.post('/api/setup-steamcmd', (req, res) => {
    const config = loadConfig();
    const steamcmdPath = path.join(config.serverRootDir, 'steamcmd');
    
    // 윈도우 PowerShell 내장 유틸리티를 활용한 다운로드 및 압축 해제 처리
    const command = `powershell -NoProfile -ExecutionPolicy Bypass -Command "$OutputEncoding = [System.Text.Encoding]::UTF8; [Console]::OutputEncoding = [System.Text.Encoding]::UTF8; New-Item -ItemType Directory -Force -Path '${steamcmdPath}'; Invoke-WebRequest -Uri 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip' -OutFile '${steamcmdPath}\\steamcmd.zip'; Expand-Archive -Path '${steamcmdPath}\\steamcmd.zip' -DestinationPath '${steamcmdPath}' -Force; Remove-Item -Path '${steamcmdPath}\\steamcmd.zip'"`;
    
    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: '스팀 CMD가 해당 경로에 성공적으로 자동 다운로드 및 배치되었습니다.' });
    });
});

// 1. 서버 구동 상태 조회 API
app.get('/api/status', (req, res) => {
    exec('tasklist /FI "IMAGENAME eq SCUMServer.exe"', (err, stdout, stderr) => {
        if (err) {
            return res.json({ status: 'OFFLINE', error: err.message });
        }
        const isRunning = stdout.includes('SCUMServer.exe');
        res.json({
            status: isRunning ? 'ONLINE' : 'OFFLINE',
            uptime: isRunning ? '구동 중' : '중지됨'
        });
    });
});

// 2. 서버 구동 API
app.post('/api/start', (req, res) => {
    const paths = getPaths();
    const config = loadConfig();
    exec(`cmd.exe /c start /b "" "${paths.startBat}"`, { cwd: config.serverRootDir }, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: err.message });
        }
    });
    res.json({ success: true, message: '서버 시작 명령 전송 완료 (시작까지 약 1~2분 소요)' });
});

// 3. 서버 중지 API
app.post('/api/stop', (req, res) => {
    exec('powershell -NoProfile -ExecutionPolicy Bypass -Command "Stop-Process -Name SCUMServer -Force"', (err, stdout, stderr) => {
        if (err) {
            if (err.message.includes('Cannot find a process')) {
                return res.json({ success: true, message: '이미 중지된 상태입니다.' });
            }
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, message: '서버 프로세스 강제 종료 완료' });
    });
});

// INI 파싱 유틸리티 함수
function parseIni(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    const result = {};
    let currentSection = null;

    lines.forEach(line => {
        line = line.trim();
        if (line.startsWith('[') && line.endsWith(']')) {
            currentSection = line.substring(1, line.length - 1);
            result[currentSection] = {};
        } else if (line && !line.startsWith(';') && !line.startsWith('#')) {
            const index = line.indexOf('=');
            if (index !== -1 && currentSection) {
                const key = line.substring(0, index).trim();
                const value = line.substring(index + 1).trim();
                result[currentSection][key] = value;
            }
        }
    });
    return result;
}

// INI 파일 업데이트 유틸리티 함수
function writeIni(filePath, data) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    let currentSection = null;

    for (const section in data) {
        for (const key in data[section]) {
            const value = data[section][key];
            const pattern = new RegExp(`^${key.replace(/\./g, '\\.')}=.*`);
            let sectionIndex = -1;
            let keyUpdated = false;

            for (let i = 0; i < lines.length; i++) {
                const trimmed = lines[i].trim();
                if (trimmed === `[${section}]`) {
                    sectionIndex = i;
                }
                if (sectionIndex !== -1 && trimmed.startsWith('[') && trimmed !== `[${section}]`) {
                    break;
                }
                if (sectionIndex !== -1 && lines[i].match(pattern)) {
                    lines[i] = `${key}=${value}`;
                    keyUpdated = true;
                    break;
                }
            }

            if (!keyUpdated && sectionIndex !== -1) {
                lines.splice(sectionIndex + 1, 0, `${key}=${value}`);
            }
        }
    }

    fs.writeFileSync(filePath, lines.join('\r\n'), 'utf-8');
}

// 4. 설정 조회 API (ServerSettings.ini & Engine.ini)
app.get('/api/settings', (req, res) => {
    try {
        const paths = getPaths();
        const serverSettings = fs.existsSync(paths.serverSettings) ? parseIni(paths.serverSettings) : {};
        const engineSettings = fs.existsSync(paths.engineSettings) ? parseIni(paths.engineSettings) : {};
        
        const currentConfig = loadConfig();
        
        // 물리 INI 파일이 유효하지 않을 경우를 위한 config.json 마스터 백업 폴백 제공
        res.json({
            success: true,
            server: Object.keys(serverSettings).length > 0 ? serverSettings : (currentConfig.server || {}),
            engine: Object.keys(engineSettings).length > 0 ? engineSettings : (currentConfig.engine || {})
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 5. 설정 반영 API
app.post('/api/settings', (req, res) => {
    try {
        const paths = getPaths();
        const { server, engine } = req.body;
        
        // 1. INI 파일 직접 변경 (다중 섹션의 모든 키에 대해 루프 적용)
        if (server) {
            for (const section in server) {
                writeIni(paths.serverSettings, { [section]: server[section] });
            }
        }
        if (engine) {
            for (const section in engine) {
                writeIni(paths.engineSettings, { [section]: engine[section] });
            }
        }
        
        // 2. config.json 설정 동기화 저장
        const currentConfig = loadConfig();
        if (server) {
            currentConfig.server = { ...currentConfig.server, ...server };
        }
        if (engine) {
            currentConfig.engine = { ...currentConfig.engine, ...engine };
        }
        saveConfig(currentConfig);

        res.json({ success: true, message: '설정이 물리 INI 및 config.json에 정상 동기화되었습니다. (서버 재시작 필요)' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 6. 전역 RCON & 플레이어 위치 트래킹 게이트웨이
let activeRcon = null;
let cachedPlayers = [];

// 백그라운드 트래킹 루프 (재귀적 setTimeout 구조로 동시성 중첩 및 메모리 누수 원천 제거)
async function updatePlayersLocation() {
    if (!activeRcon || !activeRcon.connected) {
        setTimeout(updatePlayersLocation, 8000);
        return;
    }
    try {
        const listOutput = await activeRcon.send("#ListPlayers");
        const names = parsePlayerNames(listOutput);
        const tempPlayers = [];
        
        for (const name of names) {
            if (!activeRcon || !activeRcon.connected) break;
            const locOutput = await activeRcon.send(`#Location ${name}`);
            const coords = parseCoords(locOutput);
            if (coords) {
                tempPlayers.push({ name, ...coords });
            }
        }
        cachedPlayers = tempPlayers;
    } catch (err) {
        console.error("실시간 플레이어 좌표 동기화 실패:", err.message);
    } finally {
        setTimeout(updatePlayersLocation, 8000);
    }
}

// 8초 주기로 플레이어 위치 갱신 예약 시작
setTimeout(updatePlayersLocation, 8000);

function parsePlayerNames(output) {
    const names = [];
    if (!output) return names;
    const lines = output.split(/\r?\n/);
    lines.forEach(line => {
        let match = line.match(/^\d+\.\s+([^\(]+)\s+\(/);
        if (match) {
            names.push(match[1].trim());
        } else {
            match = line.match(/Name:\s+([^,]+)/);
            if (match) {
                names.push(match[1].trim());
            }
        }
    });
    return names;
}

function parseCoords(output) {
    if (!output) return null;
    const match = output.match(/X=([-\d\.]+)\s+Y=([-\d\.]+)\s+Z=([-\d\.]+)/);
    if (match) {
        return {
            x: Math.round(parseFloat(match[1])),
            y: Math.round(parseFloat(match[2])),
            z: Math.round(parseFloat(match[3]))
        };
    }
    return null;
}

// 실시간 플레이어 위치 정보 반환 API
app.get('/api/players-locations', (req, res) => {
    res.json({
        success: true,
        players: cachedPlayers
    });
});

// WebSocket RCON 게이트웨이
wss.on('connection', (ws) => {
    console.log('클라이언트 웹소켓 연결 성공');

    if (activeRcon && activeRcon.connected) {
        ws.send(JSON.stringify({ type: 'status', success: true, message: 'RCON이 이미 연결되어 있습니다.' }));
    }

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === 'connect') {
                const { host, port, password } = data;
                
                if (activeRcon) {
                    try { await activeRcon.end(); } catch (e) {}
                }

                activeRcon = new Rcon({ host, port: parseInt(port), password });
                await activeRcon.connect();
                
                ws.send(JSON.stringify({ type: 'status', success: true, message: 'RCON 연결에 성공했습니다.' }));
            } else if (data.type === 'command') {
                if (!activeRcon || !activeRcon.connected) {
                    return ws.send(JSON.stringify({ type: 'response', success: false, output: 'RCON이 연결되어 있지 않습니다.' }));
                }
                const output = await activeRcon.send(data.command);
                ws.send(JSON.stringify({ type: 'response', success: true, output }));
            }
        } catch (err) {
            ws.send(JSON.stringify({ type: 'error', message: `에러 발생: ${err.message}` }));
            if (activeRcon) {
                try { await activeRcon.end(); } catch (e) {}
                activeRcon = null;
            }
        }
    });

    ws.on('close', () => {
        console.log('클라이언트 웹소켓 연결 해제');
        if (activeRcon) {
            activeRcon.end().catch(() => {});
            activeRcon = null;
        }
    });
});

server.listen(PORT, () => {
    console.log(`SCUM 서버 관리 웹 패널이 포트 ${PORT}에서 실행 중입니다.`);
});
