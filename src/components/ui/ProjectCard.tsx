import React from 'react';
import { Folder } from 'lucide-react';
import type { ProjectMeta } from '@/types';

interface ProjectCardProps {
  project: ProjectMeta;
  onClick: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = React.memo(({ project, onClick }) => {
  const dateStr = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  return (
    <button
      onClick={() => onClick(project.id)}
      className="w-full flex items-center gap-4 px-5 py-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-2xl transition-all group"
    >
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
        <Folder size={20} className="text-gray-400 group-hover:text-white transition-colors" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {project.name || 'Proyecto sin nombre'}
        </p>
      </div>
      {dateStr && (
        <span className="text-[11px] text-gray-600 font-mono shrink-0">{dateStr}</span>
      )}
    </button>
  );
});

ProjectCard.displayName = 'ProjectCard';
