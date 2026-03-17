import React, { useMemo } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import { Package } from 'lucide-react';

export const UniqueGlbsBadge: React.FC = () => {
  const objects = useStore((s) => s.objects);

  const uniqueCount = useMemo(() => {
    const urls = new Set<string>();
    objects.forEach((o) => {
      if (o.type === ObjectType.GLB && o.url) {
        urls.add(o.url);
      }
    });
    return urls.size;
  }, [objects]);

  if (uniqueCount === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
      <Package size={14} className="text-blue-400" />
      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
        GLBs únicos: {uniqueCount}
      </span>
    </div>
  );
};
