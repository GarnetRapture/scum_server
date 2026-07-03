import { useRef, useEffect } from 'react';

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
}: RconTabProps) {
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [rconLogs]);

  return (
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
            className="w-full bg-blue-700 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-lg transition-all mt-2 cursor-pointer"
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
              className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs px-2.5 py-1 rounded cursor-pointer"
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
              className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 text-white px-5 py-2.5 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              전송
            </button>
          </div>

          {/* Macros */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>매크로 단축키:</span>
            <button onClick={() => handleSendRconCommand('#ListPlayers')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">접속자 정보</button>
            <button onClick={() => handleSendRconCommand('#Save')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">서버 저장</button>
            <button onClick={() => handleSendRconCommand('#ListVehicles')} disabled={!rconConnected} className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-2 py-1 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed">차량 목록</button>
          </div>
        </div>
      </div>
    </div>
  );
}
