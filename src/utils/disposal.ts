import * as THREE from 'three';

export function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.geometry?.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(disposeMaterial);
      } else if (mesh.material) {
        disposeMaterial(mesh.material);
      }
    }
  });
}

function disposeMaterial(material: THREE.Material) {
  material.dispose();
  const mat = material as THREE.MeshStandardMaterial;
  mat.map?.dispose();
  mat.normalMap?.dispose();
  mat.roughnessMap?.dispose();
  mat.metalnessMap?.dispose();
  mat.emissiveMap?.dispose();
  mat.aoMap?.dispose();
}
