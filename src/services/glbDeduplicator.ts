import { sha256 } from '@/utils/hash';

interface GlbEntry {
  objectId: string;
  name: string;
  blob: Blob;
  hash: string;
}

export async function deduplicateGLBs(
  entries: { objectId: string; name: string; blob: Blob }[]
): Promise<Map<string, GlbEntry[]>> {
  const hashMap = new Map<string, GlbEntry[]>();

  for (const entry of entries) {
    const buffer = await entry.blob.arrayBuffer();
    const hash = await sha256(buffer);
    const withHash: GlbEntry = { ...entry, hash };

    if (hashMap.has(hash)) {
      hashMap.get(hash)!.push(withHash);
    } else {
      hashMap.set(hash, [withHash]);
    }
  }

  return hashMap;
}

export function resolveFileName(baseName: string, hash: string, existingNames: Set<string>): string {
  const clean = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!existingNames.has(clean)) {
    existingNames.add(clean);
    return clean;
  }
  const suffix = hash.substring(0, 8);
  const name = clean.replace(/\.glb$/i, '') + `_${suffix}.glb`;
  existingNames.add(name);
  return name;
}
