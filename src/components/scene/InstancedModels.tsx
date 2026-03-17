import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneObject } from '@/types';
import { ObjectType } from '@/types';

interface InstancedModelsProps {
  objects: SceneObject[];
}

/**
 * Groups GLB objects by their URL and renders instances
 * for models that appear more than once, reducing draw calls.
 */
export const InstancedModels: React.FC<InstancedModelsProps> = React.memo(({ objects }) => {
  const grouped = useMemo(() => {
    const map = new Map<string, SceneObject[]>();
    objects.forEach((obj) => {
      if (obj.type === ObjectType.GLB && obj.url) {
        const group = map.get(obj.url) || [];
        group.push(obj);
        map.set(obj.url, group);
      }
    });
    return map;
  }, [objects]);

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
