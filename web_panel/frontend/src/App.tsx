import { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import SettingsTab from './components/SettingsTab';
import RconTab from './components/RconTab';
import MapTab from './components/MapTab';
import ConfigTab from './components/ConfigTab';
import type { Lang } from './utils/i18n';

type RconLogEntry = {
  type: 'info' | 'response' | 'error' | 'command';
  text: string;
};

type Settings = {
  [key: string]: string;
};

type Config = {
  serverRootDir: string;
  rconHost: string;
  rconPort: number;
  rconPassword?: string;
};

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'settings' | 'rcon' | 'map' | 'config'>('dashboard');
  const [serverStatus, setServerStatus] = useState<'ONLINE' | 'OFFLINE' | 'CHECKING'>('CHECKING');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Persistent Language State
  const [lang, setLang] = useState<Lang>(
    (localStorage.getItem('scum_lang') as Lang) || 'ko'
  );

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('scum_lang', newLang);
  };

  // Master Configuration State
  const [config, setConfig] = useState<Config>({
    serverRootDir: '',
    rconHost: '127.0.0.1',
    rconPort: 7777,
    rconPassword: ''
  });

  // Settings State
  const [serverSettings, setServerSettings] = useState<Settings>({});
  const [engineSettings, setEngineSettings] = useState<Settings>({});

  // RCON State
  const [rconHost, setRconHost] = useState('127.0.0.1');
  const [rconPort, setRconPort] = useState('7777');
  const [rconPassword, setRconPassword] = useState('');
  const [rconConnected, setRconConnected] = useState(false);
  const [rconLogs, setRconLogs] = useState<RconLogEntry[]>([]);
  const [rconInput, setRconInput] = useState('');
  const wsRef = useRef<WebSocket | null>(null);

  // Map State
  const [mapCoords, setMapCoords] = useState({ x: 0, y: 0, z: 20000 });
  const [markerPos, setMarkerPos] = useState<{ top: string; left: string } | null>(null);
  const mapCanvasRef = useRef<HTMLDivElement | null>(null);

  // Status & Config Polling
  useEffect(() => {
    fetchConfig();
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

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setServerStatus(data.status);
    } catch (err) {
      setServerStatus('OFFLINE');
    }
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.config) {
        setConfig(data.config);
        setRconHost(data.config.rconHost || '127.0.0.1');
        setRconPort(String(data.config.rconPort || 7777));
        setRconPassword(data.config.rconPassword || '');
      }
    } catch (err) {
      console.error('Config 로드 실패:', err);
    }
  };

  const handleSaveConfig = async (newConfig: Config) => {
    setLoading(true);
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig })
      });
      const data = await res.json();
      setMessage(data.message);
      setConfig(newConfig);
    } catch (err) {
      setMessage('시스템 설정 저장 실패');
    } finally {
      setLoading(false);
    }
  };

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
    setMessage(`복사 완료: ${cmd}`);
  };

  const handleSettingChange = (section: 'server' | 'engine', key: string, val: string | boolean) => {
    const strVal = typeof val === 'boolean' ? (val ? 'True' : 'False') : val;
    if (section === 'server') {
      setServerSettings(prev => ({ ...prev, [key]: strVal }));
    } else {
      setEngineSettings(prev => ({ ...prev, [key]: strVal }));
    }
  };

  const teleportCmd = `#teleport ${mapCoords.x} ${mapCoords.y} ${mapCoords.z}`;

  return (
    <div className="glass w-full max-w-7xl h-[850px] rounded-3xl shadow-2xl flex overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        serverStatus={serverStatus}
        serverRootDir={config.serverRootDir}
        lang={lang}
        setLang={handleSetLang}
      />

      {/* Main Content Area */}
      <main className="flex-grow p-10 overflow-y-auto relative h-full">
        {/* Toast Alert */}
        {message && (
          <div className="absolute top-6 right-6 bg-black/90 border border-white/10 text-neon-blue text-xs font-semibold px-4 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50 animate-bounce select-none">
            <span>🔔</span> {message}
            <button onClick={() => setMessage(null)} className="text-white hover:text-gray-400 font-bold ml-2 cursor-pointer">X</button>
          </div>
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardTab 
            serverStatus={serverStatus}
            loading={loading}
            handleStart={handleStart}
            handleStop={handleStop}
            handleSetupSteamCMD={handleSetupSteamCMD}
            lang={lang}
          />
        )}

        {/* Tab 2: Settings Configuration */}
        {activeTab === 'settings' && (
          <SettingsTab 
            serverSettings={serverSettings}
            engineSettings={engineSettings}
            handleSettingChange={handleSettingChange}
            handleSaveSettings={handleSaveSettings}
            lang={lang}
          />
        )}

        {/* Tab 3: RCON console shell */}
        {activeTab === 'rcon' && (
          <RconTab 
            rconHost={rconHost}
            setRconHost={setRconHost}
            rconPort={rconPort}
            setRconPort={setRconPort}
            rconPassword={rconPassword}
            setRconPassword={setRconPassword}
            rconConnected={rconConnected}
            rconLogs={rconLogs}
            setRconLogs={setRconLogs}
            handleRconConnect={handleRconConnect}
            handleSendRconCommand={handleSendRconCommand}
            rconInput={rconInput}
            setRconInput={setRconInput}
            lang={lang}
          />
        )}

        {/* Tab 4: Teleport coordinate helper map */}
        {activeTab === 'map' && (
          <MapTab 
            mapCoords={mapCoords}
            setMapCoords={setMapCoords}
            markerPos={markerPos}
            handleMapClick={handleMapClick}
            mapCanvasRef={mapCanvasRef}
            teleportCmd={teleportCmd}
            setMessage={setMessage}
            lang={lang}
          />
        )}

        {/* Tab 5: Master config.json control */}
        {activeTab === 'config' && (
          <ConfigTab 
            config={config}
            handleSaveConfig={handleSaveConfig}
            loading={loading}
            lang={lang}
          />
        )}
      </main>
    </div>
  );
}

export default App;
