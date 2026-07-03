import { useState } from 'react';
import { i18n, type Lang } from '../utils/i18n';

interface CheatsTabProps {
  rconConnected: boolean;
  handleSendRconCommand: (cmd: string) => void;
  lang: Lang;
}

const ITEMS_CATALOG = [
  {
    category: "🔫 Weapons & Ammo (무기 및 탄약)",
    items: [
      { name: "AK47 Rifle", cmd: "#SpawnItem BP_Weapon_AK47 1" },
      { name: "M16A4 Rifle", cmd: "#SpawnItem BP_Weapon_M16A4 1" },
      { name: "SVD Sniper", cmd: "#SpawnItem BP_Weapon_SVD 1" },
      { name: "Block21 Pistol", cmd: "#SpawnItem BP_Weapon_Block21 1" },
      { name: "AK47 Magazine", cmd: "#SpawnItem BP_Magazine_AK47 1" },
      { name: "M16 Magazine", cmd: "#SpawnItem BP_Magazine_M16 1" },
      { name: "SVD Magazine", cmd: "#SpawnItem BP_Magazine_SVD_Dragunov 1" },
      { name: "Ammo 7.62x39mm (Box)", cmd: "#SpawnItem BP_AmmunitionBox_7_62x39mm 1" },
      { name: "Ammo 5.56x45mm (Box)", cmd: "#SpawnItem BP_AmmunitionBox_5_56x45mm 1" },
      { name: "Ammo 9mm (Box)", cmd: "#SpawnItem BP_AmmunitionBox_9x19mm 1" }
    ]
  },
  {
    category: "🎒 Gear & Medical (도구 및 의료)",
    items: [
      { name: "Military Backpack", cmd: "#SpawnItem BP_Military_Backpack_01 1" },
      { name: "Compass", cmd: "#SpawnItem BP_Compass 1" },
      { name: "Canteen (Water)", cmd: "#SpawnItem BP_Canteen 1" },
      { name: "MRE Ration", cmd: "#SpawnItem BP_MRE_Ration 1" },
      { name: "Emergency Bandage", cmd: "#SpawnItem BP_Emergency_Bandage 1" },
      { name: "Painkillers", cmd: "#SpawnItem BP_Painkillers 1" },
      { name: "Toolbox (Full)", cmd: "#SpawnItem BP_Toolbox 1" },
      { name: "Lockpick", cmd: "#SpawnItem BP_Lockpick 1" },
      { name: "Bobby Pin", cmd: "#SpawnItem BP_Bobby_Pin 1" },
      { name: "Fire Starter", cmd: "#SpawnItem BP_Firestarter 1" }
    ]
  },
  {
    category: "🚗 Vehicles & Spawns (차량 스폰)",
    items: [
      { name: "Laika SUV", cmd: "#SpawnVehicle BPC_Laika 1" },
      { name: "Wolfwagen Sedan", cmd: "#SpawnVehicle BPC_Wolfwagen 1" },
      { name: "Dirt Bike", cmd: "#SpawnVehicle BPC_Dirtbike 1" },
      { name: "Bicycle", cmd: "#SpawnVehicle BPC_Bicycle 1" },
      { name: "Quad ATV", cmd: "#SpawnVehicle BPC_Quad 1" }
    ]
  },
  {
    category: "⚡ Global World Cheats (세계 조작 치트)",
    items: [
      { name: "🛡️ Toggle God Mode (무적 토글)", cmd: "#God" },
      { name: "👻 Toggle Invisibility (투명화 토글)", cmd: "#Invisible" },
      { name: "☠️ Destroy All Zombies (모든 좀비 말살)", cmd: "#DestroyAllZombies" },
      { name: "🚗 Destroy All Vehicles (모든 차량 삭제)", cmd: "#DestroyAllVehicles" },
      { name: "☀️ Set Time to Noon (낮 12시 설정)", cmd: "#SetTime 12" },
      { name: "🌙 Set Time to Midnight (밤 0시 설정)", cmd: "#SetTime 0" },
      { name: "🌦️ Set Weather Sunny (날씨 맑음)", cmd: "#SetWeather 0" },
      { name: "⛈️ Set Weather Stormy (비바람/태풍)", cmd: "#SetWeather 1" }
    ]
  }
];

export default function CheatsTab({ rconConnected, handleSendRconCommand, lang }: CheatsTabProps) {
  const t = i18n[lang];
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCatalog = ITEMS_CATALOG.map(cat => {
    const filteredItems = cat.items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.cmd.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, items: filteredItems };
  }).filter(cat => cat.items.length > 0);

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">{t.tabCheats}</h1>
          <p className="text-gray-400 text-sm">RCON 원격 연결을 통해 인게임 아이템 소환, 차량 기동, 세계 관리를 원클릭으로 가동합니다.</p>
        </div>
        
        {/* Search Bar */}
        <div className="w-80">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="아이템 이름 또는 명령어 검색..."
            className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-neon-blue focus:outline-none placeholder-gray-500 font-mono"
          />
        </div>
      </div>

      {!rconConnected && (
        <div className="bg-red-500/10 border border-red-500/20 text-neon-red px-6 py-4 rounded-xl text-sm font-semibold flex items-center gap-3">
          <span>⚠️</span> RCON 콘솔이 연결되지 않았습니다. 치트 명령을 스트리밍 전송하려면 먼저 'RCON 콘솔' 탭에서 호스트 연결을 완료해 주십시오.
        </div>
      )}

      {/* Cheats Catalog Grid */}
      <div className="flex-grow overflow-y-auto max-h-[580px] pr-2 flex flex-col gap-6">
        {filteredCatalog.map((cat, idx) => (
          <div key={idx} className="border border-white/10 bg-white/5 rounded-2xl p-6 shadow-md flex flex-col gap-4">
            <h2 className="text-sm font-bold text-white border-l-3 border-neon-blue pl-2 font-heading tracking-wider uppercase">
              {cat.category}
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {cat.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx} 
                  className="bg-black/30 border border-white/5 hover:border-white/10 rounded-xl p-3.5 flex justify-between items-center transition-all group font-mono text-xs"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-200 font-semibold text-sm group-hover:text-white transition-colors">{item.name}</span>
                    <span className="text-neon-blue text-[10px]">{item.cmd}</span>
                  </div>
                  
                  <button
                    onClick={() => handleSendRconCommand(item.cmd)}
                    disabled={!rconConnected}
                    className="bg-blue-800/80 hover:bg-blue-600 disabled:bg-gray-800 text-white font-bold py-1.5 px-3.5 rounded-lg transition-all text-xs cursor-pointer disabled:cursor-not-allowed shadow-[0_0_8px_rgba(0,140,255,0.1)] hover:shadow-[0_0_12px_rgba(0,140,255,0.3)]"
                  >
                    Send Command
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredCatalog.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-mono text-sm">
            검색 결과와 일치하는 치트 항목이 존재하지 않습니다.
          </div>
        )}
      </div>
    </div>
  );
}
