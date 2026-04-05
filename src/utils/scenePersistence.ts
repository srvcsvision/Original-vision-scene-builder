import type { SceneObject, UniqueGlb } from '@/types';
import { ObjectType } from '@/types';

/** JSON de Firebase puede traer `type` como string */
export function isGlbObject(obj: SceneObject): boolean {
  return obj.type === ObjectType.GLB || (obj.type as unknown as string) === 'glb';
}

/**
 * Resuelve la URL estable del GLB: Firebase (modelUrl), https, o uniqueGlbs + storageModelPath.
 * Ignora blob: — caducan al cerrar la pestaña.
 */
export function resolveGlbUrl(obj: SceneObject, uniqueGlbs: UniqueGlb[] = []): string | undefined {
  if (!isGlbObject(obj)) return undefined;
  if (obj.modelUrl) return obj.modelUrl;
  if (obj.url && !obj.url.startsWith('blob:')) return obj.url;
  if (obj.storageModelPath) {
    const hit = uniqueGlbs.find((u) => u.path === obj.storageModelPath);
    if (hit?.url) return hit.url;
  }
  // JSON guardado con bug (sin modelUrl en objetos): emparejar por nombre de .glb como en uploadGLB
  if (obj.name && uniqueGlbs.length > 0) {
    const sanitized = `${obj.name.replace(/[^a-zA-Z0-9._-]/g, '_')}.glb`;
    const byName = uniqueGlbs.find((u) => u.name === sanitized || u.name === `${obj.name}.glb`);
    if (byName?.url) return byName.url;
  }
  return undefined;
}

/** Tras cargar JSON (Firebase o archivo): reemplaza blobs por URLs de Storage */
export function normalizeLoadedSceneObjects(
  objects: SceneObject[],
  uniqueGlbs: UniqueGlb[] = []
): SceneObject[] {
  return objects.map((obj) => {
    const base: SceneObject = {
      ...obj,
      locked: obj.locked ?? false,
      visible: obj.visible ?? true,
      textureUrl: obj.textureUrl?.startsWith('blob:') ? undefined : obj.textureUrl,
    };
    if (!isGlbObject(base)) return base;

    const resolved = resolveGlbUrl(base, uniqueGlbs);
    if (!resolved) {
      if (base.url?.startsWith('blob:')) {
        console.warn(
          `[Scene] GLB "${base.name}" (${base.id}): URL blob inválida o caducada. ` +
            'Haz un guardado completo (no solo guardado rápido) para subir los .glb a Storage.'
        );
      }
      return { ...base, url: undefined };
    }
    return { ...base, url: resolved, modelUrl: base.modelUrl || resolved };
  });
}

/** Al serializar a JSON: no guardar blob: en `url` ni `textureUrl` (no son recuperables) */
export function sanitizeGlbForPersistence(obj: SceneObject): SceneObject {
  const sanitized = { ...obj };

  if (sanitized.textureUrl?.startsWith('blob:')) {
    sanitized.textureUrl = undefined;
  }

  if (!isGlbObject(obj)) return sanitized;
  const persistent =
    obj.modelUrl || (obj.url && !obj.url.startsWith('blob:') ? obj.url : undefined);
  return {
    ...sanitized,
    url: persistent,
    modelUrl: obj.modelUrl || persistent,
  };
}
