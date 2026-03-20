import React, { useMemo } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { CollapsibleSection } from './CollapsibleSection';
import { Type, Film, MapPin, ListOrdered } from 'lucide-react';

export const MetadataPanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);

  const walls = useMemo(
    () => objects.filter((o) => o.type === ObjectType.PLANE && o.name?.toLowerCase().includes('pared')),
    [objects],
  );

  const obj = objects.find((o) => o.id === selectedIds[0]);
  if (!obj || obj.type !== ObjectType.GLB) return null;

  return (
    <CollapsibleSection title="Metadatos">
      <div className="space-y-4">
        {/* Ubicación en Exposición */}
        <div className="space-y-4 bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <MapPin size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ubicación en Exposición</span>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1 uppercase">Pared</label>
            <select
              value={obj.wallLabel || ''}
              onChange={(e) => updateObject(obj.id, { wallLabel: e.target.value || undefined })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white appearance-none cursor-pointer"
            >
              <option value="">Sin asignar</option>
              {walls.map((wall) => (
                <option key={wall.id} value={wall.name}>
                  {wall.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1 uppercase flex items-center gap-1">
              <ListOrdered size={10} /> Posición en la lista
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={obj.wallPosition ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Math.max(1, parseInt(e.target.value, 10));
                updateObject(obj.id, { wallPosition: val });
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
              placeholder="1, 2, 3..."
            />
          </div>
        </div>

        {/* Activar Modal */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={obj.clickable || false}
                onChange={(e) => updateObject(obj.id, { clickable: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white" />
            </div>
            <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Activar Modal</span>
          </label>
        </div>

        {obj.clickable && (
          <div className="space-y-4 bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <Type size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Contenido del Modal</span>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase">Título</label>
              <input
                type="text"
                value={obj.modalTitle || ''}
                onChange={(e) => updateObject(obj.id, { modalTitle: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                placeholder="Título del modal..."
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase">Descripción</label>
              <textarea
                value={obj.modalDescription || ''}
                onChange={(e) => updateObject(obj.id, { modalDescription: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white h-24 resize-none"
                placeholder="Escribe la descripción narrativa..."
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase flex items-center gap-1">
                <Film size={10} /> URL de Video
              </label>
              <input
                type="url"
                value={obj.videoUrl || ''}
                onChange={(e) => updateObject(obj.id, { videoUrl: e.target.value })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                placeholder="https://..."
              />
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
