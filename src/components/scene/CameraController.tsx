import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ScrollControls, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { ObjectType } from '@/types';
import type { SceneObject } from '@/types';
import { useStore } from '@/stores/useStore';
import { TOTAL_WALLS } from '@/constants/defaults';

const VIEW_DISTANCE = 5;

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
  const { camera, invalidate } = useThree();
  const objects = useStore((s) => s.objects);

  const maxIndex = TOTAL_WALLS - 1;

  const walls = useMemo(() => {
    return objects
      .filter((o) => o.type === ObjectType.PLANE && o.name.startsWith('Pared'))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  }, [objects]);

  useEffect(() => {
    if (isNavMode && activeIndex !== undefined && activeIndex !== lastTargetIndex.current && !focusedObject) {
      const targetScroll = maxIndex > 0 ? activeIndex / maxIndex : 0;
      scroll.el.scrollTo({
        top: 0,
        left: targetScroll * (scroll.el.scrollWidth - scroll.el.clientWidth),
        behavior: 'smooth',
      });
      lastTargetIndex.current = activeIndex;
      invalidate();
    }
  }, [activeIndex, isNavMode, scroll, focusedObject, invalidate, maxIndex]);

  useFrame((state) => {
    if (!isNavMode) return;

    if (focusedObject) {
      const objPos = new THREE.Vector3(...focusedObject.transform.position);
      const objRot = new THREE.Euler(...focusedObject.transform.rotation);
      const offset = new THREE.Vector3(0, 0.3, 2).applyEuler(objRot);
      const zoomPos = objPos.clone().add(offset);

      state.camera.position.lerp(zoomPos, 0.15);
      const tempCamera = state.camera.clone();
      tempCamera.lookAt(objPos);
      state.camera.quaternion.slerp(tempCamera.quaternion, 0.15);
      invalidate();
    } else {
      const currentWallIndex = Math.round(scroll.offset * maxIndex);
      if (onIndexChange && currentWallIndex !== lastTargetIndex.current) {
        lastTargetIndex.current = currentWallIndex;
        onIndexChange(currentWallIndex);
      }

      const wallObj = walls[Math.min(currentWallIndex, walls.length - 1)];
      if (!wallObj) return;

      const wallCenter = new THREE.Vector3(...wallObj.transform.position);
      const wallRot = new THREE.Euler(...wallObj.transform.rotation);
      const normal = new THREE.Vector3(0, 0, 1).applyEuler(wallRot);

      const targetPos = wallCenter.clone().add(normal.clone().multiplyScalar(VIEW_DISTANCE));
      targetPos.y = wallCenter.y;

      state.camera.position.lerp(targetPos, 0.15);

      const lookTarget = wallCenter.clone();
      const tempCam = state.camera.clone();
      tempCam.lookAt(lookTarget);
      state.camera.quaternion.slerp(tempCam.quaternion, 0.15);
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
    <ScrollControls horizontal pages={TOTAL_WALLS} distance={1} damping={0.1} enabled={isNavMode && !focusedObject}>
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
