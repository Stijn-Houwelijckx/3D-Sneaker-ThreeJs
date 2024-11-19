import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class ShoeModel {
  constructor(
    domElement,
    scene,
    modelPath,
    scale = 10,
    position = { x: -2, y: 0, z: 0 }
  ) {
    this.scene = scene;
    this.modelPath = modelPath;
    this.scale = scale;
    this.position = position;
    this.domElement = domElement;
    this.model = null; // This will hold the loaded model

    this.load(); // Load the model when the class is instantiated
    this.addShoeRotationInteraction(); // Add interaction logic to rotate the shoe
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
        this.model.rotation.y = Math.PI / 2.6; // Reset Y-axis if needed
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

  // Add interaction to rotate the shoe model
  addShoeRotationInteraction() {
    if (!this.domElement) {
      console.error("No domElement provided for interaction.");
      return;
    }

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0 }; // Track rotation velocity
    this.dampeningFactor = 0.99; // Damping for smooth stopping

    // Mouse down
    this.domElement.addEventListener("mousedown", (event) => {
      isDragging = true;
      previousMousePosition = { x: event.clientX, y: event.clientY };
      this.rotationVelocity = { x: 0, y: 0 }; // Reset rotation velocity on new drag
    });

    // Mouse move
    this.domElement.addEventListener("mousemove", (event) => {
      if (!isDragging) return;

      const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y,
      };

      // Apply rotation velocity based on mouse movement
      this.rotationVelocity.x = deltaMove.y * 0.0005; // Adjust speed multiplier as needed
      this.rotationVelocity.y = deltaMove.x * 0.0005;

      previousMousePosition = { x: event.clientX, y: event.clientY };
    });

    // Mouse up
    this.domElement.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // Optional: Mouse leave (in case the user drags outside the window)
    this.domElement.addEventListener("mouseleave", () => {
      isDragging = false;
    });

    // Update rotation in the update loop
    this.shoeRotationUpdate = (elapsedTime) => {
      if (this.model) {
        this.model.rotation.y += this.rotationVelocity.y; // Horizontal rotation
        this.model.rotation.x += this.rotationVelocity.x; // Vertical rotation

        // Apply dampening
        this.rotationVelocity.x *= this.dampeningFactor;
        this.rotationVelocity.y *= this.dampeningFactor;
      }
    };
  }

  // Update method to allow for any animations or transformations in the scene
  update(time) {
    if (this.model && this.shoeRotationUpdate) {
      this.shoeRotationUpdate(time);
    }
  }
}
