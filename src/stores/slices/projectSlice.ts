import { StateCreator } from 'zustand';
import type { AppView, ProjectMeta } from '../../types';

export interface ProjectSlice {
  currentView: AppView;
  projectId: string | null;
  projectName: string;
  createdAt: number | null;
  updatedAt: number | null;
  isDirty: boolean;
  projectsList: ProjectMeta[];

  setCurrentView: (view: AppView) => void;
  setProject: (meta: Partial<ProjectMeta>) => void;
  setProjectsList: (list: ProjectMeta[]) => void;
  markDirty: () => void;
  markClean: () => void;
  resetProject: () => void;
}

export const createProjectSlice: StateCreator<ProjectSlice, [['zustand/immer', never]], [], ProjectSlice> = (set) => ({
  currentView: 'projects',
  projectId: null,
  projectName: '',
  createdAt: null,
  updatedAt: null,
  isDirty: false,
  projectsList: [],

  setCurrentView: (view) => set((s) => { s.currentView = view; }),
  setProject: (meta) => set((s) => {
    if (meta.id !== undefined) s.projectId = meta.id;
    if (meta.name !== undefined) s.projectName = meta.name;
    if (meta.createdAt !== undefined) s.createdAt = meta.createdAt;
    if (meta.updatedAt !== undefined) s.updatedAt = meta.updatedAt;
  }),
  setProjectsList: (list) => set((s) => { s.projectsList = list; }),
  markDirty: () => set((s) => { s.isDirty = true; }),
  markClean: () => set((s) => { s.isDirty = false; }),
  resetProject: () => set((s) => {
    s.projectId = null;
    s.projectName = '';
    s.createdAt = null;
    s.updatedAt = null;
    s.isDirty = false;
  }),
});
