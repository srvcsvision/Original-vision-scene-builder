import React from 'react';
import { useStore } from '@/stores/useStore';
import { CollapsibleSection } from './CollapsibleSection';
import { Copy, Group, RotateCcw, FlipHorizontal } from 'lucide-react';

export const MultiSelectionPanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const addObject = useStore((s) => s.addObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);

  const selectedObjects = objects.filter((o) => selectedIds.includes(o.id));

  const handleCreateGroup = () => {
    saveSnapshot(objects);
    const groupId = crypto.randomUUID();
    selectedIds.forEach((id) => updateObject(id, { groupId }));
  };

  const handleDuplicateAll = () => {
    saveSnapshot(objects);
    selectedObjects.forEach((obj) => {
      addObject({
        ...JSON.parse(JSON.stringify(obj)),
        id: crypto.randomUUID(),
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
    });
  };

  const handleRotate90 = (axis: 'x' | 'y' | 'z') => {
    saveSnapshot(objects);
    const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    selectedObjects.forEach((obj) => {
      const newRot: [number, number, number] = [...obj.transform.rotation];
      newRot[axisIdx] += Math.PI / 2;
      updateObject(obj.id, { transform: { ...obj.transform, rotation: newRot } });
    });
  };

  const handleMirror = (axis: 'x' | 'y' | 'z') => {
    saveSnapshot(objects);
    const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;

    let sum = 0;
    selectedObjects.forEach((o) => { sum += o.transform.position[axisIdx]; });
    const center = sum / selectedObjects.length;

    selectedObjects.forEach((obj) => {
      const newPos: [number, number, number] = [...obj.transform.position];
      newPos[axisIdx] = 2 * center - newPos[axisIdx];
      updateObject(obj.id, { transform: { ...obj.transform, position: newPos } });
    });
  };

  return (
    <CollapsibleSection title="Varios objetos" defaultOpen>
      <div className="space-y-4">
        <p className="text-xs text-gray-400">
          <span className="text-white font-bold">{selectedIds.length}</span> objetos seleccionados
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleCreateGroup}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all"
          >
            <Group size={12} /> Crear grupo
          </button>
          <button
            onClick={handleDuplicateAll}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all"
          >
            <Copy size={12} /> Duplicar todos
          </button>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Rotar 90°</p>
          <div className="flex gap-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <button
                key={axis}
                onClick={() => handleRotate90(axis)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400 transition-all"
              >
                <RotateCcw size={10} /> {axis.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Espejar</p>
          <div className="flex gap-2">
            {(['x', 'y', 'z'] as const).map((axis) => (
              <button
                key={axis}
                onClick={() => handleMirror(axis)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400 transition-all"
              >
                <FlipHorizontal size={10} /> {axis.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
};
