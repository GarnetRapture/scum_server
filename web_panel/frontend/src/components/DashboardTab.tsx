interface DashboardTabProps {
  serverStatus: string;
  loading: boolean;
  handleStart: () => void;
  handleStop: () => void;
  handleSetupSteamCMD: () => void;
}

export default function DashboardTab({
  serverStatus,
  loading,
  handleStart,
  handleStop,
  handleSetupSteamCMD,
}: DashboardTabProps) {
  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">서버 제어 및 상태 모니터링</h1>
        <p className="text-gray-400 text-sm">스컴 전용 서버의 프로세스 상태 제어 및 하드웨어 자원을 확인합니다.</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Power Control Panel */}
        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-md">
          <h2 className="text-lg font-bold text-white border-l-3 border-neon-blue pl-2 font-heading">전원 컨트롤</h2>
          <div className="flex gap-4">
            <button 
              onClick={handleStart} 
              disabled={loading || serverStatus === 'ONLINE'} 
              className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer disabled:cursor-not-allowed"
            >
              서버 켜기
            </button>
            <button 
              onClick={handleStop} 
              disabled={loading || serverStatus === 'OFFLINE'} 
              className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer disabled:cursor-not-allowed"
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
                className="bg-blue-700/80 hover:bg-blue-600 disabled:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all text-xs text-center cursor-pointer disabled:cursor-not-allowed"
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
              <span className="text-white font-semibold">474 GB 여유</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
