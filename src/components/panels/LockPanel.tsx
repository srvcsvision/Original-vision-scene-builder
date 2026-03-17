import React from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { CollapsibleSection } from './CollapsibleSection';
import { Lock, Unlock } from 'lucide-react';

export const LockPanel: React.FC = () => {
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);

  const planes = objects.filter((o) => o.type === ObjectType.PLANE);
  if (planes.length === 0) return null;

  const allLocked = planes.every((p) => p.locked);

  const handleToggleAll = () => {
    saveSnapshot(objects);
    planes.forEach((p) => {
      updateObject(p.id, { locked: !allLocked });
    });
  };

  return (
    <CollapsibleSection title="Bloquear Paredes/Pisos" defaultOpen={false}>
      <button
        onClick={handleToggleAll}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border ${
          allLocked
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
        }`}
      >
        {allLocked ? <Lock size={14} /> : <Unlock size={14} />}
        {allLocked ? 'Desbloquear Todas' : 'Bloquear Todas'}
      </button>
    </CollapsibleSection>
  );
};
