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

          {/* Macros */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{t.macroTitle}</span>
            <button onClick={() => handleSendRconCommand('#ListPlayers')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">{t.macroList}</button>
            <button onClick={() => handleSendRconCommand('#Save')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">{t.macroSave}</button>
            <button onClick={() => handleSendRconCommand('#ListVehicles')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">{t.macroVehicles}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
