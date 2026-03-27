import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneObject, ObjectType } from '@/types';
import { SHADOW_MAP_SIZE } from '@/constants/defaults';
import { SpotLightFrustumHelper } from './SpotLightFrustumHelper';

interface LightRendererProps {
  obj: SceneObject;
  showHelper: boolean;
  lightsEnabled?: boolean;
}

const SpotLightWithTarget: React.FC<{
  obj: SceneObject;
  shadowProps: Record<string, any>;
}> = ({ obj, shadowProps }) => {
  const spotRef = useRef<THREE.SpotLight>(null);
  const { scene } = useThree();
  const target = obj.target ?? [0, 0, 0];

  useEffect(() => {
    if (!spotRef.current) return;
    const t = spotRef.current.target;
    if (!t.parent) scene.add(t);
    return () => { scene.remove(t); };
  }, [scene]);

  useFrame(() => {
    if (!spotRef.current) return;
    const t = spotRef.current.target;
    t.position.set(target[0], target[1], target[2]);
    t.updateMatrixWorld();
  });

  return (
    <spotLight
      ref={spotRef}
      color={obj.color}
      intensity={obj.intensity ?? 1}
      angle={obj.angle ?? 0.52}
      penumbra={obj.penumbra ?? 0.3}
      distance={obj.distance ?? 0}
      decay={obj.decay ?? 2}
      {...shadowProps}
    />
  );
};

export const LightRenderer: React.FC<LightRendererProps> = React.memo(({ obj, showHelper, lightsEnabled = true }) => {
  const shadowProps = obj.castShadow ? {
    castShadow: true,
    'shadow-mapSize-width': SHADOW_MAP_SIZE,
    'shadow-mapSize-height': SHADOW_MAP_SIZE,
  } : {};

  switch (obj.type) {
    case ObjectType.POINT_LIGHT:
      return (
        <group>
          {showHelper && (
            <mesh raycast={() => null}>
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshBasicMaterial color={obj.color} wireframe transparent opacity={lightsEnabled ? 0.6 : 0.2} />
            </mesh>
          )}
          {lightsEnabled && (
            <pointLight
              color={obj.color}
              intensity={obj.intensity ?? 1}
              distance={obj.distance ?? 0}
              decay={obj.decay ?? 2}
              {...shadowProps}
            />
          )}
        </group>
      );

    case ObjectType.SPOT_LIGHT:
      return (
        <group>
          {showHelper && (
            <SpotLightFrustumHelper
              color={obj.color}
              angle={obj.angle ?? 0.52}
              distance={obj.distance ?? 0}
              penumbra={obj.penumbra ?? 0.3}
              target={obj.target ?? [0, 0, 0]}
              intensity={obj.intensity ?? 1}
              decay={obj.decay ?? 2}
            />
          )}
          {lightsEnabled && <SpotLightWithTarget obj={obj} shadowProps={shadowProps} />}
        </group>
      );

    case ObjectType.DIRECTIONAL_LIGHT:
      return (
        <group>
          {showHelper && (
            <mesh raycast={() => null}>
              <boxGeometry args={[0.2, 0.2, 0.4]} />
              <meshBasicMaterial color={obj.color} wireframe transparent opacity={lightsEnabled ? 0.6 : 0.2} />
            </mesh>
          )}
          {lightsEnabled && (
            <directionalLight
              color={obj.color}
              intensity={obj.intensity ?? 1}
              {...shadowProps}
            />
          )}
        </group>
      );

    case ObjectType.AMBIENT_LIGHT:
      return lightsEnabled ? <ambientLight color={obj.color} intensity={obj.intensity ?? 1} /> : null;

    default:
      return null;
  }
});

LightRenderer.displayName = 'LightRenderer';
