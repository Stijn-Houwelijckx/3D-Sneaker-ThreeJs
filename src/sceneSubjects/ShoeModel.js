import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class ShoeModel {
  constructor(scene, modelPath, scale = 10, position = { x: 0, y: 0, z: 0 }) {
    this.scene = scene;
    this.modelPath = modelPath;
    this.scale = scale;
    this.position = position;
    this.model = null; // This will hold the loaded model

    this.load(); // Load the model when the class is instantiated
  }

  load() {
    const loader = new GLTFLoader(); // Create a new loader instance

    loader.load(
      this.modelPath, // Path to the model
      (gltf) => {
        this.model = gltf.scene; // Get the 3D model from the loaded GLTF data
        this.scene.add(this.model); // Add the model to the scene

        // Adjust the model orientation
        // this.model.rotation.x = Math.PI / 2; // Rotate model to face the right direction (adjust as needed)
        this.model.rotation.y = -Math.PI / 2; // Reset Y-axis if needed
        // this.model.rotation.z = Math.PI / 2; // Reset Z-axis if needed

        // Apply scale and position
        this.model.scale.set(this.scale, this.scale, this.scale);
        this.model.position.set(
          this.position.x,
          this.position.y,
          this.position.z
        );
      },
      undefined, // Optional onProgress callback
      (error) => {
        console.error("Error loading model:", error); // Error handling
      }
    );
  }

  // Update method to allow for any animations or transformations in the scene
  update(time) {
    if (this.model) {
      //   // Example: Rotate the shoe model slowly
      //   this.model.rotation.y += 0.005; // Rotate the model on its Y axis
    }
  }
}
