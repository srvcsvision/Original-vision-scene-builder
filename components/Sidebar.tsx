
import React from 'react';
import { SceneObject, ObjectType } from '../types';
import { MousePointer2, Type } from 'lucide-react';

interface SidebarProps {
  selectedObject: SceneObject | null;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  selectedObject, 
  updateObject,
  backgroundColor,
  setBackgroundColor
}) => {
  if (!selectedObject) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Escena Global</label>
          <div className="space-y-4 bg-gray-800/50 p-4 rounded-xl border border-gray-800">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Color de Fondo</label>
              <div className="flex gap-3 items-center">
                <input 
                  type="color" 
                  value={backgroundColor} 
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none"
                />
                <span className="text-sm font-mono">{backgroundColor.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center py-12 px-4">
          <p className="text-gray-500 text-sm italic">Selecciona un objeto para editar sus propiedades específicas.</p>
        </div>
      </div>
    );
  }

  const handleTransformChange = (axis: 'x' | 'y' | 'z', value: string, field: 'position' | 'rotation' | 'scale') => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    const newTransform = { ...selectedObject.transform };
    const idx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;
    newTransform[field][idx] = numValue;
    updateObject(selectedObject.id, { transform: newTransform });
  };

  return (
    <div className="p-6 space-y-8 pb-20">
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Detalles del Objeto</label>
        <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1 text-xs">Nombre</label>
            <input 
              type="text" 
              value={selectedObject.name} 
              onChange={(e) => updateObject(selectedObject.id, { name: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>
        </div>
      </div>

      {selectedObject.type === ObjectType.GLB && (
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Interactividad</label>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedObject.clickable || false} 
                    onChange={(e) => updateObject(selectedObject.id, { clickable: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">Activar Modal</span>
                </div>
              </label>
            </div>
          </div>

          {selectedObject.clickable && (
            <div className="space-y-4 bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <Type size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Contenido del Modal</span>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase">Título</label>
                <input 
                  type="text" 
                  value={selectedObject.modalTitle || ''} 
                  onChange={(e) => updateObject(selectedObject.id, { modalTitle: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white"
                  placeholder="Título del modal..."
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-1 uppercase">Descripción</label>
                <textarea 
                  value={selectedObject.modalDescription || ''} 
                  onChange={(e) => updateObject(selectedObject.id, { modalDescription: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white h-24 resize-none"
                  placeholder="Escribe la descripción narrativa..."
                />
              </div>
            </div>
          )}
        </div>
      )}

      <TransformControlGroup title="Posición" values={selectedObject.transform.position} onChange={(axis, val) => handleTransformChange(axis, val, 'position')} />
      <TransformControlGroup title="Rotación" values={selectedObject.transform.rotation} onChange={(axis, val) => handleTransformChange(axis, val, 'rotation')} step={0.1} />
      <TransformControlGroup title="Escala" values={selectedObject.transform.scale} onChange={(axis, val) => handleTransformChange(axis, val, 'scale')} step={0.1} />

      {selectedObject.type !== ObjectType.GLB && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Material</label>
          <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">{selectedObject.type.includes('light') ? 'Color' : 'Color Base'}</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={selectedObject.color} onChange={(e) => updateObject(selectedObject.id, { color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-none" />
                <span className="text-sm font-mono">{selectedObject.color.toUpperCase()}</span>
              </div>
            </div>
            {selectedObject.type.includes('light') ? (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Intensidad</label>
                <input type="range" min="0" max="10" step="0.1" value={selectedObject.intensity || 1} onChange={(e) => updateObject(selectedObject.id, { intensity: parseFloat(e.target.value) })} className="w-full accent-white" />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm text-gray-400 mb-1 text-xs">Rugosidad</label>
                  <input type="range" min="0" max="1" step="0.01" value={selectedObject.roughness || 0.5} onChange={(e) => updateObject(selectedObject.id, { roughness: parseFloat(e.target.value) })} className="w-full accent-white" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1 text-xs">Metálico</label>
                  <input type="range" min="0" max="1" step="0.01" value={selectedObject.metalness || 0.5} onChange={(e) => updateObject(selectedObject.id, { metalness: parseFloat(e.target.value) })} className="w-full accent-white" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface TransformGroupProps {
  title: string;
  values: [number, number, number];
  onChange: (axis: 'x' | 'y' | 'z', value: string) => void;
  step?: number;
}

const TransformControlGroup: React.FC<TransformGroupProps> = ({ title, values, onChange, step = 1 }) => (
  <div>
    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">{title}</label>
    <div className="grid grid-cols-3 gap-2">
      {(['x', 'y', 'z'] as const).map((axis, i) => (
        <div key={axis}>
          <label className="block text-[8px] text-gray-600 uppercase mb-1">{axis}</label>
          <input type="number" step={step} value={values[i]} onChange={(e) => onChange(axis, e.target.value)} className="w-full bg-gray-900 border border-gray-800 rounded-lg px-2 py-1.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-white/20 font-mono text-white" />
        </div>
      ))}
    </div>
  </div>
);
