import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { createProjectSlice, type ProjectSlice } from './slices/projectSlice';
import { createSceneSlice, type SceneSlice } from './slices/sceneSlice';
import { createObjectsSlice, type ObjectsSlice } from './slices/objectsSlice';
import { createHistorySlice, type HistorySlice } from './slices/historySlice';
import { createUiSlice, type UiSlice } from './slices/uiSlice';
import { createClipboardSlice, type ClipboardSlice } from './slices/clipboardSlice';

export type StoreState = ProjectSlice & SceneSlice & ObjectsSlice & HistorySlice & UiSlice & ClipboardSlice;

export const useStore = create<StoreState>()(
  immer((...a) => ({
    ...createProjectSlice(...a),
    ...createSceneSlice(...a),
    ...createObjectsSlice(...a),
    ...createHistorySlice(...a),
    ...createUiSlice(...a),
    ...createClipboardSlice(...a),
  }))
);

useStore.subscribe((state, prevState) => {
  if (state.objects !== prevState.objects && state.projectId && !state.isDirty) {
    useStore.getState().markDirty();
  }
});
