import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class ShoeModel {
  constructor(
    domElement,
    scene,
    modelPath,
    camera,
    scale = 10,
    position = { x: -2, y: 0, z: 0 }
  ) {
    this.scene = scene;
    this.modelPath = modelPath;
    this.camera = camera;
    this.scale = scale;
    this.position = position;
    this.domElement = domElement;
    this.model = null; // This will hold the loaded model

    // Raycasting setup
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.intersectedObject = null; // Track the intersected object
    this.highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff0000, // Red color to highlight
      //   wireframe: true, // Optional: make it wireframe for better highlighting
    });

    this.load(); // Load the model when the class is instantiated
    this.addShoeRotationInteraction(); // Add interaction logic to rotate the shoe
    this.addRaycastingInteraction(); // Add raycasting for hover interactions
  }

  load() {
    const loader = new GLTFLoader(); // Create a new loader instance

    loader.load(
      this.modelPath, // Path to the model
      (gltf) => {
        this.model = gltf.scene; // Get the 3D model from the loaded GLTF data
        this.scene.add(this.model); // Add the model to the scene

        // Iterate over all parts of the model and store the original material
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.userData.originalMaterial = child.material; // Store the original material
          }
        });

        // Adjust the model orientation
        this.model.rotation.y = Math.PI / 2.6;

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
      this.rotationVelocity.x = deltaMove.y * 0.0005;
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

  // Add raycasting for hover interaction
  addRaycastingInteraction() {
    this.domElement.addEventListener("mousemove", (event) => {
      // Normalize mouse position to [-1, 1]
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the raycaster
      this.update();
    });
  }

  // Update method to check for hover interactions and update the model
  update(time) {
    if (this.model && this.shoeRotationUpdate) {
      this.shoeRotationUpdate(time);
    }

    // Perform raycasting
    if (this.model && this.camera) {
      // Cast the ray from the camera through the mouse position
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Find intersections with the shoe model
      const intersects = this.raycaster.intersectObject(this.model, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        // Highlight the intersected part
        if (this.intersectedObject !== intersectedObject) {
          if (this.intersectedObject) {
            this.removeHighlight(this.intersectedObject);
          }

          this.intersectedObject = intersectedObject;
          this.addHighlight(this.intersectedObject);
        }
      } else {
        // Remove highlight if no object is intersected
        if (this.intersectedObject) {
          this.removeHighlight(this.intersectedObject);
          this.intersectedObject = null;
        }
      }
    }
  }

  // Add highlight material to the object
  addHighlight(object) {
    object.material = this.highlightMaterial;
  }

  // Remove highlight material and restore original
  removeHighlight(object) {
    object.material = object.userData.originalMaterial || object.material;
  }
}
