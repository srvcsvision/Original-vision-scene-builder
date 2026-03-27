import React from 'react';
import { useStore } from '@/stores/useStore';
import { X, MessageCircle, MoreHorizontal, Send } from 'lucide-react';

export const VideoOverlay: React.FC = () => {
  const showVideo = useStore((s) => s.showVideo);
  const setShowVideo = useStore((s) => s.setShowVideo);
  const activeModalObjectId = useStore((s) => s.activeModalObjectId);
  const objects = useStore((s) => s.objects);

  if (!showVideo) return null;

  const obj = objects.find((o) => o.id === activeModalObjectId);
  const videoUrl = obj?.videoUrl || '';
  const title = obj?.modalTitle || obj?.title || 'Sin título';
  const description = obj?.modalDescription || obj?.description || '';

  if (!videoUrl) {
    return (
      <div
        className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) setShowVideo(false); }}
      >
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 text-center space-y-4 shadow-2xl max-w-sm">
          <p className="text-gray-400 text-sm">No hay video asociado a este objeto.</p>
          <button onClick={() => setShowVideo(false)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-xs font-bold transition-all">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) setShowVideo(false); }}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_0_80px_-15px_rgba(255,255,255,0.06)] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/5 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-white truncate pr-4">{title}</h2>
          <button
            onClick={() => setShowVideo(false)}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar">
          <div className="p-5 sm:p-6 space-y-6">
            <div className="relative w-full aspect-video bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-white/5">
              <video src={videoUrl} className="w-full h-full object-cover" controls autoPlay playsInline>
                Tu navegador no soporta la reproducción de este video.
              </video>
            </div>

            {description && (
              <div className="space-y-3 px-1">
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
