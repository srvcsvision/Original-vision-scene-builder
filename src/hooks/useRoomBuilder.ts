import { useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType, SceneObject } from '@/types';
import {
  DEFAULT_WALL_COLORS,
  DEFAULT_FLOOR_COLOR,
  DEFAULT_LIGHT_COLOR,
  TOTAL_WALLS,
  WALL_LABELS,
} from '@/constants/defaults';

interface RoomConfig {
  width?: number;
  height?: number;
  depth?: number;
}

export const useRoomBuilder = () => {
  const saveSnapshot = useStore((s) => s.saveSnapshot);
  const setObjects = useStore((s) => s.setObjects);
  const objects = useStore((s) => s.objects);
  const setIsNavMode = useStore((s) => s.setIsNavMode);
  const setIsSidebarOpen = useStore((s) => s.setIsSidebarOpen);

  const createRoom = useCallback(
    (config?: RoomConfig) => {
      const w = config?.width ?? 10;
      const h = config?.height ?? 10;
      const d = config?.depth ?? 10;
      const halfH = h / 2;

      saveSnapshot(objects);

      const totalWidth = TOTAL_WALLS * w;
      const floorId = crypto.randomUUID();
      const floor: SceneObject = {
        id: floorId,
        name: 'Suelo',
        type: ObjectType.PLANE,
        transform: { position: [0, 0, 0], rotation: [-Math.PI / 2, 0, 0], scale: [1, 1, 1] },
        color: DEFAULT_FLOOR_COLOR,
        visible: true,
        locked: false,
        roughness: 0.5,
        metalness: 0.1,
        width: totalWidth,
        height: d,
      };

      const walls: SceneObject[] = WALL_LABELS.map((name, i) => {
        const wallId = crypto.randomUUID();
        const x = (i - (TOTAL_WALLS - 1) / 2) * w;
        return {
          id: wallId,
          name,
          type: ObjectType.PLANE,
          color: DEFAULT_WALL_COLORS[i % DEFAULT_WALL_COLORS.length],
          transform: {
            position: [x, halfH, 0] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
          },
          visible: true,
          locked: false,
          roughness: 0.5,
          metalness: 0.1,
          width: w,
          height: h,
          groupId: undefined,
        };
      });

      walls.forEach((wall) => {
        wall.groupId = wall.id;
      });

      const light: SceneObject = {
        id: crypto.randomUUID(),
        name: 'Luz Ambiente',
        type: ObjectType.POINT_LIGHT,
        transform: { position: [0, h * 0.7, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
        color: DEFAULT_LIGHT_COLOR,
        intensity: 1.5,
        visible: true,
        locked: false,
      };

      setObjects([floor, ...walls, light]);
      setIsNavMode(false);
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
    },
    [objects, saveSnapshot, setObjects, setIsNavMode, setIsSidebarOpen]
  );

  return { createRoom };
};
