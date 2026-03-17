import React, { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { useGroups } from '@/hooks/useGroups';
import { CollapsibleSection } from './CollapsibleSection';
import { AlignCenter, Scaling, RotateCcw, FlipHorizontal } from 'lucide-react';

export const GroupPanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const { centerGroupOnWall, scaleGroup, rotateGroup, mirrorGroup } = useGroups();
  const [scaleFactor, setScaleFactor] = useState('1.5');

  const obj = objects.find((o) => o.id === selectedIds[0]);
  if (!obj || !obj.groupId) return null;

  const wall = objects.find((o) => o.id === obj.groupId);
  const groupMembers = objects.filter((o) => o.groupId === obj.groupId && o.type === ObjectType.GLB);

  if (groupMembers.length === 0) return null;

  const wallId = obj.groupId;

  const handleScale = () => {
    const factor = parseFloat(scaleFactor);
    if (isNaN(factor) || factor <= 0) return;
    scaleGroup(wallId, factor);
  };

  return (
    <CollapsibleSection title="Grupo" defaultOpen={false}>
      <div className="space-y-4">
        <div className="text-xs text-gray-400">
          Grupo: <span className="text-white font-medium">{wall?.name || 'Importación múltiple'}</span>
          <span className="ml-2 text-gray-600">({groupMembers.length} objetos)</span>
        </div>

        <button
          onClick={() => centerGroupOnWall(wallId)}
          disabled={!wall}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all disabled:opacity-30"
        >
          <AlignCenter size={12} /> Centrar grupo en pared
        </button>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Scaling size={10} /> Escalar grupo
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0.01"
              value={scaleFactor}
              onChange={(e) => setScaleFactor(e.target.value)}
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-xs font-mono text-white"
            />
            <button
              onClick={handleScale}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all"
            >
              Aplicar
            </button>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <RotateCcw size={10} /> Rotar grupo 90°
          </p>
          <div className="flex gap-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <button
                key={axis}
                onClick={() => rotateGroup(wallId, axis)}
                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400 transition-all"
              >
                {axis.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <FlipHorizontal size={10} /> Espejar grupo
          </p>
          <div className="flex gap-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <button
                key={axis}
                onClick={() => mirrorGroup(wallId, axis)}
                className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400 transition-all"
              >
                {axis.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};
