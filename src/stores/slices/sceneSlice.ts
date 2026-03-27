import { StateCreator } from 'zustand';
import { DEFAULT_BACKGROUND_COLOR } from '../../constants/defaults';

export interface SceneSlice {
  backgroundColor: string;
  showGrid: boolean;
  lightsEnabled: boolean;
  version: number;
  cameraPerspectiveId: string | null;

  setBackgroundColor: (color: string) => void;
  setShowGrid: (val: boolean) => void;
  toggleGrid: () => void;
  toggleLights: () => void;
  setLightsEnabled: (val: boolean) => void;
  loadSceneConfig: (bg: string, grid: boolean, version: number) => void;
  setCameraPerspectiveId: (id: string | null) => void;
}

export const createSceneSlice: StateCreator<SceneSlice, [['zustand/immer', never]], [], SceneSlice> = (set) => ({
  backgroundColor: DEFAULT_BACKGROUND_COLOR,
  showGrid: true,
  lightsEnabled: true,
  version: 1,
  cameraPerspectiveId: null,

  setBackgroundColor: (color) => set((s) => { s.backgroundColor = color; }),
  setShowGrid: (val) => set((s) => { s.showGrid = val; }),
  toggleGrid: () => set((s) => { s.showGrid = !s.showGrid; }),
  toggleLights: () => set((s) => { s.lightsEnabled = !s.lightsEnabled; }),
  setLightsEnabled: (val) => set((s) => { s.lightsEnabled = val; }),
  loadSceneConfig: (bg, grid, version) => set((s) => {
    s.backgroundColor = bg;
    s.showGrid = grid;
    s.version = version;
  }),
  setCameraPerspectiveId: (id) => set((s) => { s.cameraPerspectiveId = id; }),
});
