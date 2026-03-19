import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneObject } from '@/types';
import { ObjectType } from '@/types';
import { resolveGlbUrl } from '@/utils/scenePersistence';

interface InstancedModelsProps {
  objects: SceneObject[];
  uniqueGlbs?: { path: string; url: string; name: string }[];
}

/**
 * Groups GLB objects by their URL and renders instances
 * for models that appear more than once, reducing draw calls.
 */
export const InstancedModels: React.FC<InstancedModelsProps> = React.memo(({ objects, uniqueGlbs = [] }) => {
  const grouped = useMemo(() => {
    const map = new Map<string, SceneObject[]>();
    objects.forEach((obj) => {
      if (obj.type !== ObjectType.GLB) return;
      const src = resolveGlbUrl(obj, uniqueGlbs);
      if (!src) return;
      const group = map.get(src) || [];
      group.push(obj);
      map.set(src, group);
    });
    return map;
  }, [objects, uniqueGlbs]);

  return (
    <>
      {Array.from(grouped.entries()).map(([url, instances]) => (
        <InstancedGroup key={url} url={url} instances={instances} />
      ))}
    </>
  );
});

InstancedModels.displayName = 'InstancedModels';

const InstancedGroup: React.FC<{ url: string; instances: SceneObject[] }> = ({ url, instances }) => {
  const { scene } = useGLTF(url);

  return (
    <>
      {instances.map((obj) => {
        const cloned = scene.clone();
        return (
          <group
            key={obj.id}
            position={obj.transform.position}
            rotation={obj.transform.rotation}
            scale={obj.transform.scale}
          >
            <primitive object={cloned} />
          </group>
        );
      })}
    </>
  );
};
