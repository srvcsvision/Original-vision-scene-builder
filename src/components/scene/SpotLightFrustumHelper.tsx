import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CIRCLE_SEGMENTS = 48;
const RADIAL_LINES = 12;
const VISIBILITY_THRESHOLD = 0.05;
const MIN_VISUAL_DIST = 0.5;
const MAX_VISUAL_DIST = 50;

const _targetVec = new THREE.Vector3();
const _worldPos = new THREE.Vector3();
const _dirVec = new THREE.Vector3();
const _parentQuat = new THREE.Quaternion();
const _invQuat = new THREE.Quaternion();
const _rotQuat = new THREE.Quaternion();
const _defaultDir = new THREE.Vector3();

interface SpotLightFrustumHelperProps {
  color: string;
  angle: number;
  distance: number;
  penumbra: number;
  target: [number, number, number];
  intensity: number;
  decay: number;
}

function buildCircle(radius: number, depth: number, segments: number): Float32Array {
  const positions = new Float32Array(segments * 6);
  for (let i = 0; i < segments; i++) {
    const theta1 = (i / segments) * Math.PI * 2;
    const theta2 = ((i + 1) / segments) * Math.PI * 2;
    const idx = i * 6;
    positions[idx] = radius * Math.cos(theta1);
    positions[idx + 1] = radius * Math.sin(theta1);
    positions[idx + 2] = depth;
    positions[idx + 3] = radius * Math.cos(theta2);
    positions[idx + 4] = radius * Math.sin(theta2);
    positions[idx + 5] = depth;
  }
  return positions;
}

function computeEffectiveDistance(intensity: number, decay: number, distance: number): number {
  const attenuationDist = decay > 0
    ? Math.pow(intensity / VISIBILITY_THRESHOLD, 1 / decay)
    : MAX_VISUAL_DIST;
  const clamped = Math.max(MIN_VISUAL_DIST, Math.min(MAX_VISUAL_DIST, attenuationDist));
  return distance > 0 ? Math.min(distance, clamped) : clamped;
}

export const SpotLightFrustumHelper: React.FC<SpotLightFrustumHelperProps> = React.memo(({
  color,
  angle,
  distance,
  penumbra,
  target,
  intensity,
  decay,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  const effectiveDistance = useMemo(
    () => computeEffectiveDistance(intensity, decay, distance),
    [intensity, decay, distance],
  );

  const coneRadius = effectiveDistance * Math.tan(angle);

  const outerGeometry = useMemo(() => {
    const circleVerts = buildCircle(coneRadius, -effectiveDistance, CIRCLE_SEGMENTS);
    const radialVerts = new Float32Array(RADIAL_LINES * 6);
    for (let i = 0; i < RADIAL_LINES; i++) {
      const theta = (i / RADIAL_LINES) * Math.PI * 2;
      const idx = i * 6;
      radialVerts[idx] = 0;
      radialVerts[idx + 1] = 0;
      radialVerts[idx + 2] = 0;
      radialVerts[idx + 3] = coneRadius * Math.cos(theta);
      radialVerts[idx + 4] = coneRadius * Math.sin(theta);
      radialVerts[idx + 5] = -effectiveDistance;
    }
    const combined = new Float32Array(circleVerts.length + radialVerts.length);
    combined.set(circleVerts, 0);
    combined.set(radialVerts, circleVerts.length);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(combined, 3));
    return geo;
  }, [coneRadius, effectiveDistance]);

  const penumbraGeometry = useMemo(() => {
    if (penumbra <= 0) return null;
    const innerAngle = angle * (1 - penumbra);
    const penumbraRadius = effectiveDistance * Math.tan(innerAngle);
    const verts = buildCircle(penumbraRadius, -effectiveDistance, CIRCLE_SEGMENTS);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return geo;
  }, [angle, penumbra, effectiveDistance]);

  useEffect(() => {
    return () => {
      outerGeometry.dispose();
      penumbraGeometry?.dispose();
    };
  }, [outerGeometry, penumbraGeometry]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group?.parent) return;

    group.parent.getWorldPosition(_worldPos);
    _targetVec.set(target[0], target[1], target[2]);
    _dirVec.subVectors(_targetVec, _worldPos);
    if (_dirVec.lengthSq() < 1e-8) return;
    _dirVec.normalize();

    group.parent.getWorldQuaternion(_parentQuat);
    _invQuat.copy(_parentQuat).invert();
    _dirVec.applyQuaternion(_invQuat);

    _defaultDir.set(0, 0, -1);
    _rotQuat.setFromUnitVectors(_defaultDir, _dirVec);
    group.quaternion.copy(_rotQuat);
  });

  return (
    <group ref={groupRef}>
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>

      <lineSegments geometry={outerGeometry} raycast={() => null}>
        <lineBasicMaterial color={color} transparent opacity={0.5} />
      </lineSegments>

      {penumbraGeometry && (
        <lineSegments geometry={penumbraGeometry} raycast={() => null}>
          <lineBasicMaterial color={color} transparent opacity={0.25} />
        </lineSegments>
      )}
    </group>
  );
});

SpotLightFrustumHelper.displayName = 'SpotLightFrustumHelper';
