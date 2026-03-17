import { ref, uploadString, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ensureFirebase, getStorageRef } from './firebase';
import type { SceneConfig } from '@/types';

export async function uploadProjectJSON(projectId: string, config: SceneConfig): Promise<string> {
  try {
    const ready = await ensureFirebase();
    if (!ready) {
      console.warn('Firebase not available, skipping upload');
      return '';
    }
    const storage = getStorageRef();
    if (!storage) return '';

    const jsonRef = ref(storage, `projects/${projectId}.json`);
    const jsonStr = JSON.stringify(config, null, 2);
    await uploadString(jsonRef, jsonStr);
    return await getDownloadURL(jsonRef);
  } catch (err) {
    console.error('Error uploading project JSON:', err);
    return '';
  }
}

export async function downloadProjectJSON(url: string): Promise<SceneConfig | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Error downloading project JSON:', err);
    return null;
  }
}

export async function uploadGLB(
  projectId: string,
  fileName: string,
  blob: Blob
): Promise<{ url: string; path: string }> {
  try {
    const ready = await ensureFirebase();
    if (!ready) return { url: '', path: '' };
    const storage = getStorageRef();
    if (!storage) return { url: '', path: '' };

    const path = `projects/${projectId}/models/${fileName}`;
    const glbRef = ref(storage, path);
    await uploadBytes(glbRef, blob);
    const url = await getDownloadURL(glbRef);
    return { url, path };
  } catch (err) {
    console.error('Error uploading GLB:', err);
    return { url: '', path: '' };
  }
}

export async function deleteStorageFile(path: string): Promise<void> {
  try {
    const ready = await ensureFirebase();
    if (!ready) return;
    const storage = getStorageRef();
    if (!storage) return;

    await deleteObject(ref(storage, path));
  } catch (err) {
    console.error('Error deleting storage file:', err);
  }
}
