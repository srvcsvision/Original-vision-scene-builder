import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Center, ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/stores/useStore';
import { X, Download } from 'lucide-react';

const ModalObjectPreview: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={meshRef}>
      <Center>
        <primitive object={scene.clone()} scale={1.5} />
      </Center>
    </group>
  );
};

export const ModalStoryTelling: React.FC = () => {
  const activeModalObjectId = useStore((s) => s.activeModalObjectId);
  const setActiveModalObjectId = useStore((s) => s.setActiveModalObjectId);
  const setShowVideo = useStore((s) => s.setShowVideo);
  const setSelectedId = useStore((s) => s.setSelectedId);
  const objects = useStore((s) => s.objects);
  const isMobile = useStore((s) => s.isMobile);
  const isPreview = useStore((s) => s.isPreview);

  if (!isPreview || !activeModalObjectId) return null;

  const obj = objects.find((o) => o.id === activeModalObjectId);
  if (!obj) return null;

  const handleClose = () => {
    setActiveModalObjectId(null);
    setSelectedId(null);
  };

  const handleStartVideo = () => {
    setShowVideo(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-500">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#3d1e12] to-[#2a150d] rounded-[30px] sm:rounded-[40px] shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up border border-white/10">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-all z-20"
        >
          <X size={isMobile ? 18 : 20} />
        </button>

        <div className="p-6 sm:p-8 pt-6 text-center space-y-4">
          {obj.url && (
            <div className="w-full h-32 sm:h-48 -mt-4 relative pointer-events-none">
              <Canvas shadows camera={{ position: [0, 0, 5], fov: 35 }}>
                <Suspense fallback={null}>
                  <Environment preset="night" />
                  <ambientLight intensity={0.5} />
                  <pointLight position={[10, 10, 10]} intensity={1} />
                  <ModalObjectPreview url={obj.url} />
                  <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
                </Suspense>
              </Canvas>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight px-4 drop-shadow-xl tracking-tight">
            {obj.modalTitle || obj.title || obj.name}
          </h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-black/30 p-2 rounded-[24px] sm:rounded-[28px] border border-white/5">
            <button className="flex-1 py-3 sm:py-4 px-6 bg-[#5c2d1c] hover:bg-[#6e3723] rounded-[18px] sm:rounded-[22px] text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95">
              <Download size={16} /> Descargar
            </button>
            <button
              onClick={handleStartVideo}
              className="flex-1 py-3 sm:py-4 px-6 bg-white hover:bg-gray-100 rounded-[18px] sm:rounded-[22px] text-[#2a150d] font-bold text-sm transition-all shadow-xl active:scale-95"
            >
              Comenzar
            </button>
          </div>

          <div className="bg-[#5c2d1c]/80 p-5 sm:p-6 rounded-[24px] sm:rounded-[36px] text-left border border-white/10 shadow-inner backdrop-blur-sm">
            <div className="space-y-2 sm:space-y-3 text-[#f0e6dd] leading-relaxed text-[13px] sm:text-sm">
              <p className="font-medium">{obj.modalDescription || obj.description || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
