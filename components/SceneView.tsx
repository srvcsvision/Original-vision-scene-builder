
// @ts-nocheck
import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useLoader, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  TransformControls, 
  PerspectiveCamera, 
  Environment, 
  ScrollControls,
  useScroll
} from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { SceneObject, ObjectType } from '../types';
import * as THREE from 'three';

interface SceneViewProps {
  objects: SceneObject[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  showGrid: boolean;
  backgroundColor: string;
  transformMode: 'translate' | 'rotate' | 'scale';
  setTransformMode: (mode: 'translate' | 'rotate' | 'scale') => void;
  isNavMode: boolean;
  activeWallIndex?: number;
  setActiveWallIndex?: (idx: number) => void;
  onUpdateTransform: (id: string, pos: [number, number, number], rot: [number, number, number], sca: [number, number, number]) => void;
  onObjectClick?: (obj: SceneObject) => void;
  fov?: number;
}

const ModelLoader: React.FC<{ url: string }> = ({ url }) => {
  const gltf = useLoader(GLTFLoader, url);
  const clonedScene = useMemo(() => {
    const clone = gltf.scene.clone();
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
      }
    });
    return clone;
  }, [gltf]);
  return <primitive object={clonedScene} />;
};

const AdaptiveCamera: React.FC<{ isNavMode: boolean, userFov: number }> = ({ isNavMode, userFov }) => {
  const { size, camera } = useThree();
  
  useEffect(() => {
    // Solo aplicamos el FOV automático si no estamos en modo nav o si queremos un base
    const aspect = size.width / size.height;
    const baseFov = aspect < 1.0 ? userFov + 15 : userFov;
    
    // Suavizamos el cambio de FOV si es necesario (o lo aplicamos directo para reactividad)
    camera.fov = baseFov;
    camera.updateProjectionMatrix();
  }, [size, camera, userFov]);

  return <PerspectiveCamera makeDefault position={isNavMode ? [0, 5, 0] : [8, 8, 8]} />;
};

const CameraRig: React.FC<{ 
  isNavMode: boolean, 
  activeIndex?: number, 
  onIndexChange?: (idx: number) => void,
  focusedObject: SceneObject | null 
}> = ({ isNavMode, activeIndex, onIndexChange, focusedObject }) => {
  const scroll = useScroll();
  const lastTargetIndex = useRef(activeIndex || 0);
  const targetQuaternion = useRef(new THREE.Quaternion());
  const { camera } = useThree();
  
  useEffect(() => {
    if (isNavMode && activeIndex !== undefined && activeIndex !== lastTargetIndex.current && !focusedObject) {
      const targetScroll = activeIndex / 3;
      scroll.el.scrollTo({
        top: 0,
        left: targetScroll * (scroll.el.scrollWidth - scroll.el.clientWidth),
        behavior: 'smooth'
      });
      lastTargetIndex.current = activeIndex;
    }
  }, [activeIndex, isNavMode, scroll, focusedObject]);

  useFrame((state) => {
    if (!isNavMode) return;

    if (focusedObject) {
      // ZOOM IN TRANSITION
      const objPos = new THREE.Vector3(...focusedObject.transform.position);
      const objRot = new THREE.Euler(...focusedObject.transform.rotation);
      
      // Calculamos una posición de cámara relativa al objeto
      const offset = new THREE.Vector3(0, 0.5, 3).applyEuler(objRot);
      const zoomPos = objPos.clone().add(offset);
      
      state.camera.position.lerp(zoomPos, 0.1);
      
      // Usamos una matriz temporal para interpolar la rotación suavemente
      const tempCamera = state.camera.clone();
      tempCamera.lookAt(objPos);
      state.camera.quaternion.slerp(tempCamera.quaternion, 0.1);
    } else {
      // NORMAL SCROLL NAVIGATION (RETURN TO WALL)
      const currentWallIndex = Math.round(scroll.offset * 3);
      if (onIndexChange && currentWallIndex !== lastTargetIndex.current) {
        lastTargetIndex.current = currentWallIndex;
        onIndexChange(currentWallIndex);
      }
      
      // Posición central por defecto
      const defaultPos = new THREE.Vector3(0, 5, 0);
      state.camera.position.lerp(defaultPos, 0.1);
      
      // Rotación basada en el muro actual (0, 90, 180, 270 grados)
      const targetAngle = -currentWallIndex * (Math.PI / 2);
      const targetRotation = new THREE.Euler(0, targetAngle, 0);
      targetQuaternion.current.setFromEuler(targetRotation);
      
      state.camera.quaternion.slerp(targetQuaternion.current, 0.1);
    }
  });
  return null;
};

const RenderObject: React.FC<{ 
  obj: SceneObject; 
  isSelected: boolean; 
  onSelect: (id: string) => void;
  onUpdateTransform: (id: string, pos: [number, number, number], rot: [number, number, number], sca: [number, number, number]) => void;
  onObjectClick?: (obj: SceneObject) => void;
  transformMode: 'translate' | 'rotate' | 'scale';
  setIsDragging: (val: boolean) => void;
  disableEditing: boolean;
}> = ({ obj, isSelected, onSelect, onUpdateTransform, onObjectClick, transformMode, setIsDragging, disableEditing }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [target, setTarget] = useState<THREE.Object3D | null>(null);
  const [lastClicked, setLastClicked] = useState(0);
  const { clock } = useThree();

  useEffect(() => {
    if (groupRef.current) setTarget(groupRef.current);
  }, [groupRef]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const timeSinceClick = state.clock.elapsedTime - lastClicked;
    const duration = 0.6;
    if (timeSinceClick < duration) {
      const pulse = 1 + Math.sin(timeSinceClick * Math.PI / duration) * 0.1;
      groupRef.current.scale.set(obj.transform.scale[0] * pulse, obj.transform.scale[1] * pulse, obj.transform.scale[2] * pulse);
    } else {
      groupRef.current.scale.set(...obj.transform.scale);
    }
  });

  const getGeometry = () => {
    switch (obj.type) {
      case ObjectType.BOX: return <boxGeometry />;
      case ObjectType.SPHERE: return <sphereGeometry args={[1, 32, 32]} />;
      case ObjectType.CYLINDER: return <cylinderGeometry args={[1, 1, 2, 32]} />;
      case ObjectType.PLANE: return <planeGeometry args={[10, 10]} />;
      default: return null;
    }
  };

  const handleTransformChange = () => {
    if (groupRef.current) {
      const { position, rotation, scale } = groupRef.current;
      onUpdateTransform(obj.id, [position.x, position.y, position.z], [rotation.x, rotation.y, rotation.z], [scale.x, scale.y, scale.z]);
    }
  };

  return (
    <>
      <group
        ref={groupRef}
        position={obj.transform.position}
        rotation={obj.transform.rotation}
        scale={obj.transform.scale}
        onPointerOver={(e) => {
          if (disableEditing && obj.clickable) { e.stopPropagation(); document.body.style.cursor = 'pointer'; }
        }}
        onPointerOut={() => { if (disableEditing) document.body.style.cursor = 'auto'; }}
        onClick={(e) => { 
          if (disableEditing) {
            if (obj.clickable) { 
              e.stopPropagation(); 
              setLastClicked(clock.elapsedTime); 
              if (onObjectClick) onObjectClick(obj);
            }
            return;
          }
          e.stopPropagation(); 
          onSelect(obj.id); 
        }}
      >
        {obj.type === ObjectType.POINT_LIGHT && (
          <>
            <mesh visible={!disableEditing}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color={obj.color} wireframe />
            </mesh>
            <pointLight color={obj.color} intensity={obj.intensity ?? 1} castShadow />
          </>
        )}
        {obj.type === ObjectType.DIRECTIONAL_LIGHT && (
          <directionalLight color={obj.color} intensity={obj.intensity ?? 1} position={[5, 10, 5]} castShadow />
        )}
        {obj.type === ObjectType.GLB && obj.url && (
          <Suspense fallback={null}>
            <ModelLoader url={obj.url} />
          </Suspense>
        )}
        {!obj.type.includes('light') && obj.type !== ObjectType.GLB && (
          <mesh castShadow receiveShadow>
            {getGeometry()}
            <meshStandardMaterial color={obj.color} roughness={obj.roughness ?? 0.5} metalness={obj.metalness ?? 0.1} />
          </mesh>
        )}
      </group>
      {!disableEditing && isSelected && target && (
        <TransformControls object={target} onMouseUp={handleTransformChange} onDraggingChanged={(e) => setIsDragging(e.value)} mode={transformMode} />
      )}
    </>
  );
};

export const SceneView: React.FC<SceneViewProps> = ({ 
  objects, 
  selectedId, 
  setSelectedId, 
  showGrid, 
  backgroundColor,
  transformMode,
  setTransformMode,
  isNavMode,
  activeWallIndex,
  setActiveWallIndex,
  onUpdateTransform,
  onObjectClick,
  fov = 60
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const focusedObject = useMemo(() => {
    return isNavMode ? objects.find(o => o.id === selectedId) || null : null;
  }, [isNavMode, selectedId, objects]);

  // Lógica para determinar si el fondo es oscuro y ajustar la grilla
  const gridColors = useMemo(() => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Fórmula de luminancia (Y = 0.299R + 0.587G + 0.114B)
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const isDark = brightness < 128;

    return {
      section: isDark ? "#444444" : "#bbbbbb",
      cell: isDark ? "#2a2a2a" : "#dddddd"
    };
  }, [backgroundColor]);

  return (
    <div className="w-full h-full relative group">
      <Canvas shadows dpr={[1, 2]} onClick={() => setSelectedId(null)}>
        <color attach="background" args={[backgroundColor]} />
        <AdaptiveCamera isNavMode={isNavMode} userFov={fov} />
        
        <Suspense fallback={null}>
          <Environment preset="night" />
          <ambientLight intensity={0.2} />
          
          <ScrollControls horizontal pages={4} distance={1} damping={0.1} enabled={isNavMode && !focusedObject}>
            <CameraRig isNavMode={isNavMode} activeIndex={activeWallIndex} onIndexChange={setActiveWallIndex} focusedObject={focusedObject} />
            <group>
              {objects.filter(o => o.visible).map(obj => (
                <RenderObject 
                  key={obj.id} 
                  obj={obj} 
                  isSelected={selectedId === obj.id}
                  onSelect={setSelectedId}
                  onUpdateTransform={onUpdateTransform}
                  onObjectClick={onObjectClick}
                  transformMode={transformMode}
                  setIsDragging={setIsDragging}
                  disableEditing={isNavMode}
                />
              ))}
            </group>
          </ScrollControls>
          {showGrid && (
            <Grid 
              infiniteGrid 
              fadeDistance={40} 
              fadeStrength={5} 
              sectionColor={gridColors.section} 
              cellColor={gridColors.cell} 
            />
          )}
          {!isNavMode && <OrbitControls makeDefault enabled={!isDragging && !selectedId} enableDamping />}
        </Suspense>
      </Canvas>
    </div>
  );
};
