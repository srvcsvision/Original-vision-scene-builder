import React, { useState } from 'react';
import { useStore } from '@/stores/useStore';
import { saveProject, quickSave } from '@/services/projectSaver';
import { X, Save, Zap } from 'lucide-react';

interface SaveDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SaveDialog: React.FC<SaveDialogProps> = ({ isOpen, onClose }) => {
  const projectName = useStore((s) => s.projectName);
  const setProject = useStore((s) => s.setProject);
  const [name, setName] = useState(projectName || '');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleFullSave = async () => {
    setSaving(true);
    setProject({ name: name || 'Proyecto sin nombre' });
    await saveProject(name);
    setSaving(false);
    onClose();
  };

  const handleQuickSave = async () => {
    setSaving(true);
    await quickSave();
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Guardar Proyecto</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div>
          <label className="block text-xs text-gray-500 uppercase tracking-widest mb-2">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi proyecto..."
            className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleQuickSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-gray-300 transition-all disabled:opacity-50"
          >
            <Zap size={14} /> Rápido
          </button>
          <button
            onClick={handleFullSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            <Save size={14} /> {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
};
