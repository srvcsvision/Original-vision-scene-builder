import React from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { CollapsibleSection } from './CollapsibleSection';
import { MAX_SHADOW_LIGHTS } from '@/constants/defaults';

export const LightPanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);

  const obj = objects.find((o) => o.id === selectedIds[0]);
  if (!obj || !obj.type.includes('light')) return null;

  const isSpot = obj.type === ObjectType.SPOT_LIGHT;
  const isDirectional = obj.type === ObjectType.DIRECTIONAL_LIGHT;
  const isAmbient = obj.type === ObjectType.AMBIENT_LIGHT;
  const hasTarget = isSpot || isDirectional;
  const hasDistance = obj.type === ObjectType.POINT_LIGHT || isSpot;

  const shadowLightCount = objects.filter((o) => o.type.includes('light') && o.castShadow).length;
  const canEnableShadow = obj.castShadow || shadowLightCount < MAX_SHADOW_LIGHTS;

  return (
    <CollapsibleSection title="Propiedades de Luz">
      <div className="bg-amber-900/10 p-4 rounded-xl border border-amber-500/20 space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Tipo</label>
          <select
            value={obj.type}
            onChange={(e) => updateObject(obj.id, { type: e.target.value as ObjectType })}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
          >
            <option value={ObjectType.POINT_LIGHT}>Point Light</option>
            <option value={ObjectType.SPOT_LIGHT}>Spot Light</option>
            <option value={ObjectType.DIRECTIONAL_LIGHT}>Directional Light</option>
            <option value={ObjectType.AMBIENT_LIGHT}>Ambient Light</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Intensidad</label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={obj.intensity ?? 1}
            onChange={(e) => updateObject(obj.id, { intensity: parseFloat(e.target.value) })}
            className="w-full accent-amber-400"
          />
          <span className="text-[10px] text-gray-500 font-mono">{(obj.intensity ?? 1).toFixed(1)}</span>
        </div>

        {isSpot && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Ángulo</label>
              <input
                type="range"
                min="0"
                max="1.57"
                step="0.01"
                value={obj.angle ?? 0.52}
                onChange={(e) => updateObject(obj.id, { angle: parseFloat(e.target.value) })}
                className="w-full accent-amber-400"
              />
              <span className="text-[10px] text-gray-500 font-mono">{(obj.angle ?? 0.52).toFixed(2)}</span>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Penumbra</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={obj.penumbra ?? 0.3}
                onChange={(e) => updateObject(obj.id, { penumbra: parseFloat(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>
          </>
        )}

        {hasDistance && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Distancia (0 = infinita)</label>
            <input
              type="number"
              min="0"
              step="1"
              value={obj.distance ?? 0}
              onChange={(e) => updateObject(obj.id, { distance: parseFloat(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>
        )}

        {hasDistance && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Decay</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={obj.decay ?? 2}
              onChange={(e) => updateObject(obj.id, { decay: parseFloat(e.target.value) })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
            />
          </div>
        )}

        {hasTarget && (
          <div>
            <label className="block text-xs text-gray-400 mb-2">Target (X, Y, Z)</label>
            <div className="grid grid-cols-3 gap-2">
              {([0, 1, 2] as const).map((i) => (
                <input
                  key={i}
                  type="number"
                  step="0.5"
                  value={(obj.target ?? [0, 0, 0])[i]}
                  onChange={(e) => {
                    const t = [...(obj.target ?? [0, 0, 0])] as [number, number, number];
                    t[i] = parseFloat(e.target.value) || 0;
                    updateObject(obj.id, { target: t });
                  }}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-[10px] font-mono text-white"
                />
              ))}
            </div>
          </div>
        )}

        {!isAmbient && (
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={obj.castShadow || false}
                disabled={!canEnableShadow && !obj.castShadow}
                onChange={(e) => updateObject(obj.id, { castShadow: e.target.checked })}
                className="accent-amber-400"
              />
              <span className="text-xs text-gray-300">
                Sombras {!canEnableShadow && !obj.castShadow ? `(máx ${MAX_SHADOW_LIGHTS})` : ''}
              </span>
            </label>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
};
