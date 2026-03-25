import { ref, get, set, remove } from 'firebase/database';
import { ensureFirebase, getDb } from './firebase';
import type { ProjectMeta } from '@/types';

export async function listProjects(): Promise<ProjectMeta[]> {
  try {
    const ready = await ensureFirebase();
    if (!ready) return [];

    const db = getDb();
    if (!db) return [];

    const snapshot = await get(ref(db, 'projects'));
    if (!snapshot.exists()) return [];

    const data = snapshot.val();
    return Object.entries(data)
      .map(([id, val]: [string, any]) => ({
        id,
        name: val.name || '',
        createdAt: val.createdAt || 0,
        updatedAt: val.updatedAt || 0,
        storagePath: val.storagePath,
        storageUrl: val.storageUrl,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.error('Error listing projects:', err);
    return [];
  }
}

export async function saveProjectMeta(meta: ProjectMeta): Promise<void> {
  try {
    const ready = await ensureFirebase();
    if (!ready) return;

    const db = getDb();
    if (!db) return;

    await set(ref(db, `projects/${meta.id}`), {
      name: meta.name,
      createdAt: meta.createdAt,
      updatedAt: Date.now(),
      storagePath: meta.storagePath || `projects/${meta.id}.json`,
      storageUrl: meta.storageUrl || '',
    });
  } catch (err) {
    console.error('Error saving project meta:', err);
  }
}

export async function renameProject(projectId: string, newName: string): Promise<boolean> {
  try {
    const ready = await ensureFirebase();
    if (!ready) return false;

    const db = getDb();
    if (!db) return false;

    const snapshot = await get(ref(db, `projects/${projectId}`));
    if (!snapshot.exists()) return false;

    await set(ref(db, `projects/${projectId}/name`), newName);
    return true;
  } catch (err) {
    console.error('Error renaming project:', err);
    return false;
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    const ready = await ensureFirebase();
    if (!ready) return;

    const db = getDb();
    if (!db) return;

    await remove(ref(db, `projects/${projectId}`));
  } catch (err) {
    console.error('Error deleting project:', err);
  }
}
