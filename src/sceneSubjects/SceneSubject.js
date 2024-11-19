// sceneSubjects/SceneSubject.js

import * as THREE from "three";

export class SceneSubject {
  constructor(scene) {
    // Create a cube geometry with a specified size
    const size = 2;
    const geometry = new THREE.BoxGeometry(size, size, size); // Corrected to BoxGeometry
    const material = new THREE.MeshStandardMaterial({
      color: "red",
      flatShading: true,
    });

    // Create a mesh with the geometry and material
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(0, 0, -20); // Position the mesh in the scene

    scene.add(this.mesh); // Add the mesh to the scene
  }

  // Update the rotation of the cube based on time
  update(time) {
    // Rotate the mesh around its axes
    this.mesh.rotation.x = time * 0.5; // Rotate on the X axis
    this.mesh.rotation.y = time * 0.5; // Rotate on the Y axis
    // Optionally, rotate on the Z axis as well
    // this.mesh.rotation.z = time * 0.5;
  }
}
