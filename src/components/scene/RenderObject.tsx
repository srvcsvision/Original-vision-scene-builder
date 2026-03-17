import React, { Suspense, useRef, useEffect, useState } from 'react';
import { TransformControls, useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneObject, ObjectType, TransformMode } from '@/types';
import { ModelLoader } from './ModelLoader';
import { LightRenderer } from './LightRenderer';

interface RenderObjectProps {
  obj: SceneObject;
  isSelected: boolean;
  isPrimary: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onUpdateTransform: (id: string, pos: [number, number, number], rot: [number, number, number], sca: [number, number, number]) => void;
  onObjectClick?: (obj: SceneObject) => void;
  onAltClick?: (point: [number, number, number], clickedObjId?: string) => void;
  transformMode: TransformMode;
  setIsDragging: (val: boolean) => void;
  disableEditing: boolean;
}

const isLightType = (type: ObjectType) =>
  type === ObjectType.POINT_LIGHT ||
  type === ObjectType.SPOT_LIGHT ||
  type === ObjectType.DIRECTIONAL_LIGHT ||
  type === ObjectType.AMBIENT_LIGHT;

const getGeometry = (type: ObjectType) => {
  switch (type) {
    case ObjectType.BOX: return <boxGeometry />;
    case ObjectType.SPHERE: return <sphereGeometry args={[1, 32, 32]} />;
    case ObjectType.CYLINDER: return <cylinderGeometry args={[1, 1, 2, 32]} />;
    case ObjectType.PLANE: return <planeGeometry args={[10, 10]} />;
    default: return null;
  }
};

const PULSE_DURATION = 0.6;

export const RenderObject: React.FC<RenderObjectProps> = React.memo(({
  obj, isSelected, isPrimary, onSelect, onUpdateTransform, onObjectClick, onAltClick,
  transformMode, setIsDragging, disableEditing,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [target, setTarget] = useState<THREE.Object3D | null>(null);
  const pulseTimer = useRef(-1);
  const wasSelected = useRef(false);

  useEffect(() => {
    if (groupRef.current) setTarget(groupRef.current);
  }, []);

  useEffect(() => {
    if (isSelected && !wasSelected.current) {
      pulseTimer.current = 0;
    }
    wasSelected.current = isSelected;
  }, [isSelected]);

  useFrame((_, delta) => {
    if (pulseTimer.current < 0 || !groupRef.current) return;
    pulseTimer.current += delta;
    if (pulseTimer.current >= PULSE_DURATION) {
      groupRef.current.scale.set(...obj.transform.scale);
      pulseTimer.current = -1;
      return;
    }
    const t = pulseTimer.current / PULSE_DURATION;
    const decay = 1 - t;
    const pulse = 1 + Math.sin(t * Math.PI * 3) * 0.05 * decay;
    groupRef.current.scale.set(
      obj.transform.scale[0] * pulse,
      obj.transform.scale[1] * pulse,
      obj.transform.scale[2] * pulse,
    );
  });

  const handleTransformChange = () => {
    if (groupRef.current) {
      const { position, rotation, scale } = groupRef.current;
      onUpdateTransform(
        obj.id,
        [position.x, position.y, position.z],
        [rotation.x, rotation.y, rotation.z],
        [scale.x, scale.y, scale.z]
      );
    }
  };

  const handleClick = (e: any) => {
    e.stopPropagation();

    if (e.altKey && !disableEditing) {
      const p = e.point;
      if (p) onAltClick?.([p.x, p.y, p.z], obj.id);
      return;
    }

    if (obj.locked && !disableEditing) return;
    if (disableEditing) {
      if (obj.clickable) {
        onObjectClick?.(obj);
      }
      return;
    }
    const multiSelect = e.ctrlKey || e.metaKey;
    onSelect(obj.id, multiSelect);
  };

  const useLambert = obj.type === ObjectType.PLANE;
  const showGizmo = !disableEditing && isPrimary && target && !obj.locked;

  return (
    <>
      <group
        ref={groupRef}
        position={obj.transform.position}
        rotation={obj.transform.rotation}
        scale={obj.transform.scale}
        userData={{ sceneObjectId: obj.id }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (!obj.locked || disableEditing) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'auto';
        }}
        onClick={handleClick}
      >
        {isLightType(obj.type) && (
          <LightRenderer obj={obj} showHelper={!disableEditing} />
        )}

        {obj.type === ObjectType.GLB && obj.url && (
          <Suspense fallback={null}>
            <ModelLoader url={obj.url} />
          </Suspense>
        )}

        {obj.type === ObjectType.CAMERA && (
          <mesh>
            <coneGeometry args={[0.3, 0.6, 4]} />
            <meshBasicMaterial color="#22c55e" wireframe />
          </mesh>
        )}

        {!isLightType(obj.type) && obj.type !== ObjectType.GLB && obj.type !== ObjectType.CAMERA && (
          <mesh castShadow receiveShadow>
            {getGeometry(obj.type)}
            {obj.textureUrl ? (
              <Suspense fallback={<meshStandardMaterial color={obj.color} />}>
                <TexturedMaterial
                  url={obj.textureUrl}
                  color={obj.color}
                  roughness={obj.roughness ?? 0.5}
                  metalness={obj.metalness ?? 0.1}
                />
              </Suspense>
            ) : useLambert ? (
              <meshLambertMaterial color={obj.color} />
            ) : (
              <meshStandardMaterial
                color={obj.color}
                roughness={obj.roughness ?? 0.5}
                metalness={obj.metalness ?? 0.1}
              />
            )}
          </mesh>
        )}
      </group>

      {showGizmo && (
        <TransformControls
          object={target}
          onMouseUp={() => { handleTransformChange(); setIsDragging(false); }}
          onMouseDown={() => setIsDragging(true)}
          mode={transformMode}
        />
      )}
    </>
  );
});

RenderObject.displayName = 'RenderObject';

const TexturedMaterial: React.FC<{
  url: string;
  color: string;
  roughness: number;
  metalness: number;
}> = ({ url, color, roughness, metalness }) => {
  const texture = useTexture(url);
  return (
    <meshStandardMaterial
      map={texture}
      color={color}
      roughness={roughness}
      metalness={metalness}
    />
  );
};
