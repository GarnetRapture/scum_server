import { i18n, type Lang } from '../utils/i18n';

interface DashboardTabProps {
  serverStatus: string;
  loading: boolean;
  handleStart: () => void;
  handleStop: () => void;
  handleSetupSteamCMD: () => void;
  lang: Lang;
}

export default function DashboardTab({
  serverStatus,
  loading,
  handleStart,
  handleStop,
  handleSetupSteamCMD,
  lang,
}: DashboardTabProps) {
  const t = i18n[lang];

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">{t.dashTitle}</h1>
        <p className="text-gray-400 text-sm">{t.dashDesc}</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Power Control Panel */}
        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-md">
          <h2 className="text-lg font-bold text-white border-l-3 border-neon-blue pl-2 font-heading">{t.powerControl}</h2>
          <div className="flex gap-4">
            <button 
              onClick={handleStart} 
              disabled={loading || serverStatus === 'ONLINE'} 
              className="flex-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] cursor-pointer disabled:cursor-not-allowed"
            >
              {t.btnStart}
            </button>
            <button 
              onClick={handleStop} 
              disabled={loading || serverStatus === 'OFFLINE'} 
              className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all shadow-[0_0_10px_rgba(239,68,68,0.1)] hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] cursor-pointer disabled:cursor-not-allowed"
            >
              {t.btnStop}
            </button>
          </div>
          <div className="border-t border-white/10 pt-4 text-sm text-gray-400 flex flex-col gap-2 font-mono">
            <p>{t.statusDetect}: <span className={serverStatus === 'ONLINE' ? 'text-neon-green font-bold' : 'text-neon-red font-bold'}>
              {serverStatus === 'ONLINE' ? t.uptime : serverStatus === 'OFFLINE' ? t.stopped : t.checking}
            </span></p>
            <p>{t.bindPort}: <span className="text-neon-blue">UDP 7777 - 7779 (RCON: TCP 7777)</span></p>
            <div className="mt-2 pt-2 border-t border-white/5 flex flex-col gap-1.5">
              <span className="text-[10px] text-gray-500 uppercase font-bold">{t.firstInstall}</span>
              <button 
                onClick={handleSetupSteamCMD}
                disabled={loading}
                className="bg-blue-700/80 hover:bg-blue-600 disabled:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all text-xs text-center cursor-pointer disabled:cursor-not-allowed"
              >
                {t.btnSetupSteam}
              </button>
            </div>
          </div>
        </div>

        {/* Hardware Monitoring Panel */}
        <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-md">
          <h2 className="text-lg font-bold text-white border-l-3 border-neon-blue pl-2 font-heading">{t.resourceIsolation}</h2>
          <div className="flex flex-col gap-3 font-mono">
            <div className="flex justify-between p-3.5 bg-white/5 border border-white/5 rounded-lg">
              <span className="text-gray-400">{t.cpuCore}</span>
              <span className="text-neon-blue font-semibold">{t.cpuValue}</span>
            </div>
            <div className="flex justify-between p-3.5 bg-white/5 border border-white/5 rounded-lg">
              <span className="text-gray-400">{t.ramBuffer}</span>
              <span className="text-white font-semibold">{t.ramValue}</span>
            </div>
            <div className="flex justify-between p-3.5 bg-white/5 border border-white/5 rounded-lg">
              <span className="text-gray-400">{t.diskSpace}</span>
              <span className="text-white font-semibold">{t.diskValue}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
