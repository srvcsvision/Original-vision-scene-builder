import { useStore } from '@/stores/useStore';
import type { SceneConfig, UniqueGlb } from '@/types';
import { sanitizeGlbForPersistence } from '@/utils/scenePersistence';
import { sha256 } from '@/utils/hash';
import { uploadProjectJSON, uploadGLB, uploadTexture } from './storageService';
import { saveProjectMeta } from './projectService';

export type SaveProgress = {
  percent: number;
  step: string;
};

export type ProgressCallback = (progress: SaveProgress) => void;

export async function saveProject(name?: string, onProgress?: ProgressCallback): Promise<boolean> {
  const state = useStore.getState();
  const { projectId, objects, backgroundColor, showGrid, version } = state;

  if (!projectId) return false;
  if (!objects || objects.length === 0) {
    console.warn('[saveProject] Bloqueado: no se puede guardar un proyecto vacío');
    onProgress?.({ percent: -1, step: 'No hay objetos para guardar' });
    return false;
  }

  try {
    onProgress?.({ percent: 0, step: 'Preparando…' });

    const uniqueGlbs: UniqueGlb[] = [];
    const seen = new Map<string, { url: string; path: string }>();

    const blobObjects = objects.filter((o) => o.url && o.url.startsWith('blob:'));
    const textureObjects = objects.filter((o) => o.textureUrl && o.textureUrl.startsWith('blob:'));
    const totalSteps = blobObjects.length + textureObjects.length + 2;
    let completedSteps = 0;

    for (const obj of blobObjects) {
      onProgress?.({
        percent: Math.round((completedSteps / totalSteps) * 100),
        step: `Subiendo modelo: ${obj.name}`,
      });

      const resp = await fetch(obj.url!);
      const blob = await resp.blob();
      const buffer = await blob.arrayBuffer();
      const hash = await sha256(buffer);

      if (!seen.has(hash)) {
        const fileName = `${obj.name.replace(/[^a-zA-Z0-9._-]/g, '_')}.glb`;
        const result = await uploadGLB(projectId, fileName, blob);
        seen.set(hash, result);
        if (result.url) {
          uniqueGlbs.push({ path: result.path, url: result.url, name: fileName });
        }
      }

      const uploaded = seen.get(hash);
      if (uploaded?.url) {
        state.updateObject(obj.id, {
          modelUrl: uploaded.url,
          storageModelPath: uploaded.path,
        });
      }

      completedSteps++;
    }

    for (const obj of textureObjects) {
      onProgress?.({
        percent: Math.round((completedSteps / totalSteps) * 100),
        step: `Subiendo textura: ${obj.name}`,
      });

      try {
        const resp = await fetch(obj.textureUrl!);
        const blob = await resp.blob();
        const ext = blob.type.split('/')[1] || 'png';
        const fileName = `${obj.id}_${obj.name.replace(/[^a-zA-Z0-9._-]/g, '_')}.${ext}`;
        const result = await uploadTexture(projectId, fileName, blob);
        if (result.url) {
          state.updateObject(obj.id, { textureUrl: result.url });
        }
      } catch (err) {
        console.warn(`[saveProject] Error subiendo textura de ${obj.name}:`, err);
      }

      completedSteps++;
    }

    onProgress?.({
      percent: Math.round((completedSteps / totalSteps) * 100),
      step: 'Subiendo configuración JSON…',
    });

    const freshState = useStore.getState();
    const freshObjects = freshState.objects;
    const meshObjects = freshObjects
      .filter((o) => !o.type.includes('light'))
      .map((o) => sanitizeGlbForPersistence(o));

    const config: SceneConfig = {
      version: version || 1,
      backgroundColor,
      showGrid,
      lights: freshObjects.filter((o) => o.type.includes('light')),
      objects: meshObjects,
      uniqueGlbs,
      presenters: freshState.presenters,
    };

    const storageUrl = await uploadProjectJSON(projectId, config);
    completedSteps++;

    onProgress?.({
      percent: Math.round((completedSteps / totalSteps) * 100),
      step: 'Guardando metadatos…',
    });

    await saveProjectMeta({
      id: projectId,
      name: name || state.projectName || 'Proyecto sin nombre',
      createdAt: state.createdAt || Date.now(),
      updatedAt: Date.now(),
      storagePath: `projects/${projectId}.json`,
      storageUrl,
    });

    completedSteps++;
    onProgress?.({ percent: 100, step: '¡Guardado!' });

    state.markClean();
    return true;
  } catch (err) {
    console.error('Error saving project:', err);
    onProgress?.({ percent: -1, step: 'Error al guardar' });
    return false;
  }
}

export async function quickSave(onProgress?: ProgressCallback): Promise<boolean> {
  const state = useStore.getState();
  const { projectId, objects, backgroundColor, showGrid, version } = state;

  if (!projectId) return false;
  if (!objects || objects.length === 0) {
    console.warn('[quickSave] Bloqueado: no se puede guardar un proyecto vacío');
    onProgress?.({ percent: -1, step: 'No hay objetos para guardar' });
    return false;
  }

  try {
    onProgress?.({ percent: 0, step: 'Preparando JSON…' });

    const meshObjectsQuick = objects
      .filter((o) => !o.type.includes('light'))
      .map((o) => sanitizeGlbForPersistence(o));

    const config: SceneConfig = {
      version: version || 1,
      backgroundColor,
      showGrid,
      lights: objects.filter((o) => o.type.includes('light')),
      objects: meshObjectsQuick,
      uniqueGlbs: [],
      presenters: state.presenters,
    };

    onProgress?.({ percent: 30, step: 'Subiendo configuración…' });
    const storageUrl = await uploadProjectJSON(projectId, config);

    onProgress?.({ percent: 70, step: 'Guardando metadatos…' });
    await saveProjectMeta({
      id: projectId,
      name: state.projectName || 'Proyecto sin nombre',
      createdAt: state.createdAt || Date.now(),
      updatedAt: Date.now(),
      storagePath: `projects/${projectId}.json`,
      storageUrl,
    });

    onProgress?.({ percent: 100, step: '¡Guardado!' });
    state.markClean();
    return true;
  } catch (err) {
    console.error('Error in quick save:', err);
    onProgress?.({ percent: -1, step: 'Error al guardar' });
    return false;
  }
}
