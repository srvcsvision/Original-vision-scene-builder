import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelLoaderProps {
  url: string;
}

export const ModelLoader: React.FC<ModelLoaderProps> = React.memo(({ url }) => {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh && mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material = mesh.material.map((m) => m.clone());
        } else {
          mesh.material = mesh.material.clone();
        }
      }
    });
    return clone;
  }, [scene]);

  return <primitive object={clonedScene} />;
});

ModelLoader.displayName = 'ModelLoader';
