import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';

declare global {
  interface Window {
    __SELECTED_OBJECT_ID__: string | null;
    __R3F_SCENE__: any;
    __R3F_CAMERA__: any;
    __R3F_GL__: any;
    __WALL_COUNT__: number;
  }
}

export const useGlobalExpose = () => {
  const { scene, camera, gl } = useThree();
  const selectedIds = useStore((s) => s.selectedIds);
  const objects = useStore((s) => s.objects);

  useEffect(() => {
    window.__R3F_SCENE__ = scene;
    window.__R3F_CAMERA__ = camera;
    window.__R3F_GL__ = gl;
  }, [scene, camera, gl]);

  useEffect(() => {
    window.__SELECTED_OBJECT_ID__ = selectedIds[0] ?? null;
  }, [selectedIds]);

  useEffect(() => {
    window.__WALL_COUNT__ = objects.filter(
      (o) => o.type === ObjectType.PLANE && o.name.toLowerCase().includes('pared')
    ).length;
  }, [objects]);
};

export const GlobalExposeSystem: React.FC = () => {
  useGlobalExpose();
  return null;
};
