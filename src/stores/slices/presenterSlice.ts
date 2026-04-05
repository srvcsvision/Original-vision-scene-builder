import { StateCreator } from 'zustand';
import type { Presenter } from '../../types';

export interface PresenterSlice {
  presenters: Presenter[];

  setPresenters: (presenters: Presenter[]) => void;
  addPresenter: (presenter: Presenter) => void;
  updatePresenter: (id: string, updates: Partial<Omit<Presenter, 'id'>>) => void;
  removePresenter: (id: string) => void;
}

export const createPresenterSlice: StateCreator<PresenterSlice, [['zustand/immer', never]], [], PresenterSlice> = (set) => ({
  presenters: [],

  setPresenters: (presenters) => set((s) => { s.presenters = presenters; }),
  addPresenter: (presenter) => set((s) => { s.presenters.push(presenter); }),
  updatePresenter: (id, updates) => set((s) => {
    const idx = s.presenters.findIndex((p) => p.id === id);
    if (idx !== -1) {
      Object.assign(s.presenters[idx], updates);
    }
  }),
  removePresenter: (id) => set((s) => {
    s.presenters = s.presenters.filter((p) => p.id !== id);
  }),
});
