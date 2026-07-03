import { i18n, type Lang } from '../utils/i18n';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'dashboard' | 'settings' | 'rcon' | 'map' | 'config') => void;
  serverStatus: string;
  serverRootDir: string;
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  serverStatus,
  serverRootDir,
  lang,
  setLang,
}: SidebarProps) {
  const t = i18n[lang];

  return (
    <aside className="w-66 border-r border-white/10 bg-black/40 flex flex-col p-6 h-full justify-between select-none">
      <div className="flex flex-col gap-6">
        {/* Header and status */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-heading text-2xl font-extrabold tracking-wider text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
              SCUM PANEL
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wider shadow-sm uppercase ${
              serverStatus === 'ONLINE' ? 'bg-green-500/10 text-neon-green border-green-500/20 shadow-green-500/10' :
              serverStatus === 'OFFLINE' ? 'bg-red-500/10 text-neon-red border-red-500/20 shadow-red-500/10' :
              'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-yellow-500/10'
            }`}>
              {serverStatus === 'ONLINE' ? t.uptime : serverStatus === 'OFFLINE' ? t.stopped : t.checking}
            </span>

            {/* Language Switcher */}
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value as Lang)}
              className="bg-black/40 border border-white/10 text-[10px] text-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-neon-blue cursor-pointer"
            >
              <option value="ko">🇰🇷 KO</option>
              <option value="en">🇺🇸 EN</option>
              <option value="ja">🇯🇵 JA</option>
              <option value="zh">🇨🇳 ZH</option>
              <option value="ru">🇷🇺 RU</option>
            </select>
          </div>
        </div>

        {/* Tab Buttons */}
        <nav className="flex flex-col gap-2.5">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'dashboard' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.tabDashboard}
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'settings' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.tabSettings}
          </button>
          <button 
            onClick={() => setActiveTab('rcon')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'rcon' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.tabRcon}
          </button>
          <button 
            onClick={() => setActiveTab('map')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'map' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.tabMap}
          </button>
          <button 
            onClick={() => setActiveTab('config')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all cursor-pointer ${
              activeTab === 'config' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.tabConfig}
          </button>
        </nav>
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-gray-500 leading-relaxed font-mono mt-auto pt-6 border-t border-white/5 flex flex-col gap-1.5">
        <p className="truncate">Root: {serverRootDir || 'N/A'}</p>
        <div className="flex items-center gap-1.5 mt-1 border-t border-white/5 pt-2">
          <span className="text-[9px] text-gray-600 uppercase font-bold">Developer:</span>
          <a 
            href="https://github.com/GarnetRapture" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-neon-blue hover:text-white transition-colors font-bold underline decoration-neon-blue/40"
          >
            GarnetRapture
          </a>
        </div>
        <p>&copy; Antigravity Web Panel</p>
      </div>
    </aside>
  );
}
