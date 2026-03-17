import { StateCreator } from 'zustand';
import type { SceneObject } from '../../types';

export interface ClipboardSlice {
  copiedObjects: SceneObject[];

  copyObjects: (objects: SceneObject[]) => void;
  getCopiedObjects: () => SceneObject[];
  clearClipboard: () => void;
  hasClipboard: () => boolean;
}

export const createClipboardSlice: StateCreator<ClipboardSlice, [['zustand/immer', never]], [], ClipboardSlice> = (set, get) => ({
  copiedObjects: [],

  copyObjects: (objects) => set((s) => {
    s.copiedObjects = JSON.parse(JSON.stringify(objects));
  }),
  getCopiedObjects: () => get().copiedObjects,
  clearClipboard: () => set((s) => { s.copiedObjects = []; }),
  hasClipboard: () => get().copiedObjects.length > 0,
});
