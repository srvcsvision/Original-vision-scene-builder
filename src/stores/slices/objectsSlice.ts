import { StateCreator } from 'zustand';
import type { SceneObject } from '../../types';

export interface ObjectsSlice {
  objects: SceneObject[];
  selectedIds: string[];

  setObjects: (objects: SceneObject[]) => void;
  addObject: (obj: SceneObject) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  clearObjects: () => void;

  selectSingle: (id: string) => void;
  toggleSelection: (id: string) => void;
  selectMultiple: (ids: string[]) => void;
  clearSelection: () => void;
  setSelectedId: (id: string | null) => void;
}

export const createObjectsSlice: StateCreator<ObjectsSlice, [['zustand/immer', never]], [], ObjectsSlice> = (set) => ({
  objects: [],
  selectedIds: [],

  setObjects: (objects) => set((s) => { s.objects = objects; }),
  addObject: (obj) => set((s) => { s.objects.push(obj); }),
  updateObject: (id, updates) => set((s) => {
    const idx = s.objects.findIndex((o) => o.id === id);
    if (idx !== -1) {
      Object.assign(s.objects[idx], updates);
    }
  }),
  removeObject: (id) => set((s) => {
    s.objects = s.objects.filter((o) => o.id !== id);
    s.selectedIds = s.selectedIds.filter((sid) => sid !== id);
  }),
  clearObjects: () => set((s) => { s.objects = []; s.selectedIds = []; }),

  selectSingle: (id) => set((s) => { s.selectedIds = [id]; }),
  toggleSelection: (id) => set((s) => {
    const idx = s.selectedIds.indexOf(id);
    if (idx === -1) {
      s.selectedIds.push(id);
    } else {
      s.selectedIds.splice(idx, 1);
    }
  }),
  selectMultiple: (ids) => set((s) => { s.selectedIds = ids; }),
  clearSelection: () => set((s) => { s.selectedIds = []; }),
  setSelectedId: (id) => set((s) => {
    s.selectedIds = id ? [id] : [];
  }),
});
