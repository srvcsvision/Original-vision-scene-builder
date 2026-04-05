export enum WallMaterialType {
  GRID = 'grid',
  STUCCO = 'stucco',
}

export enum ObjectType {
  BOX = 'box',
  SPHERE = 'sphere',
  CYLINDER = 'cylinder',
  PLANE = 'plane',
  POINT_LIGHT = 'point_light',
  SPOT_LIGHT = 'spot_light',
  DIRECTIONAL_LIGHT = 'directional_light',
  AMBIENT_LIGHT = 'ambient_light',
  GLB = 'glb',
  CAMERA = 'camera',
}

export interface Transform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface SceneObject {
  id: string;
  name: string;
  type: ObjectType;
  transform: Transform;
  color: string;
  visible: boolean;
  locked: boolean;

  // Material
  roughness?: number;
  metalness?: number;
  textureUrl?: string;
  wallMaterialType?: WallMaterialType;
  emissive?: boolean;
  emissiveIntensity?: number;

  // Light properties
  intensity?: number;
  target?: [number, number, number];
  angle?: number;
  penumbra?: number;
  distance?: number;
  decay?: number;
  castShadow?: boolean;
  useFixedTarget?: boolean;

  // GLB
  url?: string;
  modelUrl?: string;
  storageModelPath?: string;

  // Plane dimensions
  width?: number;
  height?: number;

  // Metadata
  title?: string;
  description?: string;
  videoUrl?: string;
  /** @deprecated Use presenterIds instead */
  presenter?: string | null;
  presenterIds?: string[];

  // Interaction
  clickable?: boolean;
  modalTitle?: string;
  modalDescription?: string;

  // Wall assignment
  wallLabel?: string;
  wallPosition?: number;

  // Grouping
  groupId?: string;

  // Pivot offset (used to keep visuals in place after recentering)
  meshOffset?: [number, number, number];
}

export interface Presenter {
  id: string;
  name: string;
  imageUrl: string;
}

export interface UniqueGlb {
  path: string;
  url: string;
  name: string;
}

export interface SceneConfig {
  version: number;
  backgroundColor: string;
  showGrid: boolean;
  lights: SceneObject[];
  objects: SceneObject[];
  uniqueGlbs: UniqueGlb[];
  presenters?: Presenter[];
}

export interface ProjectMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  storagePath?: string;
  storageUrl?: string;
}

export type TransformMode = 'translate' | 'rotate' | 'scale';
export type AppView = 'projects' | 'editor';
