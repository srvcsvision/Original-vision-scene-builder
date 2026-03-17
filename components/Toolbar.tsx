
import React from 'react';
import { ObjectType } from '../types';
import { 
  Square, 
  Circle, 
  Grid, 
  PackagePlus,
  Move,
  RotateCcw,
  Compass,
  Edit3,
  Undo2,
  Redo2,
  Maximize
} from 'lucide-react';

interface ToolbarProps {
  addObject: (type: ObjectType) => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  onImportGlb: () => void;
  transformMode: 'translate' | 'rotate' | 'scale';
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  isNavMode: boolean;
  setIsNavMode: (val: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  fov: number;
  toggleFov: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ 
  addObject, 
  showGrid, 
  setShowGrid, 
  onImportGlb,
  transformMode,
  setTransformMode,
  isNavMode,
  setIsNavMode,
  undo,
  redo,
  canUndo,
  canRedo,
  fov,
  toggleFov
}) => {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/40 backdrop-blur-2xl border border-white/5 p-1 rounded-xl sm:rounded-2xl shadow-2xl z-20 max-w-[95vw] overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1 px-1">
        {/* Modos Principales */}
        <ToolbarButton 
          onClick={() => setIsNavMode(false)} 
          icon={<Edit3 size={16} className="sm:w-[18px]" />} 
          tooltip="Edición" 
          active={!isNavMode}
        />
        <ToolbarButton 
          onClick={() => setIsNavMode(true)} 
          icon={<Compass size={16} className="sm:w-[18px]" />} 
          tooltip="Recorrido" 
          active={isNavMode}
        />
        
        <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />

        {/* Undo/Redo */}
        {!isNavMode && (
          <>
            <ToolbarButton 
              onClick={undo} 
              icon={<Undo2 size={16} className="sm:w-[18px]" />} 
              tooltip="Deshacer (Ctrl+Z)" 
              disabled={!canUndo}
            />
            <ToolbarButton 
              onClick={redo} 
              icon={<Redo2 size={16} className="sm:w-[18px]" />} 
              tooltip="Rehacer (Ctrl+Y)" 
              disabled={!canRedo}
            />
            <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />
          </>
        )}

        {!isNavMode ? (
          <>
            <ToolbarButton 
              onClick={() => addObject(ObjectType.BOX)} 
              icon={<Square size={16} className="sm:w-[18px]" />} 
              tooltip="Cubo" 
            />
            <ToolbarButton 
              onClick={() => addObject(ObjectType.SPHERE)} 
              icon={<Circle size={16} className="sm:w-[18px]" />} 
              tooltip="Esfera" 
            />
            <ToolbarButton 
              onClick={onImportGlb} 
              icon={<PackagePlus size={16} className="sm:w-[18px]" />} 
              tooltip="GLB" 
            />
            
            <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5 hidden sm:block" />
            
            <ToolbarButton 
              onClick={() => setTransformMode('translate')} 
              icon={<Move size={16} className="sm:w-[18px]" />} 
              tooltip="Mover" 
              active={transformMode === 'translate'}
            />
            <ToolbarButton 
              onClick={() => setTransformMode('rotate')} 
              icon={<RotateCcw size={16} className="sm:w-[18px]" />} 
              tooltip="Rotar" 
              active={transformMode === 'rotate'}
            />

            <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />
            
            <ToolbarButton 
              onClick={() => setShowGrid(!showGrid)} 
              icon={<Grid size={16} className={`sm:w-[18px] ${showGrid ? 'text-white' : 'text-gray-500'}`} />} 
              tooltip="Grid" 
            />
          </>
        ) : (
          <div className="flex items-center gap-2 pr-1">
            <div className="px-3 py-1 text-[8px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center whitespace-nowrap">
              Viendo Escena
            </div>
            <div className="w-px h-5 bg-white/10" />
            <ToolbarButton 
              onClick={toggleFov} 
              icon={<Maximize size={16} className="sm:w-[18px] text-emerald-400" />} 
              tooltip={`FOV: ${fov}°`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const ToolbarButton: React.FC<{ 
  onClick: () => void; 
  icon: React.ReactNode; 
  tooltip: string;
  active?: boolean;
  disabled?: boolean;
}> = ({ onClick, icon, tooltip, active, disabled }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl transition-all group relative border shrink-0 ${
      disabled ? 'opacity-20 cursor-not-allowed grayscale' : ''
    } ${
      active 
      ? 'bg-white text-black border-white shadow-lg shadow-white/5' 
      : 'hover:bg-white/5 text-gray-400 hover:text-white border-transparent'
    }`}
  >
    {icon}
    {!disabled && (
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none shadow-2xl z-50 hidden sm:block">
        {tooltip}
      </div>
    )}
  </button>
);
