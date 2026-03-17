import React, { useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { CollapsibleSection } from './CollapsibleSection';

interface TransformGroupProps {
  title: string;
  values: [number, number, number];
  onChange: (axis: 'x' | 'y' | 'z', value: string) => void;
  step?: number;
}

const TransformControlGroup: React.FC<TransformGroupProps> = React.memo(
  ({ title, values, onChange, step = 1 }) => (
    <div>
      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{title}</label>
      <div className="grid grid-cols-3 gap-2">
        {(['x', 'y', 'z'] as const).map((axis, i) => (
          <div key={axis}>
            <label className="block text-[8px] text-gray-600 uppercase mb-1">{axis}</label>
            <input
              type="number"
              step={step}
              value={values[i]}
              onChange={(e) => onChange(axis, e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-white/20 font-mono text-white"
            />
          </div>
        ))}
      </div>
    </div>
  )
);
TransformControlGroup.displayName = 'TransformControlGroup';

export const TransformPanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);

  const obj = objects.find((o) => o.id === selectedIds[0]);
  if (!obj) return null;

  const handleChange = (axis: 'x' | 'y' | 'z', value: string, field: 'position' | 'rotation' | 'scale') => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    saveSnapshot(objects);
    const newTransform = { ...obj.transform };
    const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    const arr = [...newTransform[field]] as [number, number, number];
    arr[idx] = numValue;
    newTransform[field] = arr;
    updateObject(obj.id, { transform: newTransform });
  };

  return (
    <CollapsibleSection title="Transform">
      <div className="space-y-4">
        <TransformControlGroup title="Posición" values={obj.transform.position} onChange={(a, v) => handleChange(a, v, 'position')} />
        <TransformControlGroup title="Rotación" values={obj.transform.rotation} onChange={(a, v) => handleChange(a, v, 'rotation')} step={0.1} />
        <TransformControlGroup title="Escala" values={obj.transform.scale} onChange={(a, v) => handleChange(a, v, 'scale')} step={0.1} />
      </div>
    </CollapsibleSection>
  );
};
