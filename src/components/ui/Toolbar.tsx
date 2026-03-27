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
  Lightbulb,
  Magnet,
  Copy,
  RefreshCw,
  FolderInput,
  ChevronDown,
  Folder,
  Wand2,
} from 'lucide-react';
import { ShortcutsModal } from './ShortcutsModal';
import { useGroups } from '@/hooks/useGroups';
import { listProjects } from '@/services/projectService';

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
  const lightsEnabled = useStore((s) => s.lightsEnabled);
  const toggleLights = useStore((s) => s.toggleLights);
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
  const projectName = useStore((s) => s.projectName);
  const setProject = useStore((s) => s.setProject);

  const { assignAllToNearestWall, autoCompleteWallObjects } = useGroups();

  const glbInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const saveButtonRef = useRef<HTMLDivElement>(null);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [saveProgress, setSaveProgress] = useState<SaveProgress | null>(null);
  const [saveMode, setSaveMode] = useState<'full' | 'json'>('json');
  const [pendingSaveMode, setPendingSaveMode] = useState<'full' | 'json' | null>(null);
  const [saveName, setSaveName] = useState('');
  const [showExistingList, setShowExistingList] = useState(false);
  const [existingProjects, setExistingProjects] = useState<{ id: string; name: string }[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [autoCompleteUrl, setAutoCompleteUrl] = useState('');
  const [autoCompleteResult, setAutoCompleteResult] = useState<number | null>(null);

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

  const handleSaveModeSelect = useCallback((mode: 'full' | 'json') => {
    setShowSaveMenu(false);
    if (!projectId || isSaving) return;
    setSaveName(projectName || '');
    setPendingSaveMode(mode);
  }, [projectId, isSaving, projectName]);

  const executeSave = useCallback(async (mode: 'full' | 'json') => {
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

  const handleOverwrite = useCallback(() => {
    if (!pendingSaveMode) return;
    const mode = pendingSaveMode;
    const trimmedName = saveName.trim() || projectName || 'Proyecto sin nombre';
    setPendingSaveMode(null);
    setShowExistingList(false);

    if (trimmedName !== projectName) {
      setProject({ name: trimmedName });
    }

    executeSave(mode);
  }, [pendingSaveMode, executeSave, saveName, projectName, setProject]);

  const handleSaveAsNew = useCallback(() => {
    if (!pendingSaveMode) return;
    const mode = pendingSaveMode;
    const trimmedName = saveName.trim() || `${projectName || 'Proyecto'} (copia)`;
    setPendingSaveMode(null);
    setShowExistingList(false);

    const newId = crypto.randomUUID();
    setProject({
      id: newId,
      name: trimmedName,
      createdAt: Date.now(),
    });

    setTimeout(() => executeSave(mode), 0);
  }, [pendingSaveMode, executeSave, saveName, projectName, setProject]);

  const handleToggleExistingList = useCallback(async () => {
    if (showExistingList) {
      setShowExistingList(false);
      return;
    }
    setLoadingProjects(true);
    setShowExistingList(true);
    try {
      const projects = await listProjects();
      setExistingProjects(
        projects
          .filter((p) => p.id !== projectId)
          .map((p) => ({ id: p.id, name: p.name || 'Sin nombre' }))
      );
    } catch {
      setExistingProjects([]);
    }
    setLoadingProjects(false);
  }, [showExistingList, projectId]);

  const handleSaveToExisting = useCallback((targetId: string, targetName: string) => {
    if (!pendingSaveMode) return;
    const mode = pendingSaveMode;
    const trimmedName = saveName.trim() || targetName;
    setPendingSaveMode(null);
    setShowExistingList(false);

    setProject({
      id: targetId,
      name: trimmedName,
      createdAt: Date.now(),
    });

    setTimeout(() => executeSave(mode), 0);
  }, [pendingSaveMode, executeSave, saveName, setProject]);

  useEffect(() => {
    const handleQuickSave = () => { handleSaveModeSelect('json'); };
    window.addEventListener('toolbar:quick-save', handleQuickSave);
    return () => window.removeEventListener('toolbar:quick-save', handleQuickSave);
  }, [handleSaveModeSelect]);

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

  const handleGlbImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) {
      e.target.value = '';
      return;
    }
    saveSnapshot(objects);

    const gltfFile = files.find(f => f.name.toLowerCase().endsWith('.gltf'));

    if (gltfFile) {
      try {
        const fileMap = new Map<string, File>();
        files.forEach(f => fileMap.set(f.name, f));

        const gltfText = await gltfFile.text();
        const gltfJson = JSON.parse(gltfText);

        if (gltfJson.buffers) {
          for (const buffer of gltfJson.buffers) {
            if (buffer.uri && !buffer.uri.startsWith('data:')) {
              const match = fileMap.get(buffer.uri) ?? fileMap.get(buffer.uri.split('/').pop()!);
              if (match) {
                buffer.uri = URL.createObjectURL(match);
              }
            }
          }
        }

        const FALLBACK_PIXEL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mO88P9/PQAJhAN8xBGJLwAAAABJRU5ErkJggg==';
        if (gltfJson.images) {
          for (const image of gltfJson.images) {
            if (image.uri && !image.uri.startsWith('data:')) {
              const baseName = image.uri.split('/').pop()!;
              const match = fileMap.get(image.uri) ?? fileMap.get(baseName);
              image.uri = match ? URL.createObjectURL(match) : FALLBACK_PIXEL;
            }
          }
        }

        const modifiedBlob = new Blob([JSON.stringify(gltfJson)], { type: 'model/gltf+json' });
        const blobUrl = URL.createObjectURL(modifiedBlob);
        const id = crypto.randomUUID();
        const displayName = gltfFile.name.replace(/\.gltf$/i, '');

        addObject({
          id,
          name: displayName,
          type: ObjectType.GLB,
          transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          color: DEFAULT_OBJECT_COLOR,
          visible: true,
          locked: false,
          roughness: DEFAULT_ROUGHNESS,
          metalness: DEFAULT_METALNESS,
          url: blobUrl,
          clickable: true,
          modalTitle: 'Storytelling Visual',
          modalDescription: 'Este objeto representa un punto de inflexión en la narrativa visual del espacio.',
        });
        setSelectedId(id);
      } catch (err) {
        console.error('Error importing GLTF:', err);
      }
    } else {
      const groupId = files.length > 1 ? crypto.randomUUID() : undefined;
      const addedIds: string[] = [];
      files.forEach((file) => {
        const id = crypto.randomUUID();
        const blobUrl = URL.createObjectURL(file);
        addObject({
          id,
          name: file.name,
          type: ObjectType.GLB,
          transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
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

            <ToolbarButton
              onClick={() => {
                if (isDirty) {
                  setShowExitConfirm(true);
                } else {
                  setCurrentView('projects');
                }
              }}
              icon={<FolderOpen size={16} />}
              tooltip="Abrir proyecto"
            />

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
                <ToolbarButton onClick={toggleGrid} icon={<Grid size={16} className={showGrid ? 'text-white' : 'text-gray-500'} />} tooltip="Grid (G)" />
                <ToolbarButton onClick={toggleLights} icon={<Lightbulb size={16} className={lightsEnabled ? 'text-yellow-400' : 'text-gray-500'} />} tooltip={lightsEnabled ? 'Desactivar luces (I)' : 'Activar luces (I)'} />

                <div className="w-px h-5 sm:h-6 bg-white/10 mx-0.5" />
                <ToolbarButton
                  onClick={assignAllToNearestWall}
                  icon={<Magnet size={16} />}
                  tooltip="Auto-asignar paredes"
                  disabled={objects.filter((o) => o.type === ObjectType.GLB).length === 0}
                />
                <ToolbarButton
                  onClick={() => {
                    setAutoCompleteUrl('');
                    setAutoCompleteResult(null);
                    setShowAutoComplete(true);
                  }}
                  icon={<Wand2 size={16} />}
                  tooltip="Auto-completar video a objetos con pared"
                  disabled={objects.filter((o) => o.type === ObjectType.GLB && o.wallLabel && o.wallPosition != null).length === 0}
                />
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
              onClick={() => handleSaveModeSelect('full')}
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
              onClick={() => handleSaveModeSelect('json')}
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

      {pendingSaveMode && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">
                {pendingSaveMode === 'full' ? 'Proyecto Completo' : 'Solo JSON'}
              </h3>
              <button
                onClick={() => { setPendingSaveMode(null); setShowExistingList(false); }}
                className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">Nombre del proyecto</label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Mi proyecto..."
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 placeholder:text-gray-600"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleOverwrite}
                className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 hover:bg-emerald-600/20 border border-white/10 hover:border-emerald-500/30 rounded-xl text-left transition-all group"
              >
                <RefreshCw size={16} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">Sobreescribir</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Reemplaza el proyecto actual</div>
                </div>
              </button>
              <button
                onClick={handleSaveAsNew}
                className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 hover:bg-blue-600/20 border border-white/10 hover:border-blue-500/30 rounded-xl text-left transition-all group"
              >
                <Copy size={16} className="text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">Guardar como nuevo</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Crea una copia con nuevo ID</div>
                </div>
              </button>

              <div>
                <button
                  onClick={handleToggleExistingList}
                  className="flex items-center gap-3 w-full px-4 py-3 bg-white/5 hover:bg-amber-600/20 border border-white/10 hover:border-amber-500/30 rounded-xl text-left transition-all group"
                >
                  <FolderInput size={16} className="text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Guardar en existente</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Sobreescribe otro proyecto</div>
                  </div>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${showExistingList ? 'rotate-180' : ''}`} />
                </button>

                {showExistingList && (
                  <div className="mt-1.5 max-h-40 overflow-y-auto rounded-xl border border-white/5 bg-black/50">
                    {loadingProjects ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 size={16} className="text-gray-500 animate-spin" />
                      </div>
                    ) : existingProjects.length === 0 ? (
                      <p className="text-[11px] text-gray-600 text-center py-3">No hay otros proyectos</p>
                    ) : (
                      existingProjects.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSaveToExisting(p.id, p.name)}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors group/item border-b border-white/5 last:border-b-0"
                        >
                          <Folder size={14} className="text-gray-600 group-hover/item:text-amber-400 shrink-0 transition-colors" />
                          <span className="text-xs text-gray-300 group-hover/item:text-white truncate transition-colors">{p.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
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

      <input type="file" ref={glbInputRef} onChange={handleGlbImport} className="hidden" accept=".glb,.gltf,.bin" multiple />
      <input type="file" ref={importInputRef} onChange={handleImportProject} className="hidden" accept=".json" />

      {showAutoComplete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wand2 size={16} className="text-purple-400" />
                Auto-completar objetos
              </h3>
              <button
                onClick={() => setShowAutoComplete(false)}
                className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-[11px] text-gray-400">
              Asigna la URL de video y activa el modal en todos los objetos que ya tienen pared y posición ({objects.filter((o) => o.type === ObjectType.GLB && o.wallLabel && o.wallPosition != null).length} objetos).
            </p>

            <div>
              <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1.5">URL de Video</label>
              <input
                type="url"
                value={autoCompleteUrl}
                onChange={(e) => setAutoCompleteUrl(e.target.value)}
                placeholder="https://stream.mux.com/..."
                className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 placeholder:text-gray-600"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && autoCompleteUrl.trim()) {
                    const count = autoCompleteWallObjects(autoCompleteUrl.trim());
                    setAutoCompleteResult(count);
                  }
                }}
              />
            </div>

            {autoCompleteResult !== null && (
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-900/20 border border-emerald-500/20 rounded-xl">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-300">
                  {autoCompleteResult} objeto{autoCompleteResult !== 1 ? 's' : ''} actualizado{autoCompleteResult !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowAutoComplete(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-colors"
              >
                {autoCompleteResult !== null ? 'Cerrar' : 'Cancelar'}
              </button>
              {autoCompleteResult === null && (
                <button
                  onClick={() => {
                    if (!autoCompleteUrl.trim()) return;
                    const count = autoCompleteWallObjects(autoCompleteUrl.trim());
                    setAutoCompleteResult(count);
                  }}
                  disabled={!autoCompleteUrl.trim()}
                  className="flex-1 px-4 py-2.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/30 rounded-xl text-xs font-bold text-purple-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Aplicar a todos
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showExitConfirm && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Cambios sin guardar</h3>
              <button
                onClick={() => setShowExitConfirm(false)}
                className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-400">
              Tienes cambios sin guardar. Si sales ahora, los perderás.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  setCurrentView('projects');
                }}
                className="flex-1 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 transition-colors"
              >
                Salir sin guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </>
  );
};
