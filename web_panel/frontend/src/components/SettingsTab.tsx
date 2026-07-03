import { useState, useEffect, type FormEvent } from 'react';
import { i18n, type Lang } from '../utils/i18n';

type Settings = {
  [section: string]: {
    [key: string]: string;
  };
};

interface SettingsTabProps {
  serverSettings: Settings;
  engineSettings: Settings;
  handleSettingChange: (type: 'server' | 'engine', sectionName: string, key: string, val: string | boolean) => void;
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
  const [activeSubTab, setActiveSubTab] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const serverSections = Object.keys(serverSettings);
  const engineSections = Object.keys(engineSettings);
  const allSections = [...serverSections, ...engineSections];

  // 최초 로드 시 첫 번째 섹션 자동 활성화
  useEffect(() => {
    if (!activeSubTab && allSections.length > 0) {
      setActiveSubTab(allSections[0]);
    }
  }, [serverSettings, engineSettings]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSaveSettings();
  };

  // 키 라벨 포맷 헬퍼 (scum.MaxAllowedBirds -> Max Allowed Birds)
  const formatKeyLabel = (key: string) => {
    let clean = key.replace(/^scum\./i, '');
    clean = clean.replace(/^(gc\.|s\.)/i, '');
    // 점(.) 문자나 대문자 앞부분에 공백을 가미해 단어로 나눔
    return clean
      .replace(/\./g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const isEngineSection = engineSections.includes(activeSubTab);
  const currentSectionData = isEngineSection ? (engineSettings[activeSubTab] || {}) : (serverSettings[activeSubTab] || {});
  const sectionType = isEngineSection ? 'engine' : 'server';

  // 검색 쿼리에 따른 필터링 적용
  const filteredKeys = Object.keys(currentSectionData).filter(key => {
    const formatted = formatKeyLabel(key).toLowerCase();
    const original = key.toLowerCase();
    const query = searchQuery.toLowerCase();
    return formatted.includes(query) || original.includes(query);
  });

  return (
    <div className="flex flex-col gap-6 h-full max-h-[780px]">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">{t.settingsTitle}</h1>
        <p className="text-gray-400 text-sm">{t.settingsDesc}</p>
      </div>

      {/* 설정 분류 탭 네비게이션 & 검색창 */}
      <div className="flex flex-col gap-4">
        {/* 가로 탭 바 */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
          {allSections.map(section => {
            const isActive = activeSubTab === section;
            return (
              <button
                key={section}
                type="button"
                onClick={() => {
                  setActiveSubTab(section);
                  setSearchQuery('');
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-neon-blue text-black shadow-[0_0_10px_rgba(0,243,255,0.4)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {section === '/Script/Engine.Engine' ? 'Engine Optimization' : section}
              </button>
            );
          })}
        </div>

        {/* 검색 인풋 바 */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="🔎 설정 변수명 검색 (예: MaxPlayers, Fame)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-neon-blue focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-gray-400 hover:text-white text-xs cursor-pointer font-bold"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 실시간 렌더링 폼 영역 */}
      <form onSubmit={onSubmit} className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-6 shadow-xl flex-grow overflow-hidden">
        {/* 스크롤 영역 */}
        <div className="flex-grow overflow-y-auto pr-2 max-h-[420px]">
          {filteredKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <span className="text-3xl mb-2">🔍</span>
              <p className="text-sm">검색 결과에 맞는 설정 항목이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-8 gap-y-5">
              {filteredKeys.map(key => {
                const rawValue = currentSectionData[key] || '';
                const labelName = formatKeyLabel(key);
                const isBool = rawValue.toLowerCase() === 'true' || rawValue.toLowerCase() === 'false';
                
                return (
                  <div key={key} className="flex flex-col gap-1.5 border-b border-white/5 pb-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-300">{labelName}</label>
                      <span className="text-[9px] text-gray-500 font-mono select-all">{key}</span>
                    </div>

                    {isBool ? (
                      <div className="flex items-center mt-1">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rawValue.toLowerCase() === 'true'}
                            onChange={(e) => handleSettingChange(sectionType, activeSubTab, key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600 peer-checked:after:bg-white"></div>
                          <span className="ml-3 text-xs text-gray-400">
                            {rawValue.toLowerCase() === 'true' ? '활성화 (True)' : '비활성화 (False)'}
                          </span>
                        </label>
                      </div>
                    ) : (
                      <input
                        type={!isNaN(Number(rawValue)) && rawValue.trim() !== '' ? 'number' : 'text'}
                        value={rawValue}
                        onChange={(e) => handleSettingChange(sectionType, activeSubTab, key, e.target.value)}
                        className="bg-black/30 border border-white/10 rounded-lg p-2 text-xs text-white focus:border-neon-blue focus:outline-none transition-all"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 저장 버튼 바 */}
        <div className="border-t border-white/10 pt-4 flex justify-between items-center shrink-0">
          <div className="text-[10px] text-gray-500">
            * INI 설정을 저장한 후 게임 서버를 반드시 <strong>재시작</strong>해야 정상 적용됩니다.
          </div>
          <button
            type="submit"
            className="bg-green-700 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-all cursor-pointer shadow-lg hover:shadow-green-900/30 text-xs"
          >
            {t.btnSaveSettings}
          </button>
        </div>
      </form>
    </div>
  );
}
