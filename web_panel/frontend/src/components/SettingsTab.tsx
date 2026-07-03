import type { FormEvent } from 'react';

type Settings = {
  [key: string]: string;
};

interface SettingsTabProps {
  serverSettings: Settings;
  engineSettings: Settings;
  handleSettingChange: (section: 'server' | 'engine', key: string, val: string | boolean) => void;
  handleSaveSettings: () => void;
}

export default function SettingsTab({
  serverSettings,
  engineSettings,
  handleSettingChange,
  handleSaveSettings,
}: SettingsTabProps) {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSaveSettings();
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">서버 설정 관리</h1>
        <p className="text-gray-400 text-sm">ServerSettings.ini 및 Engine.ini 파일의 변수를 직접 조율합니다.</p>
      </div>

      <form onSubmit={onSubmit} className="border border-white/10 bg-white/5 rounded-2xl p-8 flex flex-col gap-6 shadow-lg">
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
            type="submit" 
            className="bg-green-700 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-all cursor-pointer"
          >
            설정 파일에 즉시 저장
          </button>
        </div>
      </form>
    </div>
  );
}
