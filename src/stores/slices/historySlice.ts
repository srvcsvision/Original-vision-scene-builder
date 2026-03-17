import { StateCreator } from 'zustand';
import type { SceneObject } from '../../types';
import { MAX_HISTORY } from '../../constants/defaults';

export interface HistorySlice {
  past: SceneObject[][];
  future: SceneObject[][];

  saveSnapshot: (current: SceneObject[]) => void;
  undo: (currentObjects: SceneObject[]) => SceneObject[] | null;
  redo: (currentObjects: SceneObject[]) => SceneObject[] | null;
  clearHistory: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const createHistorySlice: StateCreator<HistorySlice, [['zustand/immer', never]], [], HistorySlice> = (set, get) => ({
  past: [],
  future: [],

  saveSnapshot: (current) => set((s) => {
    const snapshot = JSON.parse(JSON.stringify(current));
    s.past.push(snapshot);
    if (s.past.length > MAX_HISTORY) s.past.shift();
    s.future = [];
  }),

  undo: (currentObjects) => {
    const { past } = get();
    if (past.length === 0) return null;
    const previous = past[past.length - 1];
    set((s) => {
      s.past.pop();
      s.future.unshift(JSON.parse(JSON.stringify(currentObjects)));
    });
    return previous;
  },

  redo: (currentObjects) => {
    const { future } = get();
    if (future.length === 0) return null;
    const next = future[0];
    set((s) => {
      s.past.push(JSON.parse(JSON.stringify(currentObjects)));
      s.future.shift();
    });
    return next;
  },

  clearHistory: () => set((s) => { s.past = []; s.future = []; }),
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
});
