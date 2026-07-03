import type { FormEvent } from 'react';
import { i18n, type Lang } from '../utils/i18n';

type Settings = {
  [key: string]: string;
};

interface SettingsTabProps {
  serverSettings: Settings;
  engineSettings: Settings;
  handleSettingChange: (section: 'server' | 'engine', key: string, val: string | boolean) => void;
  handleSaveSettings: () => void;
  lang: Lang;
}

export default function SettingsTab({
  serverSettings,
  engineSettings,
  handleSettingChange,
  handleSaveSettings,
  lang,
}: SettingsTabProps) {
  const t = i18n[lang];

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSaveSettings();
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">{t.settingsTitle}</h1>
        <p className="text-gray-400 text-sm">{t.settingsDesc}</p>
      </div>

      <form onSubmit={onSubmit} className="border border-white/10 bg-white/5 rounded-2xl p-8 flex flex-col gap-6 shadow-lg">
        <div className="grid grid-cols-2 gap-8 max-h-[480px] overflow-y-auto pr-2">
          {/* Section 1: Server Config */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 font-heading text-sm uppercase tracking-wider">{t.secBasic}</h3>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelServerName}</label>
              <input 
                type="text" 
                value={serverSettings['scum.ServerName'] || ''} 
                onChange={(e) => handleSettingChange('server', 'scum.ServerName', e.target.value)}
                className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelPassword}</label>
              <input 
                type="text" 
                value={serverSettings['scum.ServerPassword'] || ''} 
                onChange={(e) => handleSettingChange('server', 'scum.ServerPassword', e.target.value)}
                className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelMaxPlayers}</label>
                <input 
                  type="number" 
                  value={serverSettings['scum.MaxPlayers'] || ''} 
                  onChange={(e) => handleSettingChange('server', 'scum.MaxPlayers', e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelMaxPing}</label>
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
            <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 font-heading text-sm uppercase tracking-wider">{t.secTuning}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelFpsLimit}</label>
                <input 
                  type="number" 
                  value={serverSettings['scum.ServerFPSLimit'] || ''} 
                  onChange={(e) => handleSettingChange('server', 'scum.ServerFPSLimit', e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelAnimals}</label>
                <input 
                  type="number" 
                  value={serverSettings['scum.MaxAnimalsOnServer'] || ''} 
                  onChange={(e) => handleSettingChange('server', 'scum.MaxAnimalsOnServer', e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelVehicles}</label>
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
                {t.labelSentry}
              </label>
              <label className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={serverSettings['scum.DisableSuicidePuppetSpawning'] === 'True'} 
                  onChange={(e) => handleSettingChange('server', 'scum.DisableSuicidePuppetSpawning', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-neon-blue bg-black/30 focus:ring-0 focus:outline-none"
                />
                {t.labelSuicide}
              </label>
            </div>
          </div>

          {/* Section 3: Cargo Drop */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 font-heading text-sm uppercase tracking-wider">{t.secCargo}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelCargoMin}</label>
                <input 
                  type="number" 
                  value={serverSettings['scum.CargoDropCooldownMinimum'] || ''} 
                  onChange={(e) => handleSettingChange('server', 'scum.CargoDropCooldownMinimum', e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelCargoMax}</label>
                <input 
                  type="number" 
                  value={serverSettings['scum.CargoDropCooldownMaximum'] || ''} 
                  onChange={(e) => handleSettingChange('server', 'scum.CargoDropCooldownMaximum', e.target.value)}
                  className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-neon-blue focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase font-bold">{t.labelCargoDestruct}</label>
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
            <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 font-heading text-sm uppercase tracking-wider">{t.secEngine}</h3>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={engineSettings['gc.CreateGarbageCollectorUObjectClusters'] === 'True'} 
                  onChange={(e) => handleSettingChange('engine', 'gc.CreateGarbageCollectorUObjectClusters', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-neon-blue bg-black/30 focus:ring-0 focus:outline-none"
                />
                {t.labelUObject}
              </label>
              <label className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={engineSettings['gc.ActorClusteringEnabled'] === 'True'} 
                  onChange={(e) => handleSettingChange('engine', 'gc.ActorClusteringEnabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-neon-blue bg-black/30 focus:ring-0 focus:outline-none"
                />
                {t.labelActorCluster}
              </label>
              <label className="flex items-center gap-3 text-xs text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={engineSettings['s.AsyncLoadingThreadEnabled'] === 'True'} 
                  onChange={(e) => handleSettingChange('engine', 's.AsyncLoadingThreadEnabled', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-neon-blue bg-black/30 focus:ring-0 focus:outline-none"
                />
                {t.labelAsyncLoad}
              </label>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex justify-end">
          <button 
            type="submit" 
            className="bg-green-700 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-all cursor-pointer"
          >
            {t.btnSaveSettings}
          </button>
        </div>
      </form>
    </div>
  );
}
