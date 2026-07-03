import { useRef, useEffect } from 'react';
import { i18n, type Lang } from '../utils/i18n';

type RconLogEntry = {
  type: 'info' | 'response' | 'error' | 'command';
  text: string;
};

interface RconTabProps {
  rconHost: string;
  setRconHost: (host: string) => void;
  rconPort: string;
  setRconPort: (port: string) => void;
  rconPassword: string;
  setRconPassword: (pw: string) => void;
  rconConnected: boolean;
  rconLogs: RconLogEntry[];
  setRconLogs: React.Dispatch<React.SetStateAction<RconLogEntry[]>>;
  handleRconConnect: () => void;
  handleSendRconCommand: (cmdText?: string) => void;
  rconInput: string;
  setRconInput: (inp: string) => void;
  lang: Lang;
}

const COMMANDS_LIST = [
  { category: "Player Management", commands: [
    { text: "List Active Players", value: "#ListPlayers" },
    { text: "Kick Player", value: "#Kick " },
    { text: "Ban Player", value: "#Ban " },
    { text: "Unban Player (SteamID)", value: "#Unban " },
    { text: "Mute Player Chat", value: "#Mute " },
    { text: "Unmute Player Chat", value: "#Unmute " },
    { text: "Set Fame Points", value: "#SetFamePoints 100 " }
  ]},
  { category: "Teleportation", commands: [
    { text: "Teleport to Coordinates", value: "#Teleport " },
    { text: "Teleport to Player", value: "#TeleportTo " },
    { text: "Teleport Player to Me", value: "#TeleportHere " }
  ]},
  { category: "Environment & Cheats", commands: [
    { text: "Set Time of Day (0-24)", value: "#SetTime 12" },
    { text: "Set Weather (0-1)", value: "#SetWeather 0" },
    { text: "Toggle God Mode", value: "#God" },
    { text: "Toggle Invisibility", value: "#Invisible" }
  ]},
  { category: "Spawning & Destroying", commands: [
    { text: "Spawn Item (Asset Qty)", value: "#SpawnItem " },
    { text: "Spawn Vehicle (Asset)", value: "#SpawnVehicle " },
    { text: "Destroy Vehicle (ID)", value: "#DestroyVehicle " },
    { text: "Destroy All Vehicles", value: "#DestroyAllVehicles" },
    { text: "Destroy All Zombies", value: "#DestroyAllZombies" }
  ]},
  { category: "Server Control", commands: [
    { text: "Save World Database", value: "#Save" },
    { text: "Server Announcement Banner", value: "#Announce " },
    { text: "Change Server Password", value: "#SetServerPassword " }
  ]}
];

export default function RconTab({
  rconHost,
  setRconHost,
  rconPort,
  setRconPort,
  rconPassword,
  setRconPassword,
  rconConnected,
  rconLogs,
  setRconLogs,
  handleRconConnect,
  handleSendRconCommand,
  rconInput,
  setRconInput,
  lang,
}: RconTabProps) {
  const t = i18n[lang];
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  const handleSelectCommand = (val: string) => {
    if (!val) return;
    // 매개변수가 필요 없는 고정 명령은 즉시 자동 전송
    const immediateCommands = [
      "#ListPlayers", 
      "#Save", 
      "#ListVehicles", 
      "#DestroyAllVehicles", 
      "#DestroyAllZombies", 
      "#God", 
      "#Invisible"
    ];
    
    if (immediateCommands.includes(val.trim())) {
      handleSendRconCommand(val.trim());
    } else {
      setRconInput(val);
      // 입력창으로 커서 포커스 유도
      const inputEl = document.getElementById('rcon-cmd-input');
      if (inputEl) inputEl.focus();
    }
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rconLogs]);

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">{t.rconTitle}</h1>
        <p className="text-gray-400 text-sm">{t.rconDesc}</p>
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-8 h-[520px]">
        {/* RCON Credentials */}
        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-md">
          <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 text-sm uppercase">{t.rconConnSetup}</h3>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelHost}</label>
            <input 
              type="text" 
              value={rconHost} 
              onChange={(e) => setRconHost(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelPort}</label>
            <input 
              type="number" 
              value={rconPort} 
              onChange={(e) => setRconPort(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelRconPw}</label>
            <input 
              type="password" 
              value={rconPassword} 
              onChange={(e) => setRconPassword(e.target.value)}
              className="bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none"
            />
          </div>
          <button 
            onClick={handleRconConnect}
            className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-all mt-2 cursor-pointer"
          >
            {t.btnRconConn}
          </button>
          <div className={`text-center font-bold text-xs mt-2 ${rconConnected ? 'text-neon-green' : 'text-neon-red'}`}>
            {rconConnected ? t.connSuccess : t.connDisconnected}
          </div>
        </div>

        {/* RCON Console Output & Input */}
        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-md h-full">
          <div className="flex justify-between items-center">
            <span className="font-heading text-xs text-gray-500 uppercase tracking-widest">Console Shell</span>
            <button 
              onClick={() => setRconLogs([])}
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded cursor-pointer"
            >
              {t.btnClearConsole}
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
              id="rcon-cmd-input"
              type="text" 
              value={rconInput}
              disabled={!rconConnected}
              onChange={(e) => setRconInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendRconCommand()}
              placeholder={rconConnected ? t.placeholderRconInput : t.placeholderRconDisabled}
              className="flex-grow bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none"
            />
            <button 
              onClick={() => handleSendRconCommand()}
              disabled={!rconConnected}
              className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 text-white px-5 py-2.5 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              {t.btnSend}
            </button>
          </div>

          {/* Macros & Command Helper */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-2 justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span>{t.macroTitle}</span>
              <button onClick={() => handleSendRconCommand('#ListPlayers')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">{t.macroList}</button>
              <button onClick={() => handleSendRconCommand('#Save')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">{t.macroSave}</button>
              <button onClick={() => handleSendRconCommand('#ListVehicles')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">{t.macroVehicles}</button>
              <button onClick={() => handleSendRconCommand('#God')} disabled={!rconConnected} className="bg-green-950/40 hover:bg-green-900/60 text-neon-green border border-green-500/20 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed font-semibold">🛡️ God</button>
              <button onClick={() => handleSendRconCommand('#Invisible')} disabled={!rconConnected} className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/20 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed font-semibold">👻 Ghost</button>
              <button onClick={() => handleSendRconCommand('#DestroyAllZombies')} disabled={!rconConnected} className="bg-red-950/40 hover:bg-red-900/60 text-neon-red border border-red-500/20 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed font-semibold">☠️ Kill Z</button>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-400">{t.cmdHelper}:</span>
              <select
                onChange={(e) => {
                  handleSelectCommand(e.target.value);
                  e.target.value = "";
                }}
                disabled={!rconConnected}
                className="bg-black/60 border border-white/15 text-[11px] text-gray-300 rounded px-2 py-1 outline-none focus:border-neon-blue cursor-pointer disabled:cursor-not-allowed"
              >
                <option value="">-- {t.selectCmd} --</option>
                {COMMANDS_LIST.map((cat, idx) => (
                  <optgroup key={idx} label={cat.category} className="bg-neutral-900 text-gray-400 text-[10px]">
                    {cat.commands.map((cmd, cIdx) => (
                      <option key={cIdx} value={cmd.value} className="bg-neutral-800 text-white text-[11px]">{cmd.text} ({cmd.value.trim()})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
