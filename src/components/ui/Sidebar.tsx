import React from 'react';
import { useStore } from '@/stores/useStore';
import { SceneGlobalPanel } from '@/components/panels/SceneGlobalPanel';
import { ObjectDetailsPanel } from '@/components/panels/ObjectDetailsPanel';
import { TransformPanel } from '@/components/panels/TransformPanel';
import { MaterialPanel } from '@/components/panels/MaterialPanel';
import { LightPanel } from '@/components/panels/LightPanel';
import { MetadataPanel } from '@/components/panels/MetadataPanel';
import { UniformScalePanel } from '@/components/panels/UniformScalePanel';
import { CopyPastePanel } from '@/components/panels/CopyPastePanel';
import { GroupPanel } from '@/components/panels/GroupPanel';
import { LockPanel } from '@/components/panels/LockPanel';
import { MultiSelectionPanel } from '@/components/panels/MultiSelectionPanel';

import { UniqueGlbsBadge } from '@/components/panels/UniqueGlbsBadge';
import { Settings, X, ChevronLeft } from 'lucide-react';

export const SidebarRight: React.FC = () => {
  const isPropsOpen = useStore((s) => s.isPropsOpen);
  const setIsPropsOpen = useStore((s) => s.setIsPropsOpen);
  const selectedIds = useStore((s) => s.selectedIds);
  const isPreview = useStore((s) => s.isPreview);

  const primarySelectedId = selectedIds[0] ?? null;
  const isMultiSelect = selectedIds.length > 1;

  if (isPreview) return null;

  return (
    <>
      <div
        className={`fixed right-0 lg:relative z-40 h-full bg-black/80 lg:bg-black/40 backdrop-blur-xl border-l border-white/5 transition-all duration-300 ease-in-out ${
          isPropsOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full lg:w-0 overflow-hidden'
        }`}
      >
        <div className="w-80 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-gray-500" />
              <h2 className="font-semibold text-sm">Propiedades</h2>
            </div>
            <button onClick={() => setIsPropsOpen(false)} className="p-1 hover:bg-white/10 rounded">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-20">
            <UniqueGlbsBadge />
            {isMultiSelect ? (
              <>
                <MultiSelectionPanel />
                <SceneGlobalPanel />
              </>
            ) : primarySelectedId ? (
              <>
                <ObjectDetailsPanel />
                <TransformPanel />
                <UniformScalePanel />
                <MaterialPanel />
                <LightPanel />
                <MetadataPanel />
                <CopyPastePanel />
                <GroupPanel />
              </>
            ) : (
              <>
                <SceneGlobalPanel />
                <LockPanel />
                <div className="text-center py-12 px-4">
                  <p className="text-gray-500 text-sm italic">
                    Selecciona un objeto (o varios con Ctrl/Cmd+clic) para editar o agrupar.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!isPropsOpen && primarySelectedId && !isPreview && (
        <button
          onClick={() => setIsPropsOpen(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>
      )}
    </>
  );
};
