import React, { useRef, useState, useCallback, useEffect } from 'react';
import { X, GripHorizontal } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
const MOD = isMac ? '⌘' : 'Ctrl';
const ALT = isMac ? '⌥' : 'Alt';

const SECTIONS = [
  {
    title: 'Transformar',
    shortcuts: [
      { keys: [`${MOD}+1`], desc: 'Modo Mover (posición)' },
      { keys: [`${MOD}+2`], desc: 'Modo Rotar' },
    ],
  },
  {
    title: 'Edición',
    shortcuts: [
      { keys: [`${MOD}+D`], desc: 'Duplicar selección' },
      { keys: [`${MOD}+C`], desc: 'Copiar selección' },
      { keys: [`${MOD}+V`], desc: 'Pegar' },
      { keys: ['Delete', '⌫'], desc: 'Eliminar selección' },
      { keys: [`${MOD}+Z`], desc: 'Deshacer' },
      { keys: [`${MOD}+Y`, `${MOD}+⇧+Z`], desc: 'Rehacer' },
      { keys: [`${MOD}+S`], desc: 'Guardar rápido' },
    ],
  },
  {
    title: 'Selección',
    shortcuts: [
      { keys: ['Click'], desc: 'Seleccionar objeto' },
      { keys: [`${MOD}+Click`], desc: 'Multi-selección' },
      { keys: ['⇧+Click'], desc: 'Seleccionar grupo completo' },
      { keys: ['Enter'], desc: 'Deseleccionar / Listo' },
      { keys: ['Escape'], desc: 'Cerrar modal / Deseleccionar' },
    ],
  },
  {
    title: 'Agregar Objetos',
    shortcuts: [
      { keys: ['⇧+B'], desc: 'Cubo (Box)' },
      { keys: ['⇧+S'], desc: 'Esfera (Sphere)' },
      { keys: ['⇧+K'], desc: 'Cámara' },
    ],
  },
  {
    title: 'Agregar Luces',
    shortcuts: [
      { keys: ['⇧+1'], desc: 'Point Light' },
      { keys: ['⇧+2'], desc: 'Spot Light' },
      { keys: ['⇧+3'], desc: 'Directional Light' },
      { keys: ['⇧+4'], desc: 'Ambient Light' },
    ],
  },
  {
    title: 'Posicionar Luces',
    shortcuts: [
      { keys: [`${ALT}+Click`], desc: 'Mover luz al punto' },
      { keys: [`${ALT}+F+Click`], desc: 'Apuntar luz a objeto' },
    ],
  },
  {
    title: 'Vista / Paneles',
    shortcuts: [
      { keys: ['G'], desc: 'Mostrar/ocultar Grid' },
      { keys: ['P'], desc: 'Toggle propiedades' },
      { keys: ['L'], desc: 'Toggle sidebar izq.' },
      { keys: ['H'], desc: 'Ocultar/mostrar objeto' },
      { keys: ['F'], desc: 'Pantalla completa' },
      { keys: [`${MOD}+E`], desc: 'Modo Edición / Recorrido' },
    ],
  },
  {
    title: 'Cámara',
    shortcuts: [
      { keys: ['Arrastrar izq.'], desc: 'Rotar cámara' },
      { keys: ['Scroll'], desc: 'Zoom' },
      { keys: ['Arrastrar der.'], desc: 'Pan (desplazar)' },
    ],
  },
] as const;

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -1, y: -1 });
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    if (pos.x === -1 && panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setPos({
        x: Math.round((window.innerWidth - rect.width) / 2),
        y: Math.round(window.innerHeight * 0.1),
      });
    }
  }, [pos.x]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
    };
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setPos({
      x: Math.max(0, Math.min(window.innerWidth - 300, dragState.current.origX + dx)),
      y: Math.max(0, Math.min(window.innerHeight - 100, dragState.current.origY + dy)),
    });
  }, []);

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        left: pos.x === -1 ? '50%' : pos.x,
        top: pos.y === -1 ? '10%' : pos.y,
        transform: pos.x === -1 ? 'translateX(-50%)' : undefined,
        zIndex: 9999,
      }}
      className="w-[300px] bg-black/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden select-none"
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2">
          <GripHorizontal size={14} className="text-gray-600" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Atajos Rápidos</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X size={14} className="text-gray-500" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-3 space-y-2.5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="text-[9px] font-bold text-emerald-400/70 uppercase tracking-widest mb-1 px-1">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.shortcuts.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-[11px] text-gray-400">{s.desc}</span>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    {s.keys.map((k, j) => (
                      <React.Fragment key={j}>
                        {j > 0 && <span className="text-[9px] text-gray-600">/</span>}
                        <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-300 leading-none">
                          {k}
                        </kbd>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-2 border-t border-white/5">
        <p className="text-[9px] text-gray-600 text-center">Arrastra la barra para mover</p>
      </div>
    </div>
  );
};
