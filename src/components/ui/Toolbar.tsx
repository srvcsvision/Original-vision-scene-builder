import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import type { SceneConfig } from '@/types';
import { normalizeLoadedSceneObjects, sanitizeGlbForPersistence } from '@/utils/scenePersistence';
import { ToolbarButton } from './ToolbarButton';
import { saveProject, quickSave } from '@/services/projectSaver';
import type { SaveProgress } from '@/services/projectSaver';
import {
  DEFAULT_OBJECT_COLOR,
  DEFAULT_LIGHT_COLOR,
  DEFAULT_ROUGHNESS,
  DEFAULT_METALNESS,
} from '@/constants/defaults';
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
  Maximize,
  Save,
  Loader2,
  Check,
  AlertCircle,
  HardDrive,
  FileJson,
  CheckCircle,
  Settings,
  Fullscreen,
  FolderOpen,
  Download,
  Upload,
  Camera,
  Keyboard,
  X,
} from 'lucide-react';
import { ShortcutsModal } from './ShortcutsModal';

const SaveProgressOverlay: React.FC<{
  progress: SaveProgress;
  mode: 'full' | 'json';
  onDismiss: () => void;
}> = ({ progress, mode, onDismiss }) => {
  const isDone = progress.percent === 100;
  const isError = progress.percent === -1;
  const canDismiss = isDone || isError;

  useEffect(() => {
    if (isDone) {
      const t = setTimeout(onDismiss, 2500);
      return () => clearTimeout(t);
    }
  }, [isDone, onDismiss]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
      <div className="min-w-[280px] max-w-[340px] bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3 pb-1">
          <div className="flex items-center gap-2">
            {isError ? (
              <AlertCircle size={16} className="text-red-400" />
            ) : isDone ? (
              <Check size={16} className="text-emerald-400" />
            ) : (
              <Loader2 size={16} className="text-blue-400 animate-spin" />
            )}
            <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
              {mode === 'full' ? 'Proyecto Completo' : 'Solo JSON'}
            </span>
          </div>
          {canDismiss && (
            <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
              <X size={12} className="text-gray-500" />
            </button>
          )}
        </div>

        <div className="px-4 pb-1.5">
          <p className="text-[11px] text-gray-400 truncate">{progress.step}</p>
        </div>

        <div className="px-4 pb-3">
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ease-out ${
                isError ? 'bg-red-500' : isDone ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.max(0, progress.percent)}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-[10px] font-mono ${
              isError ? 'text-red-400' : isDone ? 'text-emerald-400' : 'text-gray-500'
            }`}>
              {isError ? 'Error' : `${Math.max(0, progress.percent)}%`}
            </span>
            {isDone && (
              <span className="text-[10px] text-emerald-400/60">Se cierra automáticamente</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Toolbar: React.FC = () => {
  const isNavMode = useStore((s) => s.isNavMode);
  const setIsNavMode = useStore((s) => s.setIsNavMode);
  const transformMode = useStore((s) => s.transformMode);
  const setTransformMode = useStore((s) => s.setTransformMode);
  const showGrid = useStore((s) => s.showGrid);
  const toggleGrid = useStore((s) => s.toggleGrid);
  const fov = useStore((s) => s.fov);
  const toggleFov = useStore((s) => s.toggleFov);
  const objects = useStore((s) => s.objects);
  const addObject = useStore((s) => s.addObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);
  const setSelectedId = useStore((s) => s.setSelectedId);
  const selectedIds = useStore((s) => s.selectedIds);
  const clearSelection = useStore((s) => s.clearSelection);
  const selectMultiple = useStore((s) => s.selectMultiple);
  const past = useStore((s) => s.past);
  const future = useStore((s) => s.future);
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const setObjects = useStore((s) => s.setObjects);
  const projectId = useStore((s) => s.projectId);
  const isDirty = useStore((s) => s.isDirty);
  const isPropsOpen = useStore((s) => s.isPropsOpen);
  const setIsPropsOpen = useStore((s) => s.setIsPropsOpen);
  const setCurrentView = useStore((s) => s.setCurrentView);
  const backgroundColor = useStore((s) => s.backgroundColor);
  const loadSceneConfig = useStore((s) => s.loadSceneConfig);
  const version = useStore((s) => s.version);

  const glbInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const saveButtonRef = useRef<HTMLDivElement>(null);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [saveProgress, setSaveProgress] = useState<SaveProgress | null>(null);
  const [saveMode, setSaveMode] = useState<'full' | 'json'>('json');

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const saveMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSaveMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideButton = saveButtonRef.current?.contains(target);
      const insideMenu = saveMenuRef.current?.contains(target);
      if (!insideButton && !insideMenu) {
        setShowSaveMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSaveMenu]);

  const handleSave = useCallback(async (mode: 'full' | 'json') => {
    setShowSaveMenu(false);
    if (!projectId || isSaving) return;

    setSaveMode(mode);
    setIsSaving(true);
    setSaveProgress({ percent: 0, step: 'Iniciando…' });

    const onProgress = (p: SaveProgress) => setSaveProgress(p);

    try {
      if (mode === 'full') {
        await saveProject(undefined, onProgress);
      } else {
        await quickSave(onProgress);
      }
    } catch {
      setSaveProgress({ percent: -1, step: 'Error inesperado' });
    }
    setIsSaving(false);
  }, [projectId, isSaving]);

  useEffect(() => {
    const handleQuickSave = () => { handleSave('json'); };
    window.addEventListener('toolbar:quick-save', handleQuickSave);
    return () => window.removeEventListener('toolbar:quick-save', handleQuickSave);
  }, [handleSave]);

  const handleDismissProgress = useCallback(() => {
    setSaveProgress(null);
  }, []);

  const handleSaveClick = useCallback(() => {
    if (isSaving || !projectId) return;
    setShowSaveMenu((v) => !v);
  }, [isSaving, projectId, showSaveMenu]);

  const handleAddObject = (
    type: ObjectType,
    url?: string,
    fileName?: string,
    groupId?: string,
    position?: [number, number, number]
  ) => {
    saveSnapshot(objects);
    const id = crypto.randomUUID();
    const pos = position ?? [0, 0, 0];
    addObject({
      id,
      name: fileName || `${type.replace('_', ' ')} ${objects.length + 1}`,
      type,
      transform: { position: pos, rotation: [0, 0, 0], scale: [1, 1, 1] },
      color: type.includes('light') ? DEFAULT_LIGHT_COLOR : DEFAULT_OBJECT_COLOR,
      intensity: type.includes('light') ? 1 : undefined,
      visible: true,
      locked: false,
      roughness: DEFAULT_ROUGHNESS,
      metalness: DEFAULT_METALNESS,
      url,
      groupId,
      clickable: type === ObjectType.GLB,
      modalTitle: type === ObjectType.GLB ? 'Storytelling Visual' : undefined,
      modalDescription: type === ObjectType.GLB ? 'Este objeto representa un punto de inflexión en la narrativa visual del espacio.' : undefined,
    });
    setSelectedId(id);
  };

  const handleUndo = () => {
    const previous = undo(objects);
    if (previous) {
      setObjects(previous);
      clearSelection();
    }
  };

  const handleRedo = () => {
    const next = redo(objects);
    if (next) {
      setObjects(next);
      clearSelection();
    }
  };

  const handleGlbImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) {
      e.target.value = '';
      return;
    }
    saveSnapshot(objects);
    const groupId = files.length > 1 ? crypto.randomUUID() : undefined;
    const addedIds: string[] = [];
    files.forEach((file) => {
      const id = crypto.randomUUID();
      const position: [number, number, number] = [0, 0, 0];
      const blobUrl = URL.createObjectURL(file);
      addObject({
        id,
        name: file.name,
        type: ObjectType.GLB,
        transform: { position, rotation: [0, 0, 0], scale: [1, 1, 1] },
        color: DEFAULT_OBJECT_COLOR,
        visible: true,
        locked: false,
        roughness: DEFAULT_ROUGHNESS,
        metalness: DEFAULT_METALNESS,
        url: blobUrl,
        groupId,
        clickable: true,
        modalTitle: 'Storytelling Visual',
        modalDescription: 'Este objeto representa un punto de inflexión en la narrativa visual del espacio.',
      });
      addedIds.push(id);
    });
    if (addedIds.length === 1) {
      setSelectedId(addedIds[0]);
    } else {
      selectMultiple(addedIds);
    }
    e.target.value = '';
  };

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  const handleExportProject = () => {
    const meshExport = objects
      .filter((o) => !o.type.includes('light'))
      .map((o) => sanitizeGlbForPersistence(o));
    const config: SceneConfig = {
      version: version || 1,
      backgroundColor,
      showGrid,
      lights: objects.filter((o) => o.type.includes('light')),
      objects: meshExport,
      uniqueGlbs: [],
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `proyecto-${projectId || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportProject = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target?.result as string) as SceneConfig;
        loadSceneConfig(config.backgroundColor, config.showGrid, config.version);
        const allObjects = [...(config.objects || []), ...(config.lights || [])];
        setObjects(normalizeLoadedSceneObjects(allObjects, config.uniqueGlbs || []));
        clearSelection();
      } catch (err) {
        console.error('Error importing project:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const saveIcon =
    isSaving ? <Loader2 size={16} className="animate-spin" /> :
    saveProgress?.percent === 100 ? <Check size={16} className="text-emerald-400" /> :
    saveProgress?.percent === -1 ? <AlertCircle size={16} className="text-red-400" /> :
    <Save size={16} className={isDirty && projectId ? 'text-emerald-400' : ''} />;

  const saveTooltip =
    isSaving ? 'Guardando…' :
    !projectId ? 'Sin proyecto abierto' :
    isDirty ? 'Guardar (⌘S)' : 'Sin cambios';

  const btnDisabled = isSaving || !projectId;

  return (
    <>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 max-w-[95vw]">
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-2xl border border-white/5 p-1 rounded-xl sm:rounded-2xl shadow-2xl overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 px-1">
            <ToolbarButton onClick={handleToggleFullscreen} icon={<Fullscreen size={16} />} tooltip={isFullscreen ? 'Salir Fullscreen' : 'Pantalla completa'} />
            <ToolbarButton onClick={() => setShowShortcuts((v) => !v)} icon={<Keyboard size={16} />} tooltip="Atajos rápidos" active={showShortcuts} />

            {selectedIds.length > 0 && (
              <>
                <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />
                <ToolbarButton
                  onClick={clearSelection}
                  icon={<CheckCircle size={16} className="text-emerald-400" />}
                  tooltip="Listo (Enter)"
                />
              </>
            )}

            <ToolbarButton
              onClick={() => setIsPropsOpen(!isPropsOpen)}
              icon={<Settings size={16} />}
              tooltip="Propiedades"
              active={isPropsOpen}
            />

            <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />

            <ToolbarButton onClick={() => setCurrentView('projects')} icon={<FolderOpen size={16} />} tooltip="Abrir proyecto" />

            <div className="relative shrink-0" ref={saveButtonRef}>
              <ToolbarButton
                onClick={handleSaveClick}
                disabled={btnDisabled}
                icon={saveIcon}
                tooltip={saveTooltip}
              />
            </div>

            <ToolbarButton onClick={() => importInputRef.current?.click()} icon={<Upload size={16} />} tooltip="Importar JSON" />
            <ToolbarButton onClick={handleExportProject} icon={<Download size={16} />} tooltip="Exportar JSON" />

            <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />

            <ToolbarButton onClick={() => setIsNavMode(false)} icon={<Edit3 size={16} />} tooltip="Edición" active={!isNavMode} />
            <ToolbarButton onClick={() => setIsNavMode(true)} icon={<Compass size={16} />} tooltip="Recorrido" active={isNavMode} />

            <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />

            {!isNavMode && (
              <>
                <ToolbarButton onClick={handleUndo} icon={<Undo2 size={16} />} tooltip="Deshacer (Ctrl+Z)" disabled={past.length === 0} />
                <ToolbarButton onClick={handleRedo} icon={<Redo2 size={16} />} tooltip="Rehacer (Ctrl+Y)" disabled={future.length === 0} />
                <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />
              </>
            )}

            {!isNavMode ? (
              <>
                <ToolbarButton onClick={() => handleAddObject(ObjectType.BOX)} icon={<Square size={16} />} tooltip="Cubo" />
                <ToolbarButton onClick={() => handleAddObject(ObjectType.SPHERE)} icon={<Circle size={16} />} tooltip="Esfera" />
                <ToolbarButton onClick={() => glbInputRef.current?.click()} icon={<PackagePlus size={16} />} tooltip="Importar GLB" />
                <ToolbarButton onClick={() => handleAddObject(ObjectType.CAMERA)} icon={<Camera size={16} />} tooltip="Cámara" />

                <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5 hidden sm:block" />

                <ToolbarButton onClick={() => setTransformMode('translate')} icon={<Move size={16} />} tooltip="Mover" active={transformMode === 'translate'} />
                <ToolbarButton onClick={() => setTransformMode('rotate')} icon={<RotateCcw size={16} />} tooltip="Rotar" active={transformMode === 'rotate'} />

                <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />
                <ToolbarButton onClick={toggleGrid} icon={<Grid size={16} className={showGrid ? 'text-white' : 'text-gray-500'} />} tooltip="Grid" />
              </>
            ) : (
              <div className="flex items-center gap-2 pr-1">
                <div className="px-3 py-1 text-[8px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center whitespace-nowrap">
                  Viendo Escena
                </div>
                <div className="w-px h-5 bg-white/10" />
                <ToolbarButton onClick={toggleFov} icon={<Maximize size={16} className="text-emerald-400" />} tooltip={`FOV: ${fov}°`} />
              </div>
            )}
          </div>
        </div>
      </div>

      {showSaveMenu && (
        <div
          ref={saveMenuRef}
          className="fixed z-50"
          style={{
            top: saveButtonRef.current
              ? saveButtonRef.current.getBoundingClientRect().bottom + 8
              : 60,
            left: saveButtonRef.current
              ? saveButtonRef.current.getBoundingClientRect().left +
                saveButtonRef.current.getBoundingClientRect().width / 2 - 110
              : '50%',
          }}
        >
          <div className="min-w-[220px] bg-black/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            <button
              onClick={() => handleSave('full')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors group"
            >
              <HardDrive size={16} className="text-emerald-400 shrink-0" />
              <div>
                <div className="font-medium text-white group-hover:text-emerald-400 transition-colors">Proyecto Completo</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Sube GLBs + JSON + metadatos</div>
              </div>
            </button>
            <div className="h-px bg-white/5" />
            <button
              onClick={() => handleSave('json')}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors group"
            >
              <FileJson size={16} className="text-blue-400 shrink-0" />
              <div>
                <div className="font-medium text-white group-hover:text-blue-400 transition-colors">Solo JSON</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Reemplaza config, mantiene GLBs</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {saveProgress && (
        <SaveProgressOverlay
          progress={saveProgress}
          mode={saveMode}
          onDismiss={handleDismissProgress}
        />
      )}

      <input type="file" ref={glbInputRef} onChange={handleGlbImport} className="hidden" accept=".glb,.gltf" multiple />
      <input type="file" ref={importInputRef} onChange={handleImportProject} className="hidden" accept=".json" />

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </>
  );
};
