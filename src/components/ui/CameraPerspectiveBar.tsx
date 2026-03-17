import React, { useMemo } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';

export const CameraPerspectiveBar: React.FC = () => {
  const cameraPerspectiveId = useStore((s) => s.cameraPerspectiveId);
  const setCameraPerspectiveId = useStore((s) => s.setCameraPerspectiveId);
  const objects = useStore((s) => s.objects);

  const cameras = useMemo(
    () => objects.filter((o) => o.type === ObjectType.CAMERA),
    [objects]
  );

  const currentCamera = cameras.find((c) => c.id === cameraPerspectiveId);
  const currentIndex = cameras.findIndex((c) => c.id === cameraPerspectiveId);

  if (!cameraPerspectiveId || !currentCamera) return null;

  const handlePrev = () => {
    const prev = (currentIndex - 1 + cameras.length) % cameras.length;
    setCameraPerspectiveId(cameras[prev].id);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % cameras.length;
    setCameraPerspectiveId(cameras[next].id);
  };

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/60 backdrop-blur-xl border border-emerald-500/30 px-4 py-2 rounded-xl shadow-2xl">
      <Camera size={14} className="text-emerald-400" />
      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
        {currentCamera.name}
      </span>

      {cameras.length > 1 && (
        <>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button onClick={handlePrev} className="p-1 hover:bg-white/10 rounded transition-colors">
            <ChevronLeft size={14} className="text-gray-400" />
          </button>
          <span className="text-[10px] text-gray-500 font-mono">
            {currentIndex + 1}/{cameras.length}
          </span>
          <button onClick={handleNext} className="p-1 hover:bg-white/10 rounded transition-colors">
            <ChevronRight size={14} className="text-gray-400" />
          </button>
        </>
      )}

      <div className="w-px h-4 bg-white/10 mx-1" />
      <button
        onClick={() => setCameraPerspectiveId(null)}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X size={14} className="text-gray-400" />
      </button>
    </div>
  );
};
