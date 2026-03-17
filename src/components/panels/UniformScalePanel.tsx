import React, { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { CollapsibleSection } from './CollapsibleSection';

export const UniformScalePanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);

  const obj = objects.find((o) => o.id === selectedIds[0]);
  if (!obj) return null;

  const currentUniform = obj.transform.scale[0];

  const handleUniformScale = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    saveSnapshot(objects);
    updateObject(obj.id, {
      transform: {
        ...obj.transform,
        scale: [num, num, num],
      },
    });
  };

  return (
    <CollapsibleSection title="Escala Uniforme" defaultOpen={false}>
      <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
        <input
          type="number"
          step="0.1"
          min="0.01"
          value={currentUniform}
          onChange={(e) => handleUniformScale(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm font-mono text-white focus:outline-none focus:ring-1 focus:ring-white/20"
        />
        <p className="text-[10px] text-gray-600 mt-2">Aplica la misma escala a X, Y, Z</p>
      </div>
    </CollapsibleSection>
  );
};
