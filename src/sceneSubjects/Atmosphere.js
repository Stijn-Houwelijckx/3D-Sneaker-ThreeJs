// sceneSubjects/Atmosphere.js

import * as THREE from "three";

export class Atmosphere {
  constructor(scene) {
    this.scene = scene;

    this.textureLoader = new THREE.TextureLoader();
    this.Texture360 = this.textureLoader.load(
      "360images/darkSpace_upscaled.jpeg"
    );

    // Load the environment texture (6 images for the cube sides)
    this.cubeTextureLoader = new THREE.CubeTextureLoader();
    this.environmentTexture = this.cubeTextureLoader.load([
      "/environements/Standard-Cube-Map/px.png", // right
      "/environements/Standard-Cube-Map/nx.png", // left
      "/environements/Standard-Cube-Map/ny.png", // bottom
      "/environements/Standard-Cube-Map/py.png", // top
      "/environements/Standard-Cube-Map/pz.png", // front
      "/environements/Standard-Cube-Map/nz.png", // back
    ]);

    this.environmentTexture.flipY = true;

    // Create the box geometry (large cube around the scene)
    this.geometry = new THREE.SphereGeometry(10); // Large cube to cover the scene

    // Create a material with the environment texture
    this.material = new THREE.MeshStandardMaterial({
      map: this.Texture360, // Use the environment map for the material
      side: THREE.DoubleSide, // Render the inside of the cube
      roughness: 0.5, // Adjust as needed
      metalness: 0.0, // Adjust as needed
    });

    // Create the cube mesh and add it to the scene
    this.sphere = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.sphere); // Add the cube to the scene
  }

  // Optional: Update method for animations (e.g., rotating the atmosphere)
  update() {
    // You can rotate the cube slightly if desired
    // this.cube.rotation.y += 0.001;  // Uncomment to rotate the atmosphere
  }
}
