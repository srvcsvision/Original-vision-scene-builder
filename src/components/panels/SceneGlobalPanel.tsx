import React, { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { CollapsibleSection } from './CollapsibleSection';

export const SceneGlobalPanel: React.FC = () => {
  const backgroundColor = useStore((s) => s.backgroundColor);
  const setBackgroundColor = useStore((s) => s.setBackgroundColor);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);

  const lights = objects.filter((o) => o.type.includes('light'));
  const [allLightsColor, setAllLightsColor] = useState('#ffffff');

  const applyColorToAllLights = () => {
    lights.forEach((light) => updateObject(light.id, { color: allLightsColor }));
  };

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

        {lights.length > 0 && (
          <div>
            <label className="block text-sm text-gray-400 mb-2">Color de todas las luces</label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={allLightsColor}
                onChange={(e) => setAllLightsColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
              />
              <span className="text-sm font-mono">{allLightsColor.toUpperCase()}</span>
            </div>
            <button
              onClick={applyColorToAllLights}
              className="mt-2 w-full py-2 px-3 rounded-lg text-xs font-bold transition-all border bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30"
            >
              Aplicar a todas las luces ({lights.length})
            </button>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
