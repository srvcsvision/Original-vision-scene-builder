import React from 'react';
import { useStore } from '@/stores/useStore';
import { EyeOff, Maximize, Pen, Camera, Film, Music } from 'lucide-react';

export const PreviewOverlay: React.FC = () => {
  const isPreview = useStore((s) => s.isPreview);
  const exitPreview = useStore((s) => s.exitPreview);
  const fov = useStore((s) => s.fov);
  const toggleFov = useStore((s) => s.toggleFov);
  const activeWallIndex = useStore((s) => s.activeWallIndex);
  const setActiveWallIndex = useStore((s) => s.setActiveWallIndex);
  const isMobile = useStore((s) => s.isMobile);
  const objects = useStore((s) => s.objects);

  if (!isPreview) return null;

  const walls = objects.filter((o) => o.name.includes('Pared'));
  const wallNames = walls.length > 0
    ? walls.map((w) => w.name.replace('Pared ', ''))
    : ['1', '2', '3', '4'];

  const tabs = [
    { id: 0, icon: <Pen size={isMobile ? 20 : 28} />, label: wallNames[0] || '1' },
    { id: 1, icon: <Camera size={isMobile ? 20 : 28} />, label: wallNames[1] || '2' },
    { id: 2, icon: <Film size={isMobile ? 20 : 28} />, label: wallNames[2] || '3' },
    { id: 3, icon: <Music size={isMobile ? 20 : 28} />, label: wallNames[3] || '4' },
  ];

  const itemWidth = isMobile ? 64 : 110;
  const navGap = 8;
  const pillPosition = navGap + activeWallIndex * (itemWidth + navGap);

  return (
    <>
      <div className="absolute top-4 left-4 z-50 flex items-center gap-2 pointer-events-none">
        <button
          onClick={exitPreview}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all pointer-events-auto shadow-2xl"
        >
          <EyeOff size={14} /> Salir
        </button>

        <button
          onClick={toggleFov}
          className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-all pointer-events-auto shadow-2xl"
        >
          <Maximize size={14} /> {fov}° Vision
        </button>
      </div>

      <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 bg-[#f5f2eb] p-2 rounded-full flex items-center gap-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-bottom-10 duration-1000 max-w-[95vw]">
        <div
          className="absolute top-2 bottom-2 bg-white rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0"
          style={{ width: `${itemWidth}px`, left: `${pillPosition}px` }}
        />
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveWallIndex(tab.id)}
            className="rounded-full transition-colors duration-500 relative flex items-center justify-center h-[48px] sm:h-[64px]"
            style={{ width: `${itemWidth}px` }}
          >
            <span
              className={`relative z-10 transition-transform duration-300 transform active:scale-90 ${
                activeWallIndex === tab.id ? 'text-[#4a3728]' : 'text-[#9b8d7e] hover:text-[#4a3728]'
              }`}
            >
              {tab.icon}
            </span>
          </button>
        ))}
      </div>
    </>
  );
};
