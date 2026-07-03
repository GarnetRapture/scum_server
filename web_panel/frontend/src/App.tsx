import { useState, useEffect, useRef } from 'react';

type RconLogEntry = {
  type: 'info' | 'response' | 'error' | 'command';
  text: string;
};

type ServerSettings = {
  [key: string]: string;
};

type EngineSettings = {
  [key: string]: string;
};

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'rcon' | 'map'>('dashboard');
  const [serverStatus, setServerStatus] = useState<'ONLINE' | 'OFFLINE' | 'CHECKING'>('CHECKING');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Settings State
  const [serverSettings, setServerSettings] = useState<ServerSettings>({});
  const [engineSettings, setEngineSettings] = useState<EngineSettings>({});

  // RCON State
  const [rconHost, setRconHost] = useState('127.0.0.1');
  const [rconPort, setRconPort] = useState('7777');
  const [rconPassword, setRconPassword] = useState('ramker7792');
  const [rconConnected, setRconConnected] = useState(false);
  const [rconLogs, setRconLogs] = useState<RconLogEntry[]>([]);
  const [rconInput, setRconInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Map State
  const [mapCoords, setMapCoords] = useState({ x: 0, y: 0, z: 20000 });
  const [markerPos, setMarkerPos] = useState<{ top: string; left: string } | null>(null);
  const mapCanvasRef = useRef<HTMLDivElement | null>(null);

  // Status Polling
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/status');
        const data = await res.json();
        setServerStatus(data.status);
      } catch (err) {
        setServerStatus('OFFLINE');
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Settings Loading
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab]);

  // Terminal Auto Scroll
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rconLogs]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success) {
        setServerSettings(data.server);
        setEngineSettings(data.engine);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupSteamCMD = async () => {
    setLoading(true);
    setMessage("스팀 CMD 다운로드 및 설치 진행 중... (약 15초 소요)");
    try {
      const res = await fetch('/api/setup-steamcmd', { method: 'POST' });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage("스팀 CMD 자동 다운로드 실패");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/start', { method: 'POST' });
      const data = await res.json();
      setMessage(data.message);
      setServerStatus('CHECKING');
    } catch (err) {
      setMessage('서버 시작 명령 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stop', { method: 'POST' });
      const data = await res.json();
      setMessage(data.message);
      setServerStatus('OFFLINE');
    } catch (err) {
      setMessage('서버 중지 명령 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server: serverSettings, engine: engineSettings })
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('설정 저장 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleRconConnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'connect',
        host: rconHost,
        port: rconPort,
        password: rconPassword
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'status') {
        setRconConnected(data.success);
        setRconLogs(prev => [...prev, { type: 'info', text: data.message }]);
      } else if (data.type === 'response') {
        setRconLogs(prev => [...prev, { type: 'response', text: data.output }]);
      } else if (data.type === 'error') {
        setRconLogs(prev => [...prev, { type: 'error', text: data.message }]);
        setRconConnected(false);
      }
    };

    ws.onclose = () => {
      setRconConnected(false);
      setRconLogs(prev => [...prev, { type: 'info', text: 'RCON 웹소켓 세션이 종료되었습니다.' }]);
    };
  };

  const handleSendRconCommand = (cmdText?: string) => {
    const command = cmdText || rconInput;
    if (!command.trim() || !wsRef.current || !rconConnected) return;

    setRconLogs(prev => [...prev, { type: 'command', text: `> ${command}` }]);
    wsRef.current.send(JSON.stringify({
      type: 'command',
      command
    }));
    if (!cmdText) setRconInput('');
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapCanvasRef.current) return;
    const rect = mapCanvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // SCUM 실제 좌표계: 가로/세로 약 12km (각 변 -300000 ~ +300000)
    // 맵 이미지 중심을 0,0으로 매핑
    const xRatio = clickX / rect.width;
    const yRatio = clickY / rect.height;

    const gameX = Math.round((xRatio - 0.5) * 600000);
    const gameY = Math.round((yRatio - 0.5) * 600000);

    setMapCoords(prev => ({ ...prev, x: gameX, y: gameY }));
    setMarkerPos({
      top: `${(yRatio * 100).toFixed(2)}%`,
      left: `${(xRatio * 100).toFixed(2)}%`
    });

    const cmd = `#teleport ${gameX} ${gameY} ${mapCoords.z}`;
    navigator.clipboard.writeText(cmd);
    setMessage(`클립보드 복사 완료: ${cmd}`);
  };

  const handleSettingChange = (section: 'server' | 'engine', key: string, val: string | boolean) => {
    const strVal = typeof val === 'boolean' ? (val ? 'True' : 'False') : val;
    if (section === 'server') {
      setServerSettings(prev => ({ ...prev, [key]: strVal }));
    } else {
      setEngineSettings(prev => ({ ...prev, [key]: strVal }));
    }
  };

  const getTeleportCmd = () => {
    return `#teleport ${mapCoords.x} ${mapCoords.y} ${mapCoords.z}`;
  };

  return (
    <div className="glass w-full max-w-7xl h-[850px] rounded-3xl shadow-2xl flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/40 flex flex-col p-6">
        <div className="flex flex-col gap-2 mb-10">
          <span className="font-heading text-2xl font-extrabold tracking-wider text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">SCUM PANEL</span>
          <span className={`self-start text-[10px] font-semibold px-2.5 py-0.5 rounded-full border tracking-wider shadow-sm uppercase ${
            serverStatus === 'ONLINE' ? 'bg-green-500/10 text-neon-green border-green-500/20 shadow-green-500/10' :
            serverStatus === 'OFFLINE' ? 'bg-red-500/10 text-neon-red border-red-500/20 shadow-red-500/10' :
            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-yellow-500/10'
          }`}>
            {serverStatus}
          </span>
        </div>

        <nav className="flex flex-col gap-2.5 flex-grow">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
              activeTab === 'dashboard' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue shadow-[inset_5px_0_10px_rgba(0,240,255,0.03)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📊</span> 대시보드
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
              activeTab === 'settings' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue shadow-[inset_5px_0_10px_rgba(0,240,255,0.03)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>⚙️</span> 서버 설정
          </button>
          <button 
            onClick={() => setActiveTab('rcon')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
              activeTab === 'rcon' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue shadow-[inset_5px_0_10px_rgba(0,240,255,0.03)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>💻</span> RCON 콘솔
          </button>
          <button 
            onClick={() => setActiveTab('map')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
              activeTab === 'map' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue shadow-[inset_5px_0_10px_rgba(0,240,255,0.03)]' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🗺️</span> 텔레포트 맵
          </button>
        </nav>

        <div className="text-[11px] text-gray-500 leading-relaxed font-mono">
          <p>Host: Ryzen 5800X / 64GB</p>
          <p>&copy; Antigravity Web Panel</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-10 overflow-y-auto relative">
        {/* Toast Notification */}
        {message && (
          <div className="absolute top-6 right-6 bg-black/80 border border-white/10 text-neon-blue text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-bounce">
            <span>🔔</span> {message}
            <button onClick={() => setMessage(null)} className="text-white hover:text-gray-400 font-bold ml-2">X</button>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="flex flex-col gap-8 h-full">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white mb-2">서버 제어 및 상태 모니터링</h1>
              <p className="text-gray-400 text-sm">스컴 전용 서버의 프로세스 상태 제어 및 하드웨어 자원을 확인합니다.</p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Power Control Panel */}
              <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-md">
                <h2 className="text-lg font-bold text-white border-l-3 border-neon-blue pl-2">전원 컨트롤</h2>
                <div className="flex gap-4">
                  <button 
                    onClick={handleStart} 
                    disabled={loading || serverStatus === 'ONLINE'} 
                    className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                  >
                    서버 켜기
                  </button>
                  <button 
                    onClick={handleStop} 
                    disabled={loading || serverStatus === 'OFFLINE'} 
                    className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  >
                    서버 끄기
                  </button>
                </div>
                <div className="border-t border-white/10 pt-4 text-sm text-gray-400 flex flex-col gap-2 font-mono">
                  <p>프로세스 감지 상태: <span className={serverStatus === 'ONLINE' ? 'text-neon-green font-bold' : 'text-neon-red font-bold'}>{serverStatus}</span></p>
                  <p>연결 바인딩 포트: <span className="text-neon-blue">UDP 7777 - 7779 (RCON: TCP 7777)</span></p>
                  <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1.5">
                    <span className="text-[10px] text-gray-500 uppercase font-bold">최초 설치 및 셋업</span>
                    <button 
                      onClick={handleSetupSteamCMD}
                      disabled={loading}
                      className="bg-blue-700/80 hover:bg-blue-600 disabled:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all text-xs text-center"
                    >
                      ⚙️ 스팀 CMD 자동 다운로드 및 구성
                    </button>
                  </div>
                </div>
              </div>

              {/* Hardware Monitoring Panel */}
              <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-md">
                <h2 className="text-lg font-bold text-white border-l-3 border-neon-blue pl-2 font-heading">시스템 리소스 격리</h2>
                <div className="flex flex-col gap-3 font-mono">
                  <div className="flex justify-between p-3.5 bg-white/5 border border-white/5 rounded-lg">
                    <span className="text-gray-400">지정 CPU 코어 (0-3번)</span>
                    <span className="text-neon-blue font-semibold">4스레드 고정 (/affinity F)</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-white/5 border border-white/5 rounded-lg">
                    <span className="text-gray-400">물리 메모리 버퍼</span>
                    <span className="text-white font-semibold">64GB RAM 설치</span>
                  </div>
                  <div className="flex justify-between p-3.5 bg-white/5 border border-white/5 rounded-lg">
                    <span className="text-gray-400">저장 공간 상태 (D:)</span>
                    <span className="text-white font-semibold">474 GB 여유 여유</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white mb-2">서버 설정 관리</h1>
              <p className="text-gray-400 text-sm">ServerSettings.ini 및 Engine.ini 파일의 변수를 직접 조율합니다.</p>
            </div>

            <form className="border border-white/10 bg-white/5 rounded-2xl p-8 flex flex-col gap-6 shadow-lg">
              <div className="grid grid-cols-2 gap-8 max-h-[480px] overflow-y-auto pr-2">
                {/* Section 1: Server Config */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 font-heading text-sm uppercase tracking-wider">1. 서버 기본 및 암호</h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">서버 이름</label>
                    <input 
                      type="text" 
                      value={serverSettings['scum.ServerName'] || ''} 
                      onChange={(e) => handleSettingChange('server', 'scum.ServerName', e.target.value)}
                      className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">접속 암호</label>
                    <input 
                      type="text" 
                      value={serverSettings['scum.ServerPassword'] || ''} 
                      onChange={(e) => handleSettingChange('server', 'scum.ServerPassword', e.target.value)}
                      className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">최대 플레이어 수</label>
                      <input 
                        type="number" 
                        value={serverSettings['scum.MaxPlayers'] || ''} 
                        onChange={(e) => handleSettingChange('server', 'scum.MaxPlayers', e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">허용 최대 핑 (ms)</label>
                      <input 
                        type="number" 
                        value={serverSettings['scum.MaxPing'] || ''} 
                        onChange={(e) => handleSettingChange('server', 'scum.MaxPing', e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Tuning & AI */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 font-heading text-sm uppercase tracking-wider">2. 서버 최적화 및 몹 제한</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">서버 FPS 한도</label>
                      <input 
                        type="number" 
                        value={serverSettings['scum.ServerFPSLimit'] || ''} 
                        onChange={(e) => handleSettingChange('server', 'scum.ServerFPSLimit', e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">동물 스폰 한도</label>
                      <input 
                        type="number" 
                        value={serverSettings['scum.MaxAnimalsOnServer'] || ''} 
                        onChange={(e) => handleSettingChange('server', 'scum.MaxAnimalsOnServer', e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">차량 최대 스폰 수</label>
                    <input 
                      type="number" 
                      value={serverSettings['scum.MaxAllowedVehicles'] || ''} 
                      onChange={(e) => handleSettingChange('server', 'scum.MaxAllowedVehicles', e.target.value)}
                      className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-3 mt-2">
                    <label className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={serverSettings['scum.DisableSentrySpawning'] === 'True'} 
                        onChange={(e) => handleSettingChange('server', 'scum.DisableSentrySpawning', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-neon-blue bg-black/30 focus:ring-0 focus:outline-none"
                      />
                      로봇(센트리) 스폰 차단
                    </label>
                    <label className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={serverSettings['scum.DisableSuicidePuppetSpawning'] === 'True'} 
                        onChange={(e) => handleSettingChange('server', 'scum.DisableSuicidePuppetSpawning', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-neon-blue bg-black/30 focus:ring-0 focus:outline-none"
                      />
                      자폭 좀비(Beep Zombie) 차단
                    </label>
                  </div>
                </div>

                {/* Section 3: Cargo Drop */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 font-heading text-sm uppercase tracking-wider">3. 공중 보급 설정</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">보급 최소 주기 (분)</label>
                      <input 
                        type="number" 
                        value={serverSettings['scum.CargoDropCooldownMinimum'] || ''} 
                        onChange={(e) => handleSettingChange('server', 'scum.CargoDropCooldownMinimum', e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">보급 최대 주기 (분)</label>
                      <input 
                        type="number" 
                        value={serverSettings['scum.CargoDropCooldownMaximum'] || ''} 
                        onChange={(e) => handleSettingChange('server', 'scum.CargoDropCooldownMaximum', e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">보급상자 자폭 대기 시간 (초)</label>
                    <input 
                      type="number" 
                      value={serverSettings['scum.CargoDropSelfDestructTime'] || ''} 
                      onChange={(e) => handleSettingChange('server', 'scum.CargoDropSelfDestructTime', e.target.value)}
                      className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section 4: Unreal Engine & Stuttering Optimization */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 font-heading text-sm uppercase tracking-wider">4. 언리얼 엔진 최적화</h3>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={engineSettings['gc.CreateGarbageCollectorUObjectClusters'] === 'True'} 
                        onChange={(e) => handleSettingChange('engine', 'gc.CreateGarbageCollectorUObjectClusters', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-neon-blue bg-black/30 focus:ring-0 focus:outline-none"
                      />
                      가비지 컬렉터 UObject 클러스터 활성화
                    </label>
                    <label className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={engineSettings['gc.ActorClusteringEnabled'] === 'True'} 
                        onChange={(e) => handleSettingChange('engine', 'gc.ActorClusteringEnabled', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-neon-blue bg-black/30 focus:ring-0 focus:outline-none"
                      />
                      액터 클러스터링(Actor Clustering) 사용
                    </label>
                    <label className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={engineSettings['s.AsyncLoadingThreadEnabled'] === 'True'} 
                        onChange={(e) => handleSettingChange('engine', 's.AsyncLoadingThreadEnabled', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-neon-blue bg-black/30 focus:ring-0 focus:outline-none"
                      />
                      비동기 리소스 로드 스레드 사용
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex justify-end">
                <button 
                  type="button" 
                  onClick={handleSaveSettings}
                  className="bg-green-700 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-all"
                >
                  설정 파일에 즉시 저장
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RCON Console Tab */}
        {activeTab === 'rcon' && (
          <div className="flex flex-col gap-8 h-full">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white mb-2">RCON 원격 통신 콘솔</h1>
              <p className="text-gray-400 text-sm">실시간 RCON 브릿지를 이용해 원격 서버 제어 및 공지 전송을 처리합니다.</p>
            </div>

            <div className="grid grid-cols-[280px_1fr] gap-8 h-[520px]">
              {/* RCON Credentials */}
              <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-md">
                <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 text-sm uppercase">RCON 연결 설정</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">호스트 IP</label>
                  <input 
                    type="text" 
                    value={rconHost} 
                    onChange={(e) => setRconHost(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">포트 (TCP)</label>
                  <input 
                    type="number" 
                    value={rconPort} 
                    onChange={(e) => setRconPort(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-gray-500 uppercase font-bold">패스워드</label>
                  <input 
                    type="password" 
                    value={rconPassword} 
                    onChange={(e) => setRconPassword(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
                  />
                </div>
                <button 
                  onClick={handleRconConnect}
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-all mt-2"
                >
                  RCON 연결
                </button>
                <div className={`text-center font-bold text-xs mt-2 ${rconConnected ? 'text-neon-green' : 'text-neon-red'}`}>
                  {rconConnected ? '연결 성공' : '연결 해제됨'}
                </div>
              </div>

              {/* RCON Console Output & Input */}
              <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-md h-full">
                <div className="flex justify-between items-center">
                  <span className="font-heading text-xs text-gray-500 uppercase tracking-widest">Console Shell</span>
                  <button 
                    onClick={() => setRconLogs([])}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded"
                  >
                    출력 비우기
                  </button>
                </div>

                {/* Console window */}
                <div className="flex-grow bg-black/60 border border-white/10 rounded-lg p-4 overflow-y-auto font-mono text-xs text-green-400 flex flex-col gap-2 shadow-inner">
                  {rconLogs.map((log, idx) => (
                    <p key={idx} className={
                      log.type === 'error' ? 'text-neon-red' :
                      log.type === 'info' ? 'text-gray-400' :
                      log.type === 'command' ? 'text-neon-blue' : ''
                    }>
                      {log.text}
                    </p>
                  ))}
                  <div ref={terminalEndRef} />
                </div>

                {/* Input Bar */}
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={rconInput}
                    disabled={!rconConnected}
                    onChange={(e) => setRconInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendRconCommand()}
                    placeholder={rconConnected ? "명령어 입력... (예: #ListPlayers 또는 #Announce 환영합니다)" : "먼저 RCON을 연결하십시오."}
                    className="flex-grow bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none"
                  />
                  <button 
                    onClick={() => handleSendRconCommand()}
                    disabled={!rconConnected}
                    className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 text-white px-5 py-2.5 rounded-lg transition-all"
                  >
                    전송
                  </button>
                </div>

                {/* Macros */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>매크로 단축키:</span>
                  <button onClick={() => handleSendRconCommand('#ListPlayers')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50">접속자 정보</button>
                  <button onClick={() => handleSendRconCommand('#Save')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50">서버 저장</button>
                  <button onClick={() => handleSendRconCommand('#ListVehicles')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50">차량 목록</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Helper Tab */}
        {activeTab === 'map' && (
          <div className="flex flex-col gap-8 h-full">
            <div>
              <h1 className="font-heading text-3xl font-bold text-white mb-2">인터랙티브 텔레포트 맵 헬퍼</h1>
              <p className="text-gray-400 text-sm">맵의 임의 지점을 좌클릭하여 인게임 텔레포트 복사용 절대 좌표를 파싱합니다.</p>
            </div>

            <div className="grid grid-cols-[1fr_340px] gap-8 h-[520px]">
              {/* Virtual Map grid */}
              <div className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden relative">
                <div 
                  ref={mapCanvasRef}
                  onClick={handleMapClick}
                  className="w-full h-full cursor-crosshair bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] flex items-center justify-center relative select-none"
                >
                  {markerPos && (
                    <div 
                      className="absolute w-3.5 h-3.5 bg-neon-blue rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#00f0ff,0_0_20px_#00f0ff] animate-ping"
                      style={{ top: markerPos.top, left: markerPos.left }}
                    />
                  )}
                  {markerPos && (
                    <div 
                      className="absolute w-3.5 h-3.5 bg-neon-blue rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#00f0ff,0_0_20px_#00f0ff]"
                      style={{ top: markerPos.top, left: markerPos.left }}
                    />
                  )}
                  <span className="font-heading text-xs tracking-widest text-white/10 pointer-events-none">SCUM 12KM WORLD GRID</span>
                </div>
              </div>

              {/* Coordinates parsing */}
              <div className="flex flex-col gap-5 justify-between">
                <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-md">
                  <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 text-sm">텔레포트 좌표 연동</h3>
                  <div className="bg-black/30 border border-white/10 rounded-lg p-4 flex flex-col gap-2 font-mono text-sm">
                    <p>게임 X: <span className="text-neon-blue">{mapCoords.x}</span></p>
                    <p>게임 Y: <span className="text-neon-blue">{mapCoords.y}</span></p>
                    <div className="flex items-center gap-2">
                      <span>게임 Z (고도):</span>
                      <input 
                        type="number" 
                        value={mapCoords.z} 
                        onChange={(e) => setMapCoords(prev => ({ ...prev, z: parseInt(e.target.value) || 0 }))}
                        className="bg-black/40 border border-white/10 rounded px-2 py-0.5 w-24 text-white text-right focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-xs text-gray-500">생성된 이동 명령어</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        readOnly 
                        value={getTeleportCmd()}
                        className="flex-grow bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-neon-blue font-mono select-all focus:outline-none"
                      />
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(getTeleportCmd());
                          setMessage(`복사 완료: ${getTeleportCmd()}`);
                        }}
                        className="bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all"
                      >
                        복사
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed font-mono">
                  * 맵 격자 영역을 클릭하면 위치에 해당하는 스컴 게임 내 절대 좌표로 매핑됩니다.
                  * 복사한 명령어를 게임 접속 후 채팅창(T)에 붙여넣어 해당 위치로 텔레포트할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
