import { useEffect } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import {
  DEFAULT_OBJECT_COLOR,
  DEFAULT_LIGHT_COLOR,
  DEFAULT_ROUGHNESS,
  DEFAULT_METALNESS,
} from '@/constants/defaults';
import { quickSave } from '@/services/projectSaver';

export const useKeyboardShortcuts = () => {
  const undo = useStore((s) => s.undo);
  const redo = useStore((s) => s.redo);
  const objects = useStore((s) => s.objects);
  const setObjects = useStore((s) => s.setObjects);
  const clearSelection = useStore((s) => s.clearSelection);
  const selectedIds = useStore((s) => s.selectedIds);
  const removeObject = useStore((s) => s.removeObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);
  const copyObjects = useStore((s) => s.copyObjects);
  const copiedObjects = useStore((s) => s.copiedObjects);
  const addObject = useStore((s) => s.addObject);
  const selectSingle = useStore((s) => s.selectSingle);
  const setSelectedId = useStore((s) => s.setSelectedId);
  const toggleGrid = useStore((s) => s.toggleGrid);
  const activeModalObjectId = useStore((s) => s.activeModalObjectId);
  const setActiveModalObjectId = useStore((s) => s.setActiveModalObjectId);
  const setTransformMode = useStore((s) => s.setTransformMode);
  const isNavMode = useStore((s) => s.isNavMode);
  const setIsNavMode = useStore((s) => s.setIsNavMode);
  const isPropsOpen = useStore((s) => s.isPropsOpen);
  const setIsPropsOpen = useStore((s) => s.setIsPropsOpen);
  const isSidebarOpen = useStore((s) => s.isSidebarOpen);
  const setIsSidebarOpen = useStore((s) => s.setIsSidebarOpen);
  const projectId = useStore((s) => s.projectId);

  useEffect(() => {
    const addNewObject = (type: ObjectType) => {
      saveSnapshot(objects);
      const id = crypto.randomUUID();
      addObject({
        id,
        name: `${type.replace('_', ' ')} ${objects.length + 1}`,
        type,
        transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        color: type.includes('light') ? DEFAULT_LIGHT_COLOR : DEFAULT_OBJECT_COLOR,
        intensity: type.includes('light') ? 1 : undefined,
        visible: true,
        locked: false,
        roughness: DEFAULT_ROUGHNESS,
        metalness: DEFAULT_METALNESS,
        clickable: type === ObjectType.GLB,
      });
      setSelectedId(id);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = (e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA';
      if (isInput) return;

      const mod = e.ctrlKey || e.metaKey;

      // --- Undo / Redo ---
      if (mod && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          const next = redo(objects);
          if (next) { setObjects(next); clearSelection(); }
        } else {
          const prev = undo(objects);
          if (prev) { setObjects(prev); clearSelection(); }
        }
        return;
      }

      if (mod && e.key === 'y') {
        e.preventDefault();
        const next = redo(objects);
        if (next) { setObjects(next); clearSelection(); }
        return;
      }

      // --- Cmd+1 = Mover, Cmd+2 = Rotar ---
      if (mod && e.key === '1') {
        e.preventDefault();
        setTransformMode('translate');
        return;
      }

      if (mod && e.key === '2') {
        e.preventDefault();
        setTransformMode('rotate');
        return;
      }

      // --- Cmd+D = Duplicar seleccion ---
      if (mod && e.key === 'd' && selectedIds.length > 0) {
        e.preventDefault();
        saveSnapshot(objects);
        const selected = objects.filter((o) => selectedIds.includes(o.id));
        const groupRemap = new Map<string, string>();
        const newIds: string[] = [];
        selected.forEach((obj) => {
          const id = crypto.randomUUID();
          newIds.push(id);
          let newGroupId = obj.groupId;
          if (obj.groupId) {
            if (!groupRemap.has(obj.groupId)) groupRemap.set(obj.groupId, crypto.randomUUID());
            newGroupId = groupRemap.get(obj.groupId);
          }
          addObject({
            ...JSON.parse(JSON.stringify(obj)),
            id,
            name: `${obj.name} (copia)`,
            groupId: newGroupId,
            transform: {
              ...obj.transform,
              position: [
                obj.transform.position[0] + 1,
                obj.transform.position[1],
                obj.transform.position[2],
              ],
            },
          });
        });
        if (newIds.length > 0) selectSingle(newIds[newIds.length - 1]);
        return;
      }

      // --- Cmd+S = Guardar rápido ---
      if (mod && e.key === 's') {
        e.preventDefault();
        if (projectId) {
          window.dispatchEvent(new CustomEvent('toolbar:quick-save'));
        }
        return;
      }

      // --- Cmd+C = Copiar ---
      if (mod && e.key === 'c' && selectedIds.length > 0) {
        e.preventDefault();
        const selected = objects.filter((o) => selectedIds.includes(o.id));
        if (selected.length > 0) copyObjects(selected);
        return;
      }

      // --- Cmd+V = Pegar ---
      if (mod && e.key === 'v' && copiedObjects.length > 0) {
        e.preventDefault();
        saveSnapshot(objects);
        const groupRemap = new Map<string, string>();
        const newIds: string[] = [];
        copiedObjects.forEach((copied) => {
          const id = crypto.randomUUID();
          newIds.push(id);
          let newGroupId = copied.groupId;
          if (copied.groupId) {
            if (!groupRemap.has(copied.groupId)) groupRemap.set(copied.groupId, crypto.randomUUID());
            newGroupId = groupRemap.get(copied.groupId);
          }
          addObject({
            ...copied,
            id,
            name: `${copied.name} (copia)`,
            groupId: newGroupId,
            transform: {
              ...copied.transform,
              position: [
                copied.transform.position[0] + 1,
                copied.transform.position[1],
                copied.transform.position[2],
              ],
            },
          });
        });
        if (newIds.length > 0) selectSingle(newIds[newIds.length - 1]);
        return;
      }

      // --- Cmd+E = Toggle modo Edicion / Recorrido ---
      if (mod && e.key === 'e') {
        e.preventDefault();
        setIsNavMode(!isNavMode);
        return;
      }

      // --- Delete / Backspace = Eliminar ---
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault();
        saveSnapshot(objects);
        selectedIds.forEach((id) => removeObject(id));
        return;
      }

      // --- Shortcuts sin modifier ---

      // Alt held = light placement interactions in 3D, skip other shortcuts
      if (e.altKey && !mod) return;

      // G = Grid
      if (e.key === 'g' && !mod) {
        toggleGrid();
        return;
      }

      // Enter = Deseleccionar
      if (e.key === 'Enter' && selectedIds.length > 0) {
        e.preventDefault();
        clearSelection();
        return;
      }

      // Escape = Cerrar modal / deseleccionar
      if (e.key === 'Escape') {
        if (activeModalObjectId) {
          setActiveModalObjectId(null);
        } else if (selectedIds.length > 0) {
          clearSelection();
        }
        return;
      }

      // --- Agregar objetos: Shift + tecla ---

      // Shift+B = agregar Cubo (Box)
      if (e.shiftKey && e.key === 'B' && !mod) {
        e.preventDefault();
        addNewObject(ObjectType.BOX);
        return;
      }

      // Shift+S = agregar Esfera (Sphere)
      if (e.shiftKey && e.key === 'S' && !mod) {
        e.preventDefault();
        addNewObject(ObjectType.SPHERE);
        return;
      }

      // Shift+K = agregar Camera
      if (e.shiftKey && e.key === 'K' && !mod) {
        e.preventDefault();
        addNewObject(ObjectType.CAMERA);
        return;
      }

      // --- Luces: Shift+L abre file picker es complejo, usamos Shift+num ---

      // Shift+1 = Point Light
      if (e.shiftKey && e.key === '!' && !mod) {
        e.preventDefault();
        addNewObject(ObjectType.POINT_LIGHT);
        return;
      }

      // Shift+2 = Spot Light
      if (e.shiftKey && e.key === '@' && !mod) {
        e.preventDefault();
        addNewObject(ObjectType.SPOT_LIGHT);
        return;
      }

      // Shift+3 = Directional Light
      if (e.shiftKey && e.key === '#' && !mod) {
        e.preventDefault();
        addNewObject(ObjectType.DIRECTIONAL_LIGHT);
        return;
      }

      // Shift+4 = Ambient Light
      if (e.shiftKey && e.key === '$' && !mod) {
        e.preventDefault();
        addNewObject(ObjectType.AMBIENT_LIGHT);
        return;
      }

      // P = Toggle panel de propiedades
      if (e.key === 'p' && !mod) {
        setIsPropsOpen(!isPropsOpen);
        return;
      }

      // L = Toggle sidebar izquierdo
      if (e.key === 'l' && !mod) {
        setIsSidebarOpen(!isSidebarOpen);
        return;
      }

      // H = Ocultar/mostrar objeto seleccionado
      if (e.key === 'h' && !mod && selectedIds.length > 0) {
        saveSnapshot(objects);
        const store = useStore.getState();
        selectedIds.forEach((id) => {
          const obj = objects.find((o) => o.id === id);
          if (obj) store.updateObject(id, { visible: !obj.visible });
        });
        return;
      }

      // F = Focus / centrar cámara (toggle fullscreen)
      if (e.key === 'f' && !mod) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    undo, redo, objects, setObjects, clearSelection, selectedIds, removeObject,
    saveSnapshot, copyObjects, copiedObjects, addObject, selectSingle, setSelectedId,
    toggleGrid, activeModalObjectId, setActiveModalObjectId, setTransformMode,
    isNavMode, setIsNavMode, isPropsOpen, setIsPropsOpen, isSidebarOpen,
    setIsSidebarOpen, projectId,
  ]);
};
