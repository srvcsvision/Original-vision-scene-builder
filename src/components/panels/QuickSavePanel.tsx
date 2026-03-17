import React from 'react';
import { useStore } from '@/stores/useStore';
import { CollapsibleSection } from './CollapsibleSection';
import { Save } from 'lucide-react';

export const QuickSavePanel: React.FC = () => {
  const projectId = useStore((s) => s.projectId);
  const isDirty = useStore((s) => s.isDirty);

  if (!projectId) return null;

  const handleQuickSave = async () => {
    // Will be wired to Firebase in Phase 2
    console.log('Quick save triggered for project:', projectId);
  };

  return (
    <CollapsibleSection title="Guardado" defaultOpen={false}>
      <button
        onClick={handleQuickSave}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all border ${
          isDirty
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
            : 'bg-white/5 border-white/10 text-gray-500'
        }`}
      >
        <Save size={14} />
        {isDirty ? 'Guardar Cambios' : 'Sin cambios'}
      </button>
    </CollapsibleSection>
  );
};
