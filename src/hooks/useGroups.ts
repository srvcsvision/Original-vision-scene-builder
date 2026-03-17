import { useCallback } from 'react';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';

export const useGroups = () => {
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);

  const assignToNearestWall = useCallback(() => {
    const walls = objects.filter((o) => o.type === ObjectType.PLANE && o.name.includes('Pared'));
    const glbs = objects.filter((o) => o.type === ObjectType.GLB && !o.groupId);

    if (walls.length === 0) return;

    saveSnapshot(objects);
    glbs.forEach((glb) => {
      let minDist = Infinity;
      let nearestWallId = walls[0].id;

      walls.forEach((wall) => {
        const dx = glb.transform.position[0] - wall.transform.position[0];
        const dy = glb.transform.position[1] - wall.transform.position[1];
        const dz = glb.transform.position[2] - wall.transform.position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minDist) {
          minDist = dist;
          nearestWallId = wall.id;
        }
      });

      updateObject(glb.id, { groupId: nearestWallId });
    });
  }, [objects, updateObject, saveSnapshot]);

  const centerGroupOnWall = useCallback(
    (wallId: string) => {
      const wall = objects.find((o) => o.id === wallId);
      if (!wall) return;

      const members = objects.filter(
        (o) => o.groupId === wallId && o.type === ObjectType.GLB
      );
      if (members.length === 0) return;

      saveSnapshot(objects);

      let sumX = 0, sumY = 0, sumZ = 0;
      members.forEach((m) => {
        sumX += m.transform.position[0];
        sumY += m.transform.position[1];
        sumZ += m.transform.position[2];
      });
      const cx = sumX / members.length;
      const cy = sumY / members.length;
      const cz = sumZ / members.length;

      const offsetX = wall.transform.position[0] - cx;
      const offsetY = wall.transform.position[1] - cy;
      const offsetZ = wall.transform.position[2] - cz;

      members.forEach((m) => {
        updateObject(m.id, {
          transform: {
            ...m.transform,
            position: [
              m.transform.position[0] + offsetX,
              m.transform.position[1] + offsetY,
              m.transform.position[2] + offsetZ,
            ],
          },
        });
      });
    },
    [objects, updateObject, saveSnapshot]
  );

  const scaleGroup = useCallback(
    (wallId: string, factor: number) => {
      const members = objects.filter(
        (o) => o.groupId === wallId && o.type === ObjectType.GLB
      );
      if (members.length === 0) return;

      saveSnapshot(objects);
      members.forEach((m) => {
        updateObject(m.id, {
          transform: {
            ...m.transform,
            scale: [
              m.transform.scale[0] * factor,
              m.transform.scale[1] * factor,
              m.transform.scale[2] * factor,
            ],
          },
        });
      });
    },
    [objects, updateObject, saveSnapshot]
  );

  const rotateGroup = useCallback(
    (wallId: string, axis: 'x' | 'y' | 'z') => {
      const members = objects.filter(
        (o) => o.groupId === wallId && o.type === ObjectType.GLB
      );
      if (members.length === 0) return;

      saveSnapshot(objects);
      const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;

      members.forEach((m) => {
        const newRot: [number, number, number] = [...m.transform.rotation];
        newRot[axisIdx] += Math.PI / 2;
        updateObject(m.id, {
          transform: { ...m.transform, rotation: newRot },
        });
      });
    },
    [objects, updateObject, saveSnapshot]
  );

  const mirrorGroup = useCallback(
    (wallId: string, axis: 'x' | 'y' | 'z') => {
      const members = objects.filter(
        (o) => o.groupId === wallId && o.type === ObjectType.GLB
      );
      if (members.length === 0) return;

      saveSnapshot(objects);
      const axisIdx = axis === 'x' ? 0 : axis === 'y' ? 1 : 2;

      let sum = 0;
      members.forEach((m) => { sum += m.transform.position[axisIdx]; });
      const center = sum / members.length;

      members.forEach((m) => {
        const newPos: [number, number, number] = [...m.transform.position];
        newPos[axisIdx] = 2 * center - newPos[axisIdx];
        updateObject(m.id, {
          transform: { ...m.transform, position: newPos },
        });
      });
    },
    [objects, updateObject, saveSnapshot]
  );

  return { assignToNearestWall, centerGroupOnWall, scaleGroup, rotateGroup, mirrorGroup };
};
