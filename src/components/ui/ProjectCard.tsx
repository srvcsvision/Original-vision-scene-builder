import React, { useState, useRef, useEffect } from 'react';
import { Folder, Pencil, Check, X } from 'lucide-react';
import type { ProjectMeta } from '@/types';

interface ProjectCardProps {
  project: ProjectMeta;
  onClick: (id: string) => void;
  onRename?: (id: string, newName: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project, onClick, onRename }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) inputRef.current?.focus();
  }, [isEditing]);

  const dateStr = (() => {
    if (!project.updatedAt) return '';
    const now = Date.now();
    const diff = now - project.updatedAt;
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Ahora';
    if (mins < 60) return `Hace ${mins} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days < 7) return `Hace ${days}d`;

    return new Date(project.updatedAt).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  })();

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(project.name || '');
    setIsEditing(true);
  };

  const handleConfirm = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const trimmed = editName.trim();
    if (trimmed && trimmed !== project.name && onRename) {
      onRename(project.id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditName(project.name || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm(e);
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(project.name || '');
    }
  };

  return (
    <div
      onClick={() => !isEditing && onClick(project.id)}
      className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all group cursor-pointer"
    >
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
        <Folder size={20} className="text-gray-400 group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1 text-left min-w-0">
        {isEditing ? (
          <form onSubmit={handleConfirm} className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="Nombre del proyecto..."
            />
            <button
              type="submit"
              onClick={handleConfirm}
              className="p-1.5 hover:bg-emerald-500/20 rounded-lg text-emerald-400 transition-colors"
            >
              <Check size={14} />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors"
            >
              <X size={14} />
            </button>
          </form>
        ) : (
          <p className="text-sm font-medium text-white truncate">
            {project.name || 'Proyecto sin nombre'}
          </p>
        )}
      </div>
      {!isEditing && (
        <>
          {onRename && (
            <button
              onClick={handleStartEdit}
              className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all"
              title="Renombrar"
            >
              <Pencil size={14} />
            </button>
          )}
          {dateStr && (
            <span className="text-[11px] text-gray-600 font-mono shrink-0">{dateStr}</span>
          )}
        </>
      )}
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';
