import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ScrollControls, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneObject } from '@/types';
import { useStore } from '@/stores/useStore';

interface AdaptiveCameraProps {
  isNavMode: boolean;
  userFov: number;
}

export const AdaptiveCamera: React.FC<AdaptiveCameraProps> = ({ isNavMode, userFov }) => {
  const { size, camera } = useThree();

  useEffect(() => {
    const aspect = size.width / size.height;
    const baseFov = aspect < 1.0 ? userFov + 15 : userFov;
    (camera as THREE.PerspectiveCamera).fov = baseFov;
    camera.updateProjectionMatrix();
  }, [size, camera, userFov]);

  return <PerspectiveCamera makeDefault position={isNavMode ? [0, 5, 0] : [8, 8, 8]} />;
};

interface CameraRigProps {
  isNavMode: boolean;
  activeIndex?: number;
  onIndexChange?: (idx: number) => void;
  focusedObject: SceneObject | null;
}

export const CameraRig: React.FC<CameraRigProps> = ({ isNavMode, activeIndex, onIndexChange, focusedObject }) => {
  const scroll = useScroll();
  const lastTargetIndex = useRef(activeIndex || 0);
  const targetQuaternion = useRef(new THREE.Quaternion());
  const { camera, invalidate } = useThree();

  useEffect(() => {
    if (isNavMode && activeIndex !== undefined && activeIndex !== lastTargetIndex.current && !focusedObject) {
      const targetScroll = activeIndex / 3;
      scroll.el.scrollTo({
        top: 0,
        left: targetScroll * (scroll.el.scrollWidth - scroll.el.clientWidth),
        behavior: 'smooth',
      });
      lastTargetIndex.current = activeIndex;
      invalidate();
    }
  }, [activeIndex, isNavMode, scroll, focusedObject, invalidate]);

  useFrame((state) => {
    if (!isNavMode) return;

    if (focusedObject) {
      const objPos = new THREE.Vector3(...focusedObject.transform.position);
      const objRot = new THREE.Euler(...focusedObject.transform.rotation);
      const offset = new THREE.Vector3(0, 0.5, 3).applyEuler(objRot);
      const zoomPos = objPos.clone().add(offset);

      state.camera.position.lerp(zoomPos, 0.1);
      const tempCamera = state.camera.clone();
      tempCamera.lookAt(objPos);
      state.camera.quaternion.slerp(tempCamera.quaternion, 0.1);
      invalidate();
    } else {
      const currentWallIndex = Math.round(scroll.offset * 3);
      if (onIndexChange && currentWallIndex !== lastTargetIndex.current) {
        lastTargetIndex.current = currentWallIndex;
        onIndexChange(currentWallIndex);
      }

      const defaultPos = new THREE.Vector3(0, 5, 0);
      state.camera.position.lerp(defaultPos, 0.1);

      const targetAngle = -currentWallIndex * (Math.PI / 2);
      const targetRotation = new THREE.Euler(0, targetAngle, 0);
      targetQuaternion.current.setFromEuler(targetRotation);
      state.camera.quaternion.slerp(targetQuaternion.current, 0.1);
      invalidate();
    }
  });

  return null;
};

interface SceneControlsProps {
  isDragging: boolean;
  selectedId: string | null;
}

export const SceneOrbitControls: React.FC<SceneControlsProps> = ({ isDragging }) => {
  const cameraPerspectiveId = useStore((s) => s.cameraPerspectiveId);
  if (cameraPerspectiveId) return null;
  return <OrbitControls makeDefault enabled={!isDragging} enableDamping />;
};

export const CameraPerspectiveRig: React.FC = () => {
  const cameraPerspectiveId = useStore((s) => s.cameraPerspectiveId);
  const objects = useStore((s) => s.objects);
  const { camera, invalidate } = useThree();

  const camObj = cameraPerspectiveId ? objects.find((o) => o.id === cameraPerspectiveId) : null;

  useFrame(() => {
    if (!camObj) return;
    const targetPos = new THREE.Vector3(...camObj.transform.position);
    camera.position.lerp(targetPos, 0.08);

    const targetEuler = new THREE.Euler(...camObj.transform.rotation);
    const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
    camera.quaternion.slerp(targetQuat, 0.08);
    invalidate();
  });

  return null;
};

interface ScrollNavProps {
  isNavMode: boolean;
  focusedObject: SceneObject | null;
  activeWallIndex?: number;
  onWallIndexChange?: (idx: number) => void;
  children: React.ReactNode;
}

export const ScrollNav: React.FC<ScrollNavProps> = ({
  isNavMode, focusedObject, activeWallIndex, onWallIndexChange, children,
}) => {
  return (
    <ScrollControls horizontal pages={4} distance={1} damping={0.1} enabled={isNavMode && !focusedObject}>
      <CameraRig
        isNavMode={isNavMode}
        activeIndex={activeWallIndex}
        onIndexChange={onWallIndexChange}
        focusedObject={focusedObject}
      />
      {children}
    </ScrollControls>
  );
};
