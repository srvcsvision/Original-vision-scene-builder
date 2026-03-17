import { useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType, SceneObject } from '@/types';
import {
  DEFAULT_WALL_COLORS,
  DEFAULT_FLOOR_COLOR,
  DEFAULT_LIGHT_COLOR,
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
      const halfW = w / 2;
      const halfH = h / 2;
      const halfD = d / 2;

      saveSnapshot(objects);

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
        width: w,
        height: d,
      };

      const wallNames = ['Pared Frontal', 'Pared Derecha', 'Pared Trasera', 'Pared Izquierda'];
      const walls: SceneObject[] = wallNames.map((name, i) => {
        const wallId = crypto.randomUUID();
        const angle = (i * Math.PI) / 2;
        const dist = i % 2 === 0 ? halfD : halfW;
        return {
          id: wallId,
          name,
          type: ObjectType.PLANE,
          color: DEFAULT_WALL_COLORS[i],
          transform: {
            position: [
              Math.sin(angle) * dist,
              halfH,
              -Math.cos(angle) * dist,
            ] as [number, number, number],
            rotation: [0, -angle, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
          },
          visible: true,
          locked: false,
          roughness: 0.5,
          metalness: 0.1,
          width: i % 2 === 0 ? w : d,
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
