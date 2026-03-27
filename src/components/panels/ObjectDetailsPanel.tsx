import React, { useRef } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { CollapsibleSection } from './CollapsibleSection';
import { Lock, Unlock, Eye, EyeOff, Copy, Trash2, RefreshCw, Sun, SunDim } from 'lucide-react';

const isLightType = (type: ObjectType) =>
  type === ObjectType.POINT_LIGHT ||
  type === ObjectType.SPOT_LIGHT ||
  type === ObjectType.DIRECTIONAL_LIGHT ||
  type === ObjectType.AMBIENT_LIGHT;

export const ObjectDetailsPanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const addObject = useStore((s) => s.addObject);
  const removeObject = useStore((s) => s.removeObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);
  const selectSingle = useStore((s) => s.selectSingle);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const obj = objects.find((o) => o.id === selectedIds[0]);
  if (!obj) return null;

  const handleDuplicate = () => {
    saveSnapshot(objects);
    const id = crypto.randomUUID();
    addObject({
      ...JSON.parse(JSON.stringify(obj)),
      id,
      name: `${obj.name} (copia)`,
      transform: {
        ...obj.transform,
        position: [
          obj.transform.position[0] + 1,
          obj.transform.position[1],
          obj.transform.position[2],
        ],
      },
    });
    selectSingle(id);
  };

  const handleDelete = () => {
    saveSnapshot(objects);
    removeObject(obj.id);
  };

  const handleReplaceGlb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      updateObject(obj.id, { url, name: file.name });
    }
    e.target.value = '';
  };

  return (
    <CollapsibleSection title="Detalles del Objeto">
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Nombre</label>
          <input
            type="text"
            value={obj.name}
            onChange={(e) => updateObject(obj.id, { name: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => updateObject(obj.id, { visible: !obj.visible })}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border ${
              obj.visible
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {obj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            {obj.visible ? 'Visible' : 'Oculto'}
          </button>

          <button
            onClick={() => updateObject(obj.id, { locked: !obj.locked })}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border ${
              obj.locked
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            {obj.locked ? <Lock size={14} /> : <Unlock size={14} />}
            {obj.locked ? 'Bloqueado' : 'Libre'}
          </button>
        </div>

        {!isLightType(obj.type) && obj.type !== ObjectType.CAMERA && (
          <button
            onClick={() => updateObject(obj.id, { castShadow: obj.castShadow === false })}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border ${
              obj.castShadow !== false
                ? 'bg-white/5 border-white/10 text-white'
                : 'bg-gray-600/10 border-gray-600/20 text-gray-500'
            }`}
          >
            {obj.castShadow !== false ? <Sun size={14} /> : <SunDim size={14} />}
            {obj.castShadow !== false ? 'Emite sombra' : 'No emite sombra'}
          </button>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleDuplicate}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all"
          >
            <Copy size={12} /> Duplicar
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs font-bold text-red-400 transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {obj.type === ObjectType.GLB && (
          <>
            <button
              onClick={() => replaceInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg text-xs font-bold text-blue-400 transition-all"
            >
              <RefreshCw size={12} /> Reemplazar modelo GLB
            </button>
            <input
              type="file"
              ref={replaceInputRef}
              onChange={handleReplaceGlb}
              className="hidden"
              accept=".glb,.gltf,.bin"
            />
          </>
        )}
      </div>
    </CollapsibleSection>
  );
};
