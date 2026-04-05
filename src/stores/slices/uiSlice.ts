import { StateCreator } from 'zustand';
import type { TransformMode } from '../../types';
import { DEFAULT_FOV } from '../../constants/defaults';

export type PreviewDevice = 'web' | 'mobile';

export interface UiSlice {
  isSidebarOpen: boolean;
  isPropsOpen: boolean;
  isPreview: boolean;
  isNavMode: boolean;
  transformMode: TransformMode;
  fov: number;
  isMobile: boolean;
  activeWallIndex: number;
  activeModalObjectId: string | null;
  showVideo: boolean;
  previewDevice: PreviewDevice;

  setIsSidebarOpen: (val: boolean) => void;
  setIsPropsOpen: (val: boolean) => void;
  setIsPreview: (val: boolean) => void;
  setIsNavMode: (val: boolean) => void;
  setTransformMode: (mode: TransformMode) => void;
  setFov: (fov: number) => void;
  toggleFov: () => void;
  setIsMobile: (val: boolean) => void;
  setActiveWallIndex: (idx: number) => void;
  setActiveModalObjectId: (id: string | null) => void;
  setShowVideo: (val: boolean) => void;
  setPreviewDevice: (device: PreviewDevice) => void;
  enterPreview: () => void;
  exitPreview: () => void;
}

export const createUiSlice: StateCreator<UiSlice, [['zustand/immer', never]], [], UiSlice> = (set) => ({
  isSidebarOpen: typeof window !== 'undefined' ? window.innerWidth > 1024 : true,
  isPropsOpen: typeof window !== 'undefined' ? window.innerWidth > 1280 : true,
  isPreview: false,
  isNavMode: false,
  transformMode: 'translate',
  fov: DEFAULT_FOV,
  isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
  activeWallIndex: 0,
  activeModalObjectId: null,
  showVideo: false,
  previewDevice: 'web',

  setIsSidebarOpen: (val) => set((s) => { s.isSidebarOpen = val; }),
  setIsPropsOpen: (val) => set((s) => { s.isPropsOpen = val; }),
  setIsPreview: (val) => set((s) => { s.isPreview = val; }),
  setIsNavMode: (val) => set((s) => { s.isNavMode = val; }),
  setTransformMode: (mode) => set((s) => { s.transformMode = mode; }),
  setFov: (fov) => set((s) => { s.fov = fov; }),
  toggleFov: () => set((s) => {
    if (s.fov === 60) s.fov = 40;
    else if (s.fov === 40) s.fov = 90;
    else s.fov = 60;
  }),
  setIsMobile: (val) => set((s) => { s.isMobile = val; }),
  setActiveWallIndex: (idx) => set((s) => { s.activeWallIndex = idx; }),
  setActiveModalObjectId: (id) => set((s) => { s.activeModalObjectId = id; }),
  setShowVideo: (val) => set((s) => { s.showVideo = val; }),
  setPreviewDevice: (device) => set((s) => { s.previewDevice = device; }),
  enterPreview: () => set((s) => {
    s.isPreview = true;
    s.isNavMode = true;
    s.isSidebarOpen = false;
    s.isPropsOpen = false;
    s.activeModalObjectId = null;
    s.showVideo = false;
    s.previewDevice = 'web';
  }),
  exitPreview: () => set((s) => {
    s.isPreview = false;
    s.isSidebarOpen = typeof window !== 'undefined' ? window.innerWidth > 1024 : true;
    s.isPropsOpen = typeof window !== 'undefined' ? window.innerWidth > 1280 : true;
  }),
});
