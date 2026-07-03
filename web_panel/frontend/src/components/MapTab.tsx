import React from 'react';
import { i18n, type Lang } from '../utils/i18n';

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
  lang: Lang;
}

export default function MapTab({
  mapCoords,
  setMapCoords,
  markerPos,
  handleMapClick,
  mapCanvasRef,
  teleportCmd,
  setMessage,
  lang,
}: MapTabProps) {
  const t = i18n[lang];

  const handleCopy = () => {
    navigator.clipboard.writeText(teleportCmd);
    setMessage(`${t.btnCopy} ${t.connSuccess}: ${teleportCmd}`);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      <div>
        <h1 className="font-heading text-3xl font-bold text-white mb-2">{t.mapTitle}</h1>
        <p className="text-gray-400 text-sm">{t.mapDesc}</p>
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
            <span className="font-heading text-xs tracking-widest text-white/10 pointer-events-none">{t.mapGrid}</span>
          </div>
        </div>

        {/* Coordinates parsing */}
        <div className="flex flex-col gap-5 justify-between">
          <div className="border border-white/10 bg-white/5 rounded-2xl p-6 flex flex-col gap-4 shadow-md">
            <h3 className="text-white font-bold border-l-3 border-neon-blue pl-2 text-sm">{t.mapCoordsSetup}</h3>
            <div className="bg-black/30 border border-white/10 rounded-lg p-4 flex flex-col gap-2 font-mono text-sm">
              <p>Game X: <span className="text-neon-blue">{mapCoords.x}</span></p>
              <p>Game Y: <span className="text-neon-blue">{mapCoords.y}</span></p>
              <div className="flex items-center gap-2">
                <span>{t.labelGameZ}</span>
                <input 
                  type="number" 
                  value={mapCoords.z} 
                  onChange={(e) => setMapCoords(prev => ({ ...prev, z: parseInt(e.target.value) || 0 }))}
                  className="bg-black/40 border border-white/10 rounded px-2 py-0.5 w-24 text-white text-right focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs text-gray-500">{t.labelCmdGenerated}</label>
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
                  {t.btnCopy}
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed font-mono whitespace-pre-line">
            {t.mapTip}
          </p>
        </div>
      </div>
    </div>
  );
}
