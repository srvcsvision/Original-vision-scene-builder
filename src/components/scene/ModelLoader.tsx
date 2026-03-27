import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface ModelLoaderProps {
  url: string;
  stripTextures?: boolean;
  castShadow?: boolean;
}

const FALLBACK_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xaaaaaa,
  roughness: 0.6,
  metalness: 0.1,
});

export const ModelLoader: React.FC<ModelLoaderProps> = React.memo(({ url, stripTextures, castShadow = true }) => {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child: THREE.Object3D) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = castShadow;
        mesh.receiveShadow = true;
        if (mesh.material) {
          if (stripTextures) {
            mesh.material = FALLBACK_MATERIAL.clone();
          } else if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => m.clone());
          } else {
            mesh.material = mesh.material.clone();
          }
        }
      }
    });
    return clone;
  }, [scene, stripTextures, castShadow]);

  return <primitive object={clonedScene} />;
});

ModelLoader.displayName = 'ModelLoader';
