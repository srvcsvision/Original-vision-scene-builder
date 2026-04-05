import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, ScrollControls, useScroll } from '@react-three/drei';
import * as THREE from 'three';
import { ObjectType } from '@/types';
import type { SceneObject } from '@/types';
import { useStore } from '@/stores/useStore';
import {
  TOTAL_WALLS,
  NAV_FOV,
  NAV_NEAR,
  NAV_FAR,
  CAMERA_BASE_Y,
  CAMERA_Z,
  WALL_Z,
  CAMERA_Y_OFFSET_PORTRAIT,
  CAMERA_Y_OFFSET_LANDSCAPE,
  CAMERA_LOOK_DOWN_OFFSET,
} from '@/constants/defaults';

interface AdaptiveCameraProps {
  isNavMode: boolean;
  userFov: number;
}

export const AdaptiveCamera: React.FC<AdaptiveCameraProps> = ({ isNavMode, userFov }) => {
  const { size, camera } = useThree();

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (isNavMode) {
      cam.fov = NAV_FOV;
      cam.near = NAV_NEAR;
      cam.far = NAV_FAR;
    } else {
      const aspect = size.width / size.height;
      cam.fov = aspect < 1.0 ? userFov + 15 : userFov;
    }
    cam.updateProjectionMatrix();
  }, [size, camera, userFov, isNavMode]);

  const initialY = isNavMode ? CAMERA_BASE_Y + CAMERA_Y_OFFSET_LANDSCAPE : 8;
  const initialZ = isNavMode ? CAMERA_Z : 8;

  return (
    <PerspectiveCamera
      makeDefault
      position={isNavMode ? [0, initialY, initialZ] : [8, 8, 8]}
      near={isNavMode ? NAV_NEAR : 0.1}
      far={isNavMode ? NAV_FAR : 1000}
      fov={isNavMode ? NAV_FOV : userFov}
    />
  );
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

    const aspect = state.size.width / state.size.height;
    const yOffset = aspect < 1.0 ? CAMERA_Y_OFFSET_PORTRAIT : CAMERA_Y_OFFSET_LANDSCAPE;
    const camY = CAMERA_BASE_Y + yOffset;

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

      const wallX = wallObj.transform.position[0];

      const targetPos = new THREE.Vector3(wallX, camY, CAMERA_Z);
      const lookTarget = new THREE.Vector3(wallX, camY - CAMERA_LOOK_DOWN_OFFSET, WALL_Z);

      state.camera.position.lerp(targetPos, 0.15);

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
