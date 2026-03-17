import React from 'react';
import { useStore } from '@/stores/useStore';
import { CollapsibleSection } from './CollapsibleSection';
import { Copy, Clipboard } from 'lucide-react';

export const CopyPastePanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const copyObjects = useStore((s) => s.copyObjects);
  const copiedObjects = useStore((s) => s.copiedObjects);
  const addObject = useStore((s) => s.addObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);
  const setSelectedId = useStore((s) => s.setSelectedId);

  const obj = objects.find((o) => o.id === selectedIds[0]);
  if (!obj) return null;

  const handleCopy = () => {
    copyObjects([obj]);
  };

  const handlePaste = () => {
    if (copiedObjects.length === 0) return;
    saveSnapshot(objects);
    copiedObjects.forEach((copied) => {
      const id = crypto.randomUUID();
      addObject({
        ...copied,
        id,
        name: `${copied.name} (copia)`,
        transform: {
          ...copied.transform,
          position: [
            copied.transform.position[0] + 1,
            copied.transform.position[1],
            copied.transform.position[2],
          ],
        },
      });
      setSelectedId(id);
    });
  };

  return (
    <CollapsibleSection title="Copiar / Pegar" defaultOpen={false}>
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all"
        >
          <Copy size={12} /> Copiar
        </button>
        <button
          onClick={handlePaste}
          disabled={copiedObjects.length === 0}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-gray-300 transition-all disabled:opacity-30"
        >
          <Clipboard size={12} /> Pegar
        </button>
      </div>
    </CollapsibleSection>
  );
};
