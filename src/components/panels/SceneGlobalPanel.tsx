import React from 'react';
import { useStore } from '@/stores/useStore';
import { CollapsibleSection } from './CollapsibleSection';

export const SceneGlobalPanel: React.FC = () => {
  const backgroundColor = useStore((s) => s.backgroundColor);
  const setBackgroundColor = useStore((s) => s.setBackgroundColor);

  return (
    <CollapsibleSection title="Escena Global">
      <div className="space-y-4 bg-gray-800/50 p-4 rounded-xl border border-gray-800">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Color de Fondo</label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
            />
            <span className="text-sm font-mono">{backgroundColor.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};
