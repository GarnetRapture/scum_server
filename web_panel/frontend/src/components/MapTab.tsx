import React from 'react';

interface MapCoords {
  x: number;
  y: number;
  z: number;
}

interface MapTabProps {
  mapCoords: MapCoords;
  setMapCoords: React.Dispatch<React.SetStateAction<MapCoords>>;
  markerPos: { top: string; left: string } | null;
  handleMapClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  mapCanvasRef: React.RefObject<HTMLDivElement | null>;
  teleportCmd: string;
  setMessage: (msg: string | null) => void;
}

export default function MapTab({
  mapCoords,
  setMapCoords,
  markerPos,
  handleMapClick,
  mapCanvasRef,
  teleportCmd,
  setMessage,
}: MapTabProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(teleportCmd);
    setMessage(`복사 완료: ${teleportCmd}`);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">인터랙티브 텔레포트 맵 헬퍼</h1>
        <p className="text-gray-400 text-sm">맵의 임의 지점을 좌클릭하여 인게임 텔레포트 복사용 절대 좌표를 파싱합니다.</p>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-8 h-[520px]">
        {/* Virtual Map grid */}
        <div className="border border-white/10 bg-white/5 rounded-2xl overflow-hidden relative">
          <div 
            ref={mapCanvasRef}
            onClick={handleMapClick}
            className="w-full h-full cursor-crosshair bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] flex items-center justify-center relative select-none"
          >
            {markerPos && (
              <div 
                className="absolute w-3.5 h-3.5 bg-neon-blue rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#00f0ff,0_0_20px_#00f0ff] animate-ping"
                style={{ top: markerPos.top, left: markerPos.left }}
              />
            )}
            {markerPos && (
              <div 
                className="absolute w-3.5 h-3.5 bg-neon-blue rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_#00f0ff,0_0_20px_#00f0ff]"
                style={{ top: markerPos.top, left: markerPos.left }}
              />
            )}
            <span className="font-heading text-xs tracking-widest text-white/10 pointer-events-none">SCUM 12KM WORLD GRID</span>
          </div>
        </div>

        {/* Coordinates parsing */}
        <div className="flex flex-col gap-5 justify-between">
          <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-md">
            <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 text-sm">텔레포트 좌표 연동</h3>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4 flex flex-col gap-2 font-mono text-sm">
              <p>게임 X: <span className="text-neon-blue">{mapCoords.x}</span></p>
              <p>게임 Y: <span className="text-neon-blue">{mapCoords.y}</span></p>
              <div className="flex items-center gap-2">
                <span>게임 Z (고도):</span>
                <input 
                  type="number" 
                  value={mapCoords.z} 
                  onChange={(e) => setMapCoords(prev => ({ ...prev, z: parseInt(e.target.value) || 0 }))}
                  className="bg-black/40 border border-white/10 rounded px-2 py-0.5 w-24 text-white text-right focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs text-gray-500">생성된 이동 명령어</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  readOnly 
                  value={teleportCmd}
                  className="flex-grow bg-black/50 border border-white/10 rounded-lg p-2 text-xs text-neon-blue font-mono select-all focus:outline-none"
                />
                <button 
                  onClick={handleCopy}
                  className="bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all cursor-pointer"
                >
                  복사
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed font-mono">
            * 맵 격자 영역을 클릭하면 위치에 해당하는 스컴 게임 내 절대 좌표로 매핑됩니다.
            * 복사한 명령어를 게임 접속 후 채팅창(T)에 붙여넣어 해당 위치로 텔레포트할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
