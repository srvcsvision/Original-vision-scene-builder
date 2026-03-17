import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();
const sphere = new THREE.Sphere();

export const useFrustumCulling = (selectedIds: string[]) => {
  const { scene, camera } = useThree();
  const lastCheck = useRef(0);

  useFrame(() => {
    const now = performance.now();
    if (now - lastCheck.current < 200) return;
    lastCheck.current = now;

    projScreenMatrix.multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(projScreenMatrix);

    scene.traverse((child) => {
      if (!(child as any).isMesh && !(child as any).isGroup) return;
      const userData = child.userData;
      if (!userData || !userData.sceneObjectId) return;

      if (selectedIds.includes(userData.sceneObjectId)) {
        child.visible = true;
        return;
      }

      sphere.center.setFromMatrixPosition(child.matrixWorld);
      sphere.radius = 2;

      child.visible = frustum.intersectsSphere(sphere);
    });
  });
};

export const FrustumCullingSystem: React.FC<{ selectedIds: string[] }> = ({ selectedIds }) => {
  useFrustumCulling(selectedIds);
  return null;
};
