interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: 'dashboard' | 'settings' | 'rcon' | 'map' | 'config') => void;
  serverStatus: string;
  serverRootDir: string;
}

export default function Sidebar({ activeTab, setActiveTab, serverStatus, serverRootDir }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-white/10 bg-black/40 flex flex-col p-6 h-full justify-between select-none">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <span className="font-heading text-2xl font-extrabold tracking-wider text-white drop-shadow-[0_0_8px_rgba(0,240,255,0.4)]">
            SCUM PANEL
          </span>
          <span className={`self-start text-[10px] font-bold px-2.5 py-0.5 rounded-full border tracking-wider shadow-sm uppercase ${
            serverStatus === 'ONLINE' ? 'bg-green-500/10 text-neon-green border-green-500/20 shadow-green-500/10' :
            serverStatus === 'OFFLINE' ? 'bg-red-500/10 text-neon-red border-red-500/20 shadow-red-500/10' :
            'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-yellow-500/10'
          }`}>
            {serverStatus}
          </span>
        </div>

        <nav className="flex flex-col gap-2.5">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
              activeTab === 'dashboard' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📊</span> 대시보드
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
              activeTab === 'settings' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>⚙️</span> 서버 설정
          </button>
          <button 
            onClick={() => setActiveTab('rcon')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
              activeTab === 'rcon' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>💻</span> RCON 콘솔
          </button>
          <button 
            onClick={() => setActiveTab('map')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
              activeTab === 'map' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🗺️</span> 텔레포트 맵
          </button>
          <button 
            onClick={() => setActiveTab('config')} 
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 transition-all ${
              activeTab === 'config' ? 'bg-neon-blue/10 text-white border-l-4 border-neon-blue' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>📁</span> 시스템 설정
          </button>
        </nav>
      </div>

      <div className="text-[11px] text-gray-500 leading-relaxed font-mono mt-auto pt-6 border-t border-white/5">
        <p className="truncate">Root: {serverRootDir || '미지정'}</p>
        <p>&copy; Antigravity Web Panel</p>
      </div>
    </aside>
  );
}
