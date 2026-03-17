import React, { useRef } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { CollapsibleSection } from './CollapsibleSection';
import { ImagePlus, X } from 'lucide-react';

export const MaterialPanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const textureInputRef = useRef<HTMLInputElement>(null);

  const obj = objects.find((o) => o.id === selectedIds[0]);
  if (!obj || obj.type === ObjectType.GLB) return null;

  const isLight = obj.type.includes('light');

  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateObject(obj.id, { textureUrl: url });
    }
    e.target.value = '';
  };

  const handleRemoveTexture = () => {
    updateObject(obj.id, { textureUrl: undefined });
  };

  return (
    <CollapsibleSection title="Material">
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800 space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">{isLight ? 'Color' : 'Color Base'}</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={obj.color}
              onChange={(e) => updateObject(obj.id, { color: e.target.value })}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
            />
            <span className="text-sm font-mono">{obj.color.toUpperCase()}</span>
          </div>
        </div>

        {isLight ? null : (
          <>
            {!obj.type.includes('light') && (
              <div>
                <label className="block text-xs text-gray-400 mb-2">Textura</label>
                {obj.textureUrl ? (
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded border border-white/10 overflow-hidden">
                      <img src={obj.textureUrl} alt="texture" className="w-full h-full object-cover" />
                    </div>
                    <button
                      onClick={handleRemoveTexture}
                      className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded text-[10px] text-red-400"
                    >
                      <X size={10} /> Quitar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => textureInputRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400"
                  >
                    <ImagePlus size={12} /> Cargar textura
                  </button>
                )}
                <input
                  type="file"
                  ref={textureInputRef}
                  onChange={handleTextureUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1">Rugosidad</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={obj.roughness || 0.5}
                onChange={(e) => updateObject(obj.id, { roughness: parseFloat(e.target.value) })}
                className="w-full accent-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Metálico</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={obj.metalness || 0.5}
                onChange={(e) => updateObject(obj.id, { metalness: parseFloat(e.target.value) })}
                className="w-full accent-white"
              />
            </div>
          </>
        )}
      </div>
    </CollapsibleSection>
  );
};
