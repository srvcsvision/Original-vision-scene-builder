
import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import { SceneView } from './components/SceneView';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { SceneObject, ObjectType, SceneConfig } from './types';
import { Canvas, useLoader, useFrame } from '@react-three/fiber';
import { Environment, Center, ContactShadows } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Play, 
  EyeOff, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Pen,
  Camera,
  Film,
  Music,
  Download,
  Maximize2,
  MessageCircle,
  User,
  Send,
  MoreHorizontal,
  Maximize
} from 'lucide-react';

// Componente para el reproductor de video con contenido expandido
const VideoOverlay: React.FC<{ url: string; onClose: () => void; title?: string; description?: string }> = ({ url, onClose, title, description }) => {
  const dummyComments = [
    { id: 1, user: "Elena R.", initial: "ER", color: "bg-blue-500", text: "¡Increíble la fluidez de las transiciones! Me encanta cómo se siente el espacio.", time: "Hace 2 min" },
    { id: 2, user: "Marcos T.", initial: "MT", color: "bg-purple-500", text: "La iluminación en el modo nocturno es simplemente espectacular. Buen trabajo.", time: "Hace 15 min" },
    { id: 3, user: "Sara Visuals", initial: "SV", color: "bg-emerald-500", text: "¿Es posible exportar los metadatos de los comentarios también?", time: "Hace 1 hora" },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-[#050505] overflow-y-auto animate-in fade-in duration-500 custom-scrollbar">
      {/* Botón de cierre pegajoso */}
      <div className="sticky top-0 z-[210] flex justify-end p-4 sm:p-6 pointer-events-none">
        <button 
          onClick={onClose}
          className="pointer-events-auto p-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full text-white transition-all hover:rotate-90 border border-white/10 shadow-2xl"
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 pb-24 -mt-16 sm:-mt-20">
        {/* Video Player Section */}
        <div className="relative w-full aspect-video bg-black rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-[0_0_100px_-20px_rgba(255,255,255,0.05)] border border-white/10 mb-12">
          <video 
            src={url} 
            className="w-full h-full object-cover"
            controls
            autoPlay
            playsInline
          >
            Tu navegador no soporta la reproducción de este video.
          </video>
        </div>

        {/* Info Section */}
        <div className="space-y-6 mb-16 px-2">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {title || "Narrativa Inmersiva: El Futuro del Diseño"}
            </h1>
            <p className="text-lg sm:text-xl text-gray-400 font-medium max-w-3xl leading-relaxed">
              {description || "Explora cómo la interactividad y el renderizado en tiempo real transforman la percepción del espacio en entornos digitales controlados."}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-10 h-10 rounded-full border-2 border-[#050505] bg-gray-800 flex items-center justify-center text-xs font-bold`}>
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-500 font-medium">+1,240 personas viendo ahora</span>
          </div>
        </div>

        <div className="h-px bg-white/5 w-full mb-16" />

        {/* Comments Section */}
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
              <MessageCircle className="text-emerald-500" /> Comentarios
            </h3>
            <button className="text-gray-500 hover:text-white transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* New Comment Input */}
          <div className="bg-white/5 border border-white/10 p-4 sm:p-6 rounded-[2rem] flex items-center gap-4 group focus-within:border-emerald-500/50 transition-all shadow-xl">
            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-extrabold text-black shrink-0">
              YO
            </div>
            <input 
              type="text"
              placeholder="Escribe tu opinión sobre esta escena..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-gray-600 font-medium"
            />
            <button className="p-3 bg-white text-black rounded-full hover:scale-110 transition-transform active:scale-95 shadow-lg">
              <Send size={18} />
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-8">
            {dummyComments.map((comment) => (
              <div key={comment.id} className="flex gap-4 sm:gap-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className={`w-12 h-12 rounded-full ${comment.color} flex items-center justify-center font-bold text-black text-sm shrink-0 shadow-lg`}>
                  {comment.initial}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white text-base">{comment.user}</span>
                    <span className="text-xs text-gray-600 font-medium">{comment.time}</span>
                  </div>
                  <p className="text-gray-400 leading-relaxed font-normal">
                    {comment.text}
                  </p>
                  <div className="flex items-center gap-4 pt-2">
                    <button className="text-xs font-bold text-gray-600 hover:text-emerald-500 transition-colors uppercase tracking-widest">Responder</button>
                    <button className="text-xs font-bold text-gray-600 hover:text-white transition-colors uppercase tracking-widest">Me gusta</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Mini componente para el preview 3D en el modal
const ModalObjectPreview: React.FC<{ url: string }> = ({ url }) => {
  const gltf = useLoader(GLTFLoader, url);
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
        <primitive object={gltf.scene.clone()} scale={1.5} />
      </Center>
    </group>
  );
};

const App: React.FC = () => {
  const [objects, setObjects] = useState<SceneObject[]>([]);
  const [past, setPast] = useState<SceneObject[][]>([]);
  const [future, setFuture] = useState<SceneObject[][]>([]);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#0a0a0c');
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [isNavMode, setIsNavMode] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [activeWallIndex, setActiveWallIndex] = useState(0);
  const [fov, setFov] = useState(60);
  
  const [activeModalObject, setActiveModalObject] = useState<SceneObject | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isPropsOpen, setIsPropsOpen] = useState(window.innerWidth > 1280);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  
  const glbInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const saveState = useCallback(() => {
    setPast(prev => [...prev, JSON.parse(JSON.stringify(objects))]);
    setFuture([]);
  }, [objects]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    setFuture(prev => [JSON.parse(JSON.stringify(objects)), ...prev]);
    setObjects(previous);
    setPast(newPast);
    setSelectedId(null);
  }, [past, objects]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    setPast(prev => [...prev, JSON.parse(JSON.stringify(objects))]);
    setObjects(next);
    setFuture(newFuture);
    setSelectedId(null);
  }, [future, objects]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo(); else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const addObject = (type: ObjectType, url?: string, fileName?: string, customProps?: Partial<SceneObject>) => {
    saveState();
    const id = crypto.randomUUID();
    const newObject: SceneObject = {
      id,
      name: fileName || `${type.replace('_', ' ')} ${objects.length + 1}`,
      type,
      transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      color: type.includes('light') ? '#ffffff' : '#3b82f6',
      intensity: type.includes('light') ? 1 : undefined,
      visible: true,
      roughness: 0.5,
      metalness: 0.1,
      url,
      modalTitle: 'Storytelling Visual',
      modalDescription: 'Este objeto representa un punto de inflexión en la narrativa visual del espacio.',
      clickable: type === ObjectType.GLB,
      ...customProps
    };
    setObjects(prev => [...prev, newObject]);
    if (!customProps?.name?.includes('Pared')) setSelectedId(id);
    return id;
  };

  const handleGlbImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) {
      e.target.value = '';
      return;
    }
    saveState();
    const groupId = files.length > 1 ? crypto.randomUUID() : undefined;
    const newObjects: SceneObject[] = files.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      type: ObjectType.GLB,
      transform: {
        position: [0, 0, 0],
        rotation: [0, 0, 0] as [number, number, number],
        scale: [1, 1, 1] as [number, number, number]
      },
      color: '#3b82f6',
      visible: true,
      roughness: 0.5,
      metalness: 0.1,
      url: URL.createObjectURL(file),
      groupId,
      modalTitle: 'Storytelling Visual',
      modalDescription: 'Este objeto representa un punto de inflexión en la narrativa visual del espacio.',
      clickable: true
    }));
    setObjects(prev => [...prev, ...newObjects]);
    setSelectedId(newObjects[0].id);
    e.target.value = '';
  };

  const createRoom = () => {
    saveState();
    const wallColors = ['#1e1e26', '#252530', '#1e1e26', '#252530'];
    const wallNames = ['Pared Frontal', 'Pared Derecha', 'Pared Trasera', 'Pared Izquierda'];
    const floor: SceneObject = {
      id: crypto.randomUUID(),
      name: 'Suelo',
      type: ObjectType.PLANE,
      transform: { position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], scale: [1, 1, 1] },
      color: '#111115', visible: true, roughness: 0.5, metalness: 0.1
    };
    const walls = wallNames.map((name, i) => {
      const angle = (i * Math.PI) / 2;
      return {
        id: crypto.randomUUID(),
        name,
        type: ObjectType.PLANE,
        color: wallColors[i],
        transform: {
          position: [Math.sin(angle) * 5, 5, -Math.cos(angle) * 5] as [number, number, number],
          rotation: [0, -angle, 0] as [number, number, number],
          scale: [1, 1, 1] as [number, number, number]
        },
        visible: true, roughness: 0.5, metalness: 0.1
      };
    });
    const light: SceneObject = {
      id: crypto.randomUUID(),
      name: 'Luz Ambiente',
      type: ObjectType.POINT_LIGHT,
      transform: { position: [0, 7, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
      color: '#ffffff', intensity: 1.5, visible: true
    };
    setObjects([floor, ...walls, light]);
    setIsNavMode(false); // Mantener en modo edición por defecto
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const updateObject = (id: string, updates: Partial<SceneObject>, skipHistory = false) => {
    if (!skipHistory) saveState();
    setObjects(prev => prev.map(obj => obj.id === id ? { ...obj, ...updates } : obj));
  };

  const deleteObject = (id: string) => {
    saveState();
    setObjects(prev => prev.filter(o => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const togglePreview = () => {
    const newState = !isPreview;
    setIsPreview(newState);
    if (!newState) {
      setIsNavMode(true);
      setSelectedId(null);
      setIsSidebarOpen(false);
      setActiveModalObject(null);
      setShowVideo(false);
    } else {
      setIsSidebarOpen(window.innerWidth > 1024);
    }
  };

  const handleCloseModal = () => {
    setActiveModalObject(null);
    setSelectedId(null);
  };

  const handleStartVideo = () => {
    setShowVideo(true);
  };

  const toggleFov = () => {
    setFov(prev => {
      if (prev === 60) return 40;
      if (prev === 40) return 90;
      return 60;
    });
  };

  // Cálculos para la píldora responsiva
  const itemWidth = isMobile ? 64 : 110;
  const navGap = 8;
  const pillPosition = navGap + activeWallIndex * (itemWidth + navGap);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0a0c] text-gray-100 font-sans relative">
      
      {/* Reproductor de Video Overlay */}
      {showVideo && (
        <VideoOverlay 
          url="https://stream.mux.com/S01IUmUA6AvPwm00CI01Y9mywobYVqSrJTOZfZIaSEB6Gw.m3u8" 
          onClose={() => setShowVideo(false)}
          title={activeModalObject?.modalTitle}
          description={activeModalObject?.modalDescription}
        />
      )}

      {/* Sidebar Izquierda */}
      {!isPreview && (
        <>
          <div className={`fixed lg:relative z-40 h-full bg-black/80 lg:bg-black/40 backdrop-blur-xl border-r border-white/5 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full lg:w-0'}`}>
            <div className="w-64 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="font-bold text-lg tracking-tight text-white">Vision Studio</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button onClick={createRoom} className="w-full mb-4 flex items-center justify-center gap-2 py-2 bg-white hover:bg-gray-200 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-white/5 text-black"><Plus size={14} /> Crear Habitación</button>
                <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Escena</h2>
                {objects.map(obj => (
                  <button key={obj.id} onClick={() => { setSelectedId(obj.id); if (window.innerWidth < 1024) setIsSidebarOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between group ${selectedId === obj.id ? 'bg-white text-black' : 'hover:bg-white/5 text-gray-400'}`}>
                    <span className="truncate">{obj.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteObject(obj.id); }} className={`opacity-0 group-hover:opacity-100 ${selectedId === obj.id ? 'text-black/50 hover:text-black' : 'text-gray-500 hover:text-white'}`}><Trash2 size={12} /></button>
                  </button>
                ))}
              </div>
              <div className="p-4 border-t border-white/5 space-y-2">
                <button onClick={togglePreview} className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all"><Play size={14} /> Lanzar App</button>
              </div>
            </div>
          </div>
          {!isSidebarOpen && (
            <button onClick={() => setIsSidebarOpen(true)} className="fixed left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform"><ChevronRight size={20} /></button>
          )}
        </>
      )}

      {/* Modal Storytelling */}
      {isPreview && activeModalObject && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-500">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-[#3d1e12] to-[#2a150d] rounded-[30px] sm:rounded-[40px] shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up border border-white/10">
            <button onClick={handleCloseModal} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/50 hover:text-white transition-all z-20"><X size={isMobile ? 18 : 20} /></button>
            
            <div className="p-6 sm:p-8 pt-6 text-center space-y-4">
              <div className="w-full h-32 sm:h-48 -mt-4 relative pointer-events-none">
                <Canvas shadows camera={{ position: [0, 0, 5], fov: 35 }}>
                  <Suspense fallback={null}>
                    <Environment preset="night" />
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    {activeModalObject.url && <ModalObjectPreview url={activeModalObject.url} />}
                    <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={10} blur={2} far={4.5} />
                  </Suspense>
                </Canvas>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight px-4 drop-shadow-xl tracking-tight">
                {activeModalObject.modalTitle}
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
                  <p className="font-medium">{activeModalObject.modalDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Central */}
      <div className="flex-1 relative flex flex-col bg-[#050505]">
        {!isPreview && (
          <Toolbar 
            addObject={addObject} showGrid={showGrid} setShowGrid={setShowGrid} 
            onImportGlb={() => glbInputRef.current?.click()}
            transformMode={transformMode} setTransformMode={setTransformMode}
            isNavMode={isNavMode} setIsNavMode={setIsNavMode}
            undo={undo} redo={redo} canUndo={past.length > 0} canRedo={future.length > 0}
            fov={fov}
            toggleFov={toggleFov}
          />
        )}
        
        {isPreview && (
          <>
            <div className="absolute top-4 left-4 z-50 flex items-center gap-2 pointer-events-none">
              <button 
                onClick={togglePreview} 
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-all pointer-events-auto shadow-2xl"
              >
                <EyeOff size={14} /> Salir
              </button>
              
              <button 
                onClick={toggleFov} 
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-black/40 hover:bg-black/60 backdrop-blur-xl border border-white/10 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-all pointer-events-auto shadow-2xl"
              >
                <Maximize size={14} /> {fov}° Vision
              </button>
            </div>

            <div className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 bg-[#f5f2eb] p-2 rounded-full flex items-center gap-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] z-50 animate-in fade-in slide-in-from-bottom-10 duration-1000 max-w-[95vw]">
              <div 
                className="absolute top-2 bottom-2 bg-white rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-0" 
                style={{ 
                  width: `${itemWidth}px`, 
                  left: `${pillPosition}px` 
                }} 
              />
              {[
                { id: 0, icon: <Pen size={isMobile ? 20 : 28} /> }, 
                { id: 1, icon: <Camera size={isMobile ? 20 : 28} /> }, 
                { id: 2, icon: <Film size={isMobile ? 20 : 28} /> }, 
                { id: 3, icon: <Music size={isMobile ? 20 : 28} /> }
              ].map((tab) => (
                <button 
                  key={tab.id} 
                  onClick={() => setActiveWallIndex(tab.id)} 
                  className={`rounded-full transition-colors duration-500 relative flex items-center justify-center h-[48px] sm:h-[64px] transition-all`}
                  style={{ width: `${itemWidth}px` }}
                >
                  <span className={`relative z-10 transition-transform duration-300 transform active:scale-90 ${activeWallIndex === tab.id ? 'text-[#4a3728]' : 'text-[#9b8d7e] hover:text-[#4a3728]'}`}>
                    {tab.icon}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        <div className="flex-1">
          <SceneView 
            objects={objects} selectedId={selectedId} setSelectedId={setSelectedId}
            showGrid={!isPreview && showGrid} backgroundColor={backgroundColor}
            transformMode={transformMode} setTransformMode={setTransformMode}
            isNavMode={isPreview || isNavMode} activeWallIndex={activeWallIndex} setActiveWallIndex={setActiveWallIndex}
            onUpdateTransform={(id, pos, rot, sca) => { saveState(); updateObject(id, { transform: { position: pos, rotation: rot, scale: sca } }, true); }}
            onObjectClick={(obj) => { 
              if (isPreview) {
                setSelectedId(obj.id);
                setTimeout(() => setActiveModalObject(obj), 400);
              }
            }}
            fov={fov}
          />
        </div>
      </div>

      {/* Sidebar Derecha - Oculta en modo Preview */}
      {!isPreview && (
        <>
          <div className={`fixed right-0 lg:relative z-40 h-full bg-black/80 lg:bg-black/40 backdrop-blur-xl border-l border-white/5 transition-all duration-300 ease-in-out ${isPropsOpen ? 'w-80 translate-x-0' : 'w-0 translate-x-full lg:w-0 overflow-hidden'}`}>
            <div className="w-80 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2"><Settings className="w-5 h-5 text-gray-500" /><h2 className="font-semibold text-sm">Propiedades</h2></div>
                <button onClick={() => setIsPropsOpen(false)} className="p-1 hover:bg-white/10 rounded"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <Sidebar selectedObject={objects.find(o => o.id === selectedId) || null} updateObject={(id, upd) => updateObject(id, upd, false)} backgroundColor={backgroundColor} setBackgroundColor={setBackgroundColor} />
              </div>
            </div>
          </div>
          {!isPropsOpen && selectedId && (
            <button onClick={() => setIsPropsOpen(true)} className="fixed right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-white text-black rounded-full shadow-xl hover:scale-110 transition-transform"><ChevronLeft size={20} /></button>
          )}
        </>
      )}

      <input type="file" ref={glbInputRef} onChange={handleGlbImport} className="hidden" accept=".glb,.gltf" multiple />
    </div>
  );
};

export default App;
