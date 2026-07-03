import { useState, useEffect } from 'react';

type Config = {
  serverRootDir: string;
  rconHost: string;
  rconPort: number;
  rconPassword?: string;
};

interface ConfigTabProps {
  config: Config;
  handleSaveConfig: (newConfig: Config) => void;
  loading: boolean;
}

export default function ConfigTab({
  config,
  handleSaveConfig,
  loading,
}: ConfigTabProps) {
  const [localConfig, setLocalConfig] = useState<Config>({ ...config });

  useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  const handleChange = (key: keyof Config, val: string | number) => {
    setLocalConfig(prev => ({ ...prev, [key]: val }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveConfig(localConfig);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">시스템 환경 설정</h1>
        <p className="text-gray-400 text-sm">마스터 설정 파일(config.json)의 속성 및 서버 홈 경로를 갱신합니다.</p>
      </div>

      <form onSubmit={onSubmit} className="border border-white/10 bg-white/5 rounded-2xl p-8 flex flex-col gap-6 shadow-lg max-w-xl">
        <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 text-sm uppercase">config.json 매핑</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-gray-500 uppercase font-bold">스컴 서버 홈 루트 디렉터리</label>
            <input 
              type="text" 
              value={localConfig.serverRootDir || ''} 
              onChange={(e) => handleChange('serverRootDir', e.target.value)}
              placeholder="예: D:\scum_server"
              className="bg-black/30 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-neon-blue focus:outline-none font-mono"
              required
            />
            <p className="text-[11px] text-gray-500 mt-1">* 스팀 CMD 및 서버 바이너리가 보관되는 최상위 루트 디렉터리 절대 경로입니다.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase font-bold">기본 RCON 호스트</label>
              <input 
                type="text" 
                value={localConfig.rconHost || ''} 
                onChange={(e) => handleChange('rconHost', e.target.value)}
                className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] text-gray-500 uppercase font-bold">기본 RCON 포트</label>
              <input 
                type="number" 
                value={localConfig.rconPort || 7777} 
                onChange={(e) => handleChange('rconPort', parseInt(e.target.value) || 7777)}
                className="bg-black/30 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-600 disabled:bg-gray-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            시스템 설정 저장
          </button>
        </div>
      </form>
    </div>
  );
}
