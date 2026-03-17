import React, { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { DEFAULT_LIGHT_COLOR } from '@/constants/defaults';
import { Sun, ChevronDown, X } from 'lucide-react';

const LIGHT_OPTIONS = [
  { type: ObjectType.POINT_LIGHT, label: 'Point Light' },
  { type: ObjectType.SPOT_LIGHT, label: 'Spot Light' },
  { type: ObjectType.DIRECTIONAL_LIGHT, label: 'Directional Light' },
  { type: ObjectType.AMBIENT_LIGHT, label: 'Ambient Light' },
] as const;

export const LightToolbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const objects = useStore((s) => s.objects);
  const addObject = useStore((s) => s.addObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);
  const setSelectedId = useStore((s) => s.setSelectedId);
  const selectedIds = useStore((s) => s.selectedIds);
  const isPreview = useStore((s) => s.isPreview);

  const lightCount = objects.filter((o) => o.type.includes('light')).length;

  if (isPreview) return null;

  const handleAddLight = (type: ObjectType) => {
    saveSnapshot(objects);
    const id = crypto.randomUUID();
    const isAmbient = type === ObjectType.AMBIENT_LIGHT;
    addObject({
      id,
      name: `${type.replace('_', ' ')} ${lightCount + 1}`,
      type,
      transform: {
        position: isAmbient ? [0, 0, 0] : [0, 5, 0],
        rotation: [0, 0, 0],
        scale: [1, 1, 1],
      },
      color: DEFAULT_LIGHT_COLOR,
      intensity: 1,
      visible: true,
      locked: false,
      castShadow: false,
      angle: type === ObjectType.SPOT_LIGHT ? 0.52 : undefined,
      penumbra: type === ObjectType.SPOT_LIGHT ? 0.3 : undefined,
      distance: 0,
      decay: 2,
      target: type === ObjectType.SPOT_LIGHT || type === ObjectType.DIRECTIONAL_LIGHT ? [0, 0, 0] : undefined,
    });
    setSelectedId(id);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-xl border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300 transition-all"
        >
          <Sun size={14} />
          Agregar Luz
          <ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-1 left-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[180px]">
            {LIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                onClick={() => handleAddLight(opt.type)}
                className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] font-bold text-amber-400">
        {lightCount}
      </span>

      {selectedIds[0] && objects.find((o) => o.id === selectedIds[0] && o.type.includes('light')) && (
        <button
          onClick={() => setSelectedId(null)}
          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};
