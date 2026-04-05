import React, { useCallback, useRef, useState } from 'react';
import { useStore } from '@/stores/useStore';
import { CollapsibleSection } from './CollapsibleSection';
import { Plus, Trash2, ImagePlus, Pencil, Check, X, Loader2 } from 'lucide-react';
import { uploadPresenterImage } from '@/services/storageService';
import { resizePresenterImage } from '@/utils/imageResize';
import type { Presenter } from '@/types';

export const PresentersPanel: React.FC = () => {
  const presenters = useStore((s) => s.presenters);
  const addPresenter = useStore((s) => s.addPresenter);
  const updatePresenter = useStore((s) => s.updatePresenter);
  const removePresenter = useStore((s) => s.removePresenter);
  const projectId = useStore((s) => s.projectId);
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingForId, setUploadingForId] = useState<string | null>(null);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  const handleAdd = useCallback(() => {
    const id = crypto.randomUUID();
    const newPresenter: Presenter = {
      id,
      name: `Presentador ${presenters.length + 1}`,
      imageUrl: '',
    };
    addPresenter(newPresenter);
    setEditingId(id);
    setEditName(newPresenter.name);
  }, [presenters.length, addPresenter]);

  const handleStartEdit = useCallback((p: Presenter) => {
    setEditingId(p.id);
    setEditName(p.name);
  }, []);

  const handleConfirmEdit = useCallback(() => {
    if (editingId && editName.trim()) {
      updatePresenter(editingId, { name: editName.trim() });
    }
    setEditingId(null);
  }, [editingId, editName, updatePresenter]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleRemove = useCallback((id: string) => {
    removePresenter(id);
    for (const obj of objects) {
      if (obj.presenterIds?.includes(id)) {
        updateObject(obj.id, {
          presenterIds: obj.presenterIds.filter((pid) => pid !== id),
        });
      }
    }
  }, [removePresenter, objects, updateObject]);

  const handleImageUpload = useCallback(async (presenterId: string, file: File) => {
    setUploadingImageId(presenterId);
    try {
      const resized = await resizePresenterImage(file);

      if (!projectId) {
        const localUrl = URL.createObjectURL(resized);
        updatePresenter(presenterId, { imageUrl: localUrl });
        return;
      }

      const fileName = `${presenterId}.jpg`;
      const result = await uploadPresenterImage(projectId, fileName, resized);
      if (result.url) {
        updatePresenter(presenterId, { imageUrl: result.url });
      } else {
        const localUrl = URL.createObjectURL(resized);
        updatePresenter(presenterId, { imageUrl: localUrl });
      }
    } catch (err) {
      console.warn('[PresentersPanel] Error processing image:', err);
      const localUrl = URL.createObjectURL(file);
      updatePresenter(presenterId, { imageUrl: localUrl });
    } finally {
      setUploadingImageId(null);
    }
  }, [projectId, updatePresenter]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && uploadingForId) {
      handleImageUpload(uploadingForId, file);
    }
    setUploadingForId(null);
    e.target.value = '';
  }, [uploadingForId, handleImageUpload]);

  const triggerUpload = useCallback((id: string) => {
    setUploadingForId(id);
    setTimeout(() => editFileInputRef.current?.click(), 0);
  }, []);

  return (
    <CollapsibleSection title="Presentadores">
      <div className="space-y-3">
        <input
          ref={editFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {presenters.length === 0 && (
          <p className="text-[11px] text-gray-600 italic px-1">
            No hay presentadores. Agrega uno para asignarlos a los modales.
          </p>
        )}

        {presenters.map((p) => (
          <div
            key={p.id}
            className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10 group"
          >
            <button
              onClick={() => triggerUpload(p.id)}
              disabled={uploadingImageId === p.id}
              className="relative w-10 h-10 rounded-full bg-gray-800 border border-white/10 overflow-hidden shrink-0 hover:border-white/30 transition-colors disabled:opacity-50"
              title="Cambiar imagen"
            >
              {uploadingImageId === p.id ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 size={14} className="animate-spin text-emerald-400" />
                </div>
              ) : p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <ImagePlus size={14} />
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              {editingId === p.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white min-w-0"
                    autoFocus
                  />
                  <button
                    onClick={handleConfirmEdit}
                    className="p-1 hover:bg-emerald-500/20 rounded text-emerald-400"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 hover:bg-red-500/20 rounded text-red-400"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-white truncate">{p.name}</p>
              )}
            </div>

            {editingId !== p.id && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleStartEdit(p)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-colors"
                  title="Editar nombre"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => handleRemove(p.id)}
                  className="p-1.5 hover:bg-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        ))}

        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-xs font-medium text-gray-400 hover:text-white transition-all"
        >
          <Plus size={14} /> Agregar Presentador
        </button>
      </div>
    </CollapsibleSection>
  );
};
