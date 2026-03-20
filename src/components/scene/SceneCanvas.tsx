import React, { Suspense, useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/stores/useStore';
import { RenderObject } from './RenderObject';
import { AdaptiveCamera, ScrollNav, SceneOrbitControls, CameraPerspectiveRig } from './CameraController';
import { SceneGrid } from './SceneGrid';
import { FrustumCullingSystem } from '@/hooks/useFrustumCulling';
import { GlobalExposeSystem } from '@/hooks/useGlobalExpose';
import { ObjectType } from '@/types';
import type { SceneObject, Transform } from '@/types';

const isLightType = (type: ObjectType) =>
  type === ObjectType.POINT_LIGHT ||
  type === ObjectType.SPOT_LIGHT ||
  type === ObjectType.DIRECTIONAL_LIGHT ||
  type === ObjectType.AMBIENT_LIGHT;

const FloorCatcher: React.FC<{ onFloorClick: (e: ThreeEvent<PointerEvent>) => void }> = ({ onFloorClick }) => (
  <mesh
    rotation={[-Math.PI / 2, 0, 0]}
    position={[0, -0.01, 0]}
    onClick={onFloorClick}
  >
    <planeGeometry args={[500, 500]} />
    <meshBasicMaterial visible={false} />
  </mesh>
);

export const SceneCanvas: React.FC = () => {
  const objects = useStore((s) => s.objects);
  const selectedIds = useStore((s) => s.selectedIds);
  const selectSingle = useStore((s) => s.selectSingle);
  const toggleSelection = useStore((s) => s.toggleSelection);
  const showGrid = useStore((s) => s.showGrid);
  const backgroundColor = useStore((s) => s.backgroundColor);
  const transformMode = useStore((s) => s.transformMode);
  const isNavMode = useStore((s) => s.isNavMode);
  const isPreview = useStore((s) => s.isPreview);
  const activeWallIndex = useStore((s) => s.activeWallIndex);
  const setActiveWallIndex = useStore((s) => s.setActiveWallIndex);
  const fov = useStore((s) => s.fov);
  const updateObject = useStore((s) => s.updateObject);
  const saveSnapshot = useStore((s) => s.saveSnapshot);
  const setActiveModalObjectId = useStore((s) => s.setActiveModalObjectId);
  const setSelectedId = useStore((s) => s.setSelectedId);

  const [isDragging, setIsDragging] = useState(false);
  const fKeyDown = useRef(false);
  const initialTransformsRef = useRef<Map<string, Transform>>(new Map());

  const captureInitialTransforms = useRef(() => {});
  captureInitialTransforms.current = () => {
    const map = new Map<string, Transform>();
    for (const id of selectedIds) {
      const obj = objects.find((o) => o.id === id);
      if (obj) {
        map.set(id, {
          position: [...obj.transform.position] as [number, number, number],
          rotation: [...obj.transform.rotation] as [number, number, number],
          scale: [...obj.transform.scale] as [number, number, number],
        });
      }
    }
    initialTransformsRef.current = map;
  };

  const handleSetIsDragging = useCallback(
    (val: boolean) => {
      if (val) captureInitialTransforms.current();
      setIsDragging(val);
    },
    [setIsDragging]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') fKeyDown.current = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyF') fKeyDown.current = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const effectiveNavMode = isPreview || isNavMode;
  const primarySelectedId = selectedIds[0] ?? null;

  const focusedObject = useMemo(() => {
    return effectiveNavMode ? objects.find((o) => o.id === primarySelectedId) || null : null;
  }, [effectiveNavMode, primarySelectedId, objects]);

  const getSelectedLight = useCallback(() => {
    if (!primarySelectedId) return null;
    const obj = objects.find((o) => o.id === primarySelectedId);
    if (!obj || !isLightType(obj.type)) return null;
    return obj;
  }, [primarySelectedId, objects]);

  const handleUpdateTransform = useCallback(
    (id: string, pos: [number, number, number], rot: [number, number, number], sca: [number, number, number]) => {
      saveSnapshot(objects);
      updateObject(id, { transform: { position: pos, rotation: rot, scale: sca } });

      if (selectedIds.length <= 1) return;

      const initialPrimary = initialTransformsRef.current.get(id);
      if (!initialPrimary) return;

      const oldQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(initialPrimary.rotation[0], initialPrimary.rotation[1], initialPrimary.rotation[2])
      );
      const newQuat = new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rot[0], rot[1], rot[2])
      );
      const deltaQuat = newQuat.clone().multiply(oldQuat.clone().invert());

      const pivotOld = new THREE.Vector3(...initialPrimary.position);
      const pivotNew = new THREE.Vector3(...pos);

      for (const otherId of selectedIds) {
        if (otherId === id) continue;
        const initial = initialTransformsRef.current.get(otherId);
        if (!initial) continue;
        const otherObj = objects.find((o) => o.id === otherId);

        const relPos = new THREE.Vector3(...initial.position).sub(pivotOld);
        relPos.applyQuaternion(deltaQuat);
        const finalPos = pivotNew.clone().add(relPos);

        const objQuat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(initial.rotation[0], initial.rotation[1], initial.rotation[2])
        );
        const finalQuat = deltaQuat.clone().multiply(objQuat);
        const finalEuler = new THREE.Euler().setFromQuaternion(finalQuat);

        updateObject(otherId, {
          transform: {
            position: [finalPos.x, finalPos.y, finalPos.z],
            rotation: [finalEuler.x, finalEuler.y, finalEuler.z],
            scale: [...initial.scale] as [number, number, number],
          },
        });
      }
    },
    [objects, selectedIds, saveSnapshot, updateObject]
  );

  const handleObjectClick = useCallback(
    (obj: SceneObject) => {
      if (isPreview) {
        setSelectedId(obj.id);
        setTimeout(() => setActiveModalObjectId(obj.id), 400);
      }
    },
    [isPreview, setSelectedId, setActiveModalObjectId]
  );

  const selectMultiple = useStore((s) => s.selectMultiple);

  const handleSelect = useCallback(
    (id: string, multiSelect: boolean, groupSelect: boolean) => {
      if (groupSelect) {
        const obj = objects.find((o) => o.id === id);
        if (obj?.groupId) {
          const memberIds = objects.filter((o) => o.groupId === obj.groupId).map((o) => o.id);
          selectMultiple(memberIds);
        } else {
          selectSingle(id);
        }
        return;
      }
      if (multiSelect) {
        toggleSelection(id);
      } else {
        selectSingle(id);
      }
    },
    [objects, selectSingle, toggleSelection, selectMultiple]
  );

  const handleAltClick = useCallback(
    (point: [number, number, number], clickedObjId?: string) => {
      const light = getSelectedLight();
      if (!light) return;

      if (fKeyDown.current && clickedObjId) {
        const targetObj = objects.find((o) => o.id === clickedObjId);
        if (!targetObj) return;
        saveSnapshot(objects);
        updateObject(light.id, {
          target: [...targetObj.transform.position],
        });
      } else {
        saveSnapshot(objects);
        updateObject(light.id, {
          transform: {
            ...light.transform,
            position: point,
          },
        });
      }
    },
    [getSelectedLight, objects, saveSnapshot, updateObject]
  );

  const handleFloorClick = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (!e.altKey) return;
      e.stopPropagation();
      const p = e.point;
      handleAltClick([p.x, p.y, p.z]);
    },
    [handleAltClick]
  );

  const visibleObjects = useMemo(() => objects.filter((o) => o.visible), [objects]);

  return (
    <div className="w-full h-full relative group">
      <Canvas
        shadows={false}
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'low-power', alpha: false }}
        frameloop="always"
        onPointerMissed={() => {
          // Deselection only via "Listo" button or Enter key (plan-2.md spec)
        }}
      >
        <color attach="background" args={[backgroundColor]} />
        <AdaptiveCamera isNavMode={effectiveNavMode} userFov={fov} />

        <Suspense fallback={null}>
          <Environment preset="night" blur={1} />
          <ambientLight intensity={0.2} />

          <ScrollNav
            isNavMode={effectiveNavMode}
            focusedObject={focusedObject}
            activeWallIndex={activeWallIndex}
            onWallIndexChange={setActiveWallIndex}
          >
            <group>
              {visibleObjects.map((obj) => (
                <RenderObject
                  key={obj.id}
                  obj={obj}
                  isSelected={selectedIds.includes(obj.id)}
                  isPrimary={primarySelectedId === obj.id}
                  onSelect={handleSelect}
                  onUpdateTransform={handleUpdateTransform}
                  onObjectClick={handleObjectClick}
                  onAltClick={handleAltClick}
                  transformMode={transformMode}
                  setIsDragging={handleSetIsDragging}
                  disableEditing={effectiveNavMode}
                />
              ))}
            </group>
          </ScrollNav>

          {!effectiveNavMode && <FloorCatcher onFloorClick={handleFloorClick} />}
          {showGrid && !isPreview && <SceneGrid backgroundColor={backgroundColor} />}
          {!effectiveNavMode && (
            <SceneOrbitControls isDragging={isDragging} selectedId={primarySelectedId} />
          )}
          <CameraPerspectiveRig />
          <FrustumCullingSystem selectedIds={selectedIds} />
          <GlobalExposeSystem />
        </Suspense>
      </Canvas>
    </div>
  );
};
