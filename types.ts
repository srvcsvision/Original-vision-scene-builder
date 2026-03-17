
export enum ObjectType {
  BOX = 'box',
  SPHERE = 'sphere',
  CYLINDER = 'cylinder',
  PLANE = 'plane',
  POINT_LIGHT = 'point_light',
  DIRECTIONAL_LIGHT = 'directional_light',
  AMBIENT_LIGHT = 'ambient_light',
  GLB = 'glb'
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
  intensity?: number;
  roughness?: number;
  metalness?: number;
  visible: boolean;
  clickable?: boolean;
  modalTitle?: string;
  modalDescription?: string;
  url?: string;
  groupId?: string;
}

export interface SceneConfig {
  version: string;
  objects: SceneObject[];
  backgroundColor: string;
  showGrid: boolean;
}
