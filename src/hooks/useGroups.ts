import { useCallback } from 'react';
import * as THREE from 'three';
import { useStore } from '@/stores/useStore';
import { ObjectType } from '@/types';
import type { SceneObject } from '@/types';

export const useGroups = () => {
  const objects = useStore((s) => s.objects);
  const updateObject = useStore((s) => s.updateObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);

  const assignAllToNearestWall = useCallback(() => {
    const walls = objects.filter((o) => o.type === ObjectType.PLANE && o.name.includes('Pared'));
    const glbs = objects.filter((o) => o.type === ObjectType.GLB);

    if (walls.length === 0 || glbs.length === 0) return;

    saveSnapshot(objects);

    const locked = glbs.filter((o) => o.locked);
    locked.forEach((obj) => {
      updateObject(obj.id, { wallLabel: undefined, wallPosition: undefined });
    });

    const unlocked = glbs.filter((o) => !o.locked);
    const wallBuckets = new Map<string, { wall: SceneObject; items: { obj: SceneObject; dist: number }[] }>();
    walls.forEach((wall) => wallBuckets.set(wall.id, { wall, items: [] }));

    unlocked.forEach((glb) => {
      let minDist = Infinity;
      let nearestId = walls[0].id;
      walls.forEach((wall) => {
        const dx = glb.transform.position[0] - wall.transform.position[0];
        const dy = glb.transform.position[1] - wall.transform.position[1];
        const dz = glb.transform.position[2] - wall.transform.position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < minDist) { minDist = dist; nearestId = wall.id; }
      });
      wallBuckets.get(nearestId)!.items.push({ obj: glb, dist: minDist });
    });

    wallBuckets.forEach(({ wall, items }) => {
      const wallAngleY = wall.transform.rotation[1];
      const wallNormalX = Math.abs(Math.sin(wallAngleY));
      const wallNormalZ = Math.abs(Math.cos(wallAngleY));
      const sortByX = wallNormalZ > wallNormalX;

      items.sort((a, b) => {
        const axis = sortByX
          ? a.obj.transform.position[0] - b.obj.transform.position[0]
          : a.obj.transform.position[2] - b.obj.transform.position[2];
        return axis !== 0 ? axis : a.dist - b.dist;
      });

      items.forEach(({ obj }, idx) => {
        updateObject(obj.id, {
          wallLabel: wall.name,
          wallPosition: idx + 1,
        });
      });
    });
  }, [objects, updateObject, saveSnapshot]);

  const centerGroupOnWall = useCallback(
    (wallId: string) => {
      const wall = objects.find((o) => o.id === wallId);
      if (!wall) return;

      const members = objects.filter((o) => o.groupId === wallId);
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
      const members = objects.filter((o) => o.groupId === wallId);
      if (members.length === 0) return;

      saveSnapshot(objects);

      let cx = 0, cy = 0, cz = 0;
      members.forEach((m) => {
        cx += m.transform.position[0];
        cy += m.transform.position[1];
        cz += m.transform.position[2];
      });
      cx /= members.length;
      cy /= members.length;
      cz /= members.length;

      members.forEach((m) => {
        updateObject(m.id, {
          transform: {
            ...m.transform,
            position: [
              cx + (m.transform.position[0] - cx) * factor,
              cy + (m.transform.position[1] - cy) * factor,
              cz + (m.transform.position[2] - cz) * factor,
            ],
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
      const members = objects.filter((o) => o.groupId === wallId);
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
      const members = objects.filter((o) => o.groupId === wallId);
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

  const recenterGroupPivot = useCallback(
    (groupId: string) => {
      const members = objects.filter((o) => o.groupId === groupId);
      if (members.length === 0) return;

      const scene = (window as any).__R3F_SCENE__ as THREE.Scene | undefined;
      if (!scene) return;

      saveSnapshot(objects);

      for (const member of members) {
        let threeObj: THREE.Object3D | null = null;
        scene.traverse((child: THREE.Object3D) => {
          if (child.userData?.sceneObjectId === member.id) {
            threeObj = child;
          }
        });

        if (!threeObj) continue;

        const box = new THREE.Box3().setFromObject(threeObj);
        if (box.isEmpty()) continue;

        const bbCenter = new THREE.Vector3();
        box.getCenter(bbCenter);

        const pos = member.transform.position;
        const deltaWorld = new THREE.Vector3(
          bbCenter.x - pos[0],
          bbCenter.y - pos[1],
          bbCenter.z - pos[2],
        );

        if (deltaWorld.lengthSq() < 0.000001) continue;

        const invQuat = new THREE.Quaternion()
          .setFromEuler(new THREE.Euler(...member.transform.rotation))
          .invert();
        const deltaLocal = deltaWorld.clone().applyQuaternion(invQuat);

        const [sx, sy, sz] = member.transform.scale;
        deltaLocal.x /= sx || 1;
        deltaLocal.y /= sy || 1;
        deltaLocal.z /= sz || 1;

        const cur = member.meshOffset || [0, 0, 0];

        updateObject(member.id, {
          transform: {
            ...member.transform,
            position: [bbCenter.x, bbCenter.y, bbCenter.z],
          },
          meshOffset: [
            cur[0] - deltaLocal.x,
            cur[1] - deltaLocal.y,
            cur[2] - deltaLocal.z,
          ] as [number, number, number],
        });
      }
    },
    [objects, updateObject, saveSnapshot],
  );

  const autoCompleteWallObjects = useCallback(
    (videoUrl: string) => {
      const targets = objects.filter(
        (o) => o.type === ObjectType.GLB && o.wallLabel && o.wallPosition != null,
      );
      if (targets.length === 0) return 0;

      saveSnapshot(objects);

      targets.forEach((obj) => {
        updateObject(obj.id, {
          videoUrl,
          clickable: true,
          modalTitle: obj.modalTitle || obj.name,
          modalDescription:
            obj.modalDescription ||
            `${obj.wallLabel} — Posición ${obj.wallPosition}`,
        });
      });

      return targets.length;
    },
    [objects, updateObject, saveSnapshot],
  );

  return { assignAllToNearestWall, autoCompleteWallObjects, centerGroupOnWall, scaleGroup, rotateGroup, mirrorGroup, recenterGroupPivot };
};
