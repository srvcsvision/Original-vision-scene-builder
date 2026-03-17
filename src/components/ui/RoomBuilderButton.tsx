import React, { useState } from 'react';
import { useRoomBuilder } from '@/hooks/useRoomBuilder';
import { useStore } from '@/stores/useStore';
import { Plus, X } from 'lucide-react';

export const RoomBuilderButton: React.FC = () => {
  const { createRoom } = useRoomBuilder();
  const objects = useStore((s) => s.objects);
  const [showConfig, setShowConfig] = useState(false);
  const [width, setWidth] = useState(10);
  const [height, setHeight] = useState(10);
  const [depth, setDepth] = useState(10);

  const hasRoom = objects.some((o) => o.name === 'Suelo');

  const handleCreate = () => {
    createRoom({ width, height, depth });
    setShowConfig(false);
  };

  if (hasRoom) return null;

  return (
    <div className="absolute top-4 left-4 z-10">
      {!showConfig ? (
        <button
          onClick={() => setShowConfig(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-200 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-white/5 text-black"
        >
          <Plus size={14} /> Crear Habitación
        </button>
      ) : (
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3 w-56 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dimensiones</span>
            <button onClick={() => setShowConfig(false)} className="text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          </div>
          {[
            { label: 'Ancho', value: width, set: setWidth },
            { label: 'Alto', value: height, set: setHeight },
            { label: 'Profundidad', value: depth, set: setDepth },
          ].map(({ label, value, set }) => (
            <div key={label}>
              <label className="block text-[9px] text-gray-500 uppercase mb-1">{label}</label>
              <input
                type="number"
                min="1"
                max="100"
                value={value}
                onChange={(e) => set(Number(e.target.value) || 1)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          ))}
          <button
            onClick={handleCreate}
            className="w-full py-2 bg-white hover:bg-gray-200 rounded-lg text-xs font-bold text-black transition-all"
          >
            Crear
          </button>
        </div>
      )}
    </div>
  );
};
