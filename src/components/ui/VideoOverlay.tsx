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
      <div className="fixed inset-0 z-[200] bg-[#050505] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-gray-400 text-lg">No hay video asociado a este objeto.</p>
          <button onClick={() => setShowVideo(false)} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white text-sm transition-all">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] overflow-y-auto animate-in fade-in duration-500 custom-scrollbar">
      <div className="sticky top-0 z-[210] flex justify-end p-4 sm:p-6 pointer-events-none">
        <button
          onClick={() => setShowVideo(false)}
          className="pointer-events-auto p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white transition-all hover:rotate-90 border border-white/10 shadow-2xl"
        >
          <X size={24} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-24 -mt-16 sm:-mt-20">
        <div className="relative w-full aspect-video bg-black rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(255,255,255,0.05)] border border-white/10 mb-12">
          <video src={videoUrl} className="w-full h-full object-cover" controls autoPlay playsInline>
            Tu navegador no soporta la reproducción de este video.
          </video>
        </div>

        <div className="space-y-6 mb-16 px-2">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">{title}</h1>
            <p className="text-lg sm:text-xl text-gray-400 font-medium max-w-3xl leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
