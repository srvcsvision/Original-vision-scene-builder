import React from 'react';
import { SceneObject, ObjectType } from '@/types';
import { Trash2, Eye, EyeOff, Lock, Unlock, Box, Circle, Sun, Layers, FileBox } from 'lucide-react';

interface SceneHierarchyItemProps {
  obj: SceneObject;
  isSelected: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
}

const getIcon = (type: ObjectType) => {
  if (type.includes('light')) return <Sun size={12} className="text-amber-400" />;
  if (type === ObjectType.GLB) return <FileBox size={12} className="text-blue-400" />;
  if (type === ObjectType.PLANE) return <Layers size={12} className="text-emerald-400" />;
  if (type === ObjectType.SPHERE) return <Circle size={12} className="text-purple-400" />;
  return <Box size={12} className="text-gray-400" />;
};

export const SceneHierarchyItem: React.FC<SceneHierarchyItemProps> = React.memo(
  ({ obj, isSelected, onSelect, onDelete, onToggleVisibility, onToggleLock }) => {
    const isLockedWall = obj.locked && obj.type === ObjectType.PLANE && obj.name.startsWith('Pared');
    return (
    <div
      onClick={(e) => { if (!isLockedWall) onSelect(obj.id, e.metaKey || e.ctrlKey); }}
      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 group ${
        isLockedWall
          ? 'cursor-default opacity-60'
          : isSelected ? 'bg-white text-black cursor-pointer' : 'hover:bg-white/5 text-gray-400 cursor-pointer'
      }`}
    >
      {getIcon(obj.type)}
      <span className="truncate flex-1">{obj.name}</span>

      <div className="flex items-center gap-1">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(obj.id); }}
          className={`p-0.5 rounded transition-opacity ${
            !obj.visible
              ? 'text-red-400 hover:text-red-300'
              : 'opacity-0 group-hover:opacity-100 ' + (isSelected ? 'text-black/40 hover:text-black' : 'text-gray-600 hover:text-white')
          }`}
        >
          {obj.visible ? <Eye size={10} /> : <EyeOff size={10} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLock(obj.id); }}
          className={`p-0.5 rounded transition-opacity ${
            obj.locked
              ? 'text-amber-400 hover:text-amber-300'
              : 'opacity-0 group-hover:opacity-100 ' + (isSelected ? 'text-black/40 hover:text-black' : 'text-gray-600 hover:text-white')
          }`}
        >
          {obj.locked ? <Lock size={10} /> : <Unlock size={10} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(obj.id); }}
          className={`p-0.5 rounded transition-opacity opacity-0 group-hover:opacity-100 ${isSelected ? 'text-black/40 hover:text-black' : 'text-gray-600 hover:text-white'}`}
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
    );
  }
);

SceneHierarchyItem.displayName = 'SceneHierarchyItem';
