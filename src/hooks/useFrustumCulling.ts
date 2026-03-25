import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const frustum = new THREE.Frustum();
const projScreenMatrix = new THREE.Matrix4();
const sphere = new THREE.Sphere();
const box = new THREE.Box3();

function computeWorldBoundingSphere(obj: THREE.Object3D, target: THREE.Sphere): void {
  box.makeEmpty();
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
        const meshBox = mesh.geometry.boundingBox!.clone();
        meshBox.applyMatrix4(mesh.matrixWorld);
        box.union(meshBox);
      }
    }
  });

  if (box.isEmpty()) {
    target.center.setFromMatrixPosition(obj.matrixWorld);
    target.radius = 2;
  } else {
    box.getBoundingSphere(target);
  }
}

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

      computeWorldBoundingSphere(child, sphere);

      child.visible = frustum.intersectsSphere(sphere);
    });
  });
};

export const FrustumCullingSystem: React.FC<{ selectedIds: string[] }> = ({ selectedIds }) => {
  useFrustumCulling(selectedIds);
  return null;
};
