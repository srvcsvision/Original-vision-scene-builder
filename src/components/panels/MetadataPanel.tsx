import React, { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { CollapsibleSection } from './CollapsibleSection';
import { Type, Film, MapPin, ListOrdered, Maximize2, X, Users } from 'lucide-react';

function doubleNewlines(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '\n\n');
}

const PresenterMultiSelect: React.FC<{ presenterIds: string[]; onChange: (ids: string[]) => void }> = React.memo(({ presenterIds, onChange }) => {
  const presenters = useStore((s) => s.presenters);

  if (presenters.length === 0) {
    return (
      <p className="text-[11px] text-gray-600 italic">
        No hay presentadores. Agregalos desde el panel lateral (sin selección).
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {presenters.map((p) => {
        const checked = presenterIds.includes(p.id);
        return (
          <button
            key={p.id}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (checked) {
                onChange(presenterIds.filter((pid) => pid !== p.id));
              } else {
                onChange([...presenterIds, p.id]);
              }
            }}
            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-left ${
              checked ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-gray-900/50 border border-transparent hover:border-white/10'
            }`}
          >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
              checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'
            }`}>
              {checked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.name} className="w-5 h-5 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gray-700 shrink-0" />
            )}
            <span className="text-xs text-white truncate">{p.name}</span>
          </button>
        );
      })}
    </div>
  );
});

export const MetadataPanel: React.FC = () => {
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);

  const walls = useMemo(
    () => objects.filter((o) => o.type === ObjectType.PLANE && o.name?.toLowerCase().includes('pared')),
    [objects],
  );

  const [expandedModal, setExpandedModal] = useState(false);

  const handleDescPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const pasted = e.clipboardData.getData('text');
      if (!pasted.includes('\n') && !pasted.includes('\r')) return;

      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const current = ta.value;
      const doubled = doubleNewlines(pasted);
      const next = current.slice(0, start) + doubled + current.slice(end);
      updateObject(selectedIds[0], { modalDescription: next });

      requestAnimationFrame(() => {
        const pos = start + doubled.length;
        ta.selectionStart = pos;
        ta.selectionEnd = pos;
      });
    },
    [selectedIds, updateObject],
  );

  const obj = objects.find((o) => o.id === selectedIds[0]);
  if (!obj || obj.type !== ObjectType.GLB) return null;

  return (
    <CollapsibleSection title="Metadatos">
      <div className="space-y-4">
        {/* Ubicación en Exposición */}
        <div className="space-y-4 bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2 text-blue-400">
            <MapPin size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Ubicación en Exposición</span>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1 uppercase">Pared</label>
            <select
              value={obj.wallLabel || ''}
              onChange={(e) => updateObject(obj.id, { wallLabel: e.target.value || undefined })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white appearance-none cursor-pointer"
            >
              <option value="">Sin asignar</option>
              {walls.map((wall) => (
                <option key={wall.id} value={wall.name}>
                  {wall.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] text-gray-500 mb-1 uppercase flex items-center gap-1">
              <ListOrdered size={10} /> Posición en la lista
            </label>
            <input
              type="number"
              min={1}
              step={1}
              value={obj.wallPosition ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : Math.max(1, parseInt(e.target.value, 10));
                updateObject(obj.id, { wallPosition: val });
              }}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
              placeholder="1, 2, 3..."
            />
          </div>
        </div>

        {/* Activar Modal */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={obj.clickable || false}
                onChange={(e) => updateObject(obj.id, { clickable: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white" />
            </div>
            <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Activar Modal</span>
          </label>
        </div>

        {obj.clickable && (
          <div className="space-y-4 bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Type size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Contenido del Modal</span>
              </div>
              <button
                onClick={() => setExpandedModal(true)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-emerald-400 transition-colors"
                title="Expandir editor"
              >
                <Maximize2 size={14} />
              </button>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase">Título</label>
              <input
                type="text"
                value={obj.modalTitle || ''}
                onChange={(e) => updateObject(obj.id, { modalTitle: e.target.value })}
                onBlur={(e) => updateObject(obj.id, { modalTitle: e.target.value.trim() })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                placeholder="Título del modal..."
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase">Descripción</label>
              <textarea
                value={obj.modalDescription || ''}
                onChange={(e) => updateObject(obj.id, { modalDescription: e.target.value })}
                onPaste={handleDescPaste}
                onBlur={(e) => updateObject(obj.id, { modalDescription: e.target.value.trim() })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white h-24 resize-none"
                placeholder="Escribe la descripción narrativa..."
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1 uppercase flex items-center gap-1">
                <Film size={10} /> URL de Video
              </label>
              <input
                type="url"
                value={obj.videoUrl || ''}
                onChange={(e) => updateObject(obj.id, { videoUrl: e.target.value })}
                onBlur={(e) => updateObject(obj.id, { videoUrl: e.target.value.trim() })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 mb-1.5 uppercase flex items-center gap-1">
                <Users size={10} /> Presentadores
              </label>
              <PresenterMultiSelect
                presenterIds={obj.presenterIds || []}
                onChange={(ids) => updateObject(obj.id, { presenterIds: ids })}
              />
            </div>
          </div>
        )}
      </div>

      {expandedModal && createPortal(
        <div
          className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
          onClick={(e) => { if (e.target === e.currentTarget) setExpandedModal(false); }}
        >
          <div className="relative w-full max-w-xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-2 text-emerald-400">
                <Type size={16} />
                <span className="text-sm font-bold text-white">Contenido del Modal</span>
                <span className="text-[10px] text-gray-500 ml-1">— {obj.name}</span>
              </div>
              <button
                onClick={() => setExpandedModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Título</label>
                <input
                  type="text"
                  value={obj.modalTitle || ''}
                  onChange={(e) => updateObject(obj.id, { modalTitle: e.target.value })}
                  onBlur={(e) => updateObject(obj.id, { modalTitle: e.target.value.trim() })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="Título del modal..."
                  autoFocus
                />
              </div>

              <div className="flex-1">
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Descripción</label>
                <textarea
                  value={obj.modalDescription || ''}
                  onChange={(e) => updateObject(obj.id, { modalDescription: e.target.value })}
                  onPaste={handleDescPaste}
                  onBlur={(e) => updateObject(obj.id, { modalDescription: e.target.value.trim() })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 min-h-[250px]"
                  placeholder="Escribe la descripción narrativa..."
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Film size={10} /> URL de Video
                </label>
                <input
                  type="url"
                  value={obj.videoUrl || ''}
                  onChange={(e) => updateObject(obj.id, { videoUrl: e.target.value })}
                  onBlur={(e) => updateObject(obj.id, { videoUrl: e.target.value.trim() })}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Users size={10} /> Presentadores
                </label>
                <PresenterMultiSelect
                  presenterIds={obj.presenterIds || []}
                  onChange={(ids) => updateObject(obj.id, { presenterIds: ids })}
                />
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </CollapsibleSection>
  );
};
