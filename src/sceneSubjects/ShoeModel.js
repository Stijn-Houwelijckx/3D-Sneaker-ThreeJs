import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { gsap } from "gsap"; // Import GSAP for animations
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader"; // Import EXRLoader for EXR textures

export class ShoeModel {
  constructor(
    domElement,
    scene,
    modelPath,
    camera,
    scale = 10,
    position = { x: 0, y: 0, z: 0 }
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
    this.selectedPart = null; // Track the selected part for coloring

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

    this.highlightMaterial = new THREE.MeshStandardMaterial({
      // Add the environment texture to the material
      envMap: this.environmentTexture, // Set the environment map
      color: "#6AFF48", // Highlight
      // wireframe: true, // Optional: make it wireframe for better highlighting
      metalness: 1, // Adjust as needed
      roughness: 0.3, // Adjust as needed
    });

    this.materials = {
      brown_leather_1k: {
        name: "Brown Leather",
        diffuse: "/textures/brown_leather_1k/brown_leather_diffuse_1k.jpg",
        ao: "/textures/brown_leather_1k/brown_leather_ao_1k.jpg",
        normal: "/textures/brown_leather_1k/brown_leather_nor_gl_1k.exr",
        roughness: "/textures/brown_leather_1k/brown_leather_rough_1k.exr",
      },
      denim_fabric_1k: {
        name: "Denim Fabric",
        diffuse: "/textures/denim_fabric_1k/denim_fabric_diffuse_1k.jpg",
        ao: "/textures/denim_fabric_1k/denim_fabric_ao_1k.jpg",
        normal: "/textures/denim_fabric_1k/denim_fabric_nor_gl_1k.exr",
        roughness: "/textures/denim_fabric_1k/denim_fabric_rough_1k.exr",
      },
    };

    this.load(); // Load the model when the class is instantiated
    this.addShoeRotationInteraction(); // Add interaction logic to rotate the shoe
    this.addRaycastingInteraction(); // Add raycasting for hover interactions

    this.setupColorPicker(); // Setup the color picker and save button
  }

  createTextCanvas(
    text,
    font = "20px Arial",
    color = "black",
    bgColor = "white"
  ) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    canvas.width = 512;
    canvas.height = 512;

    // Flip the canvas vertically
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    // Fill background color
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rotate the canvas 90 degrees clockwise
    ctx.translate(canvas.width / 2, canvas.height / 2); // Move origin to center
    ctx.rotate((90 * Math.PI) / 180); // Rotate by 90 degrees
    ctx.translate(-canvas.width / 2, -canvas.height / 2); // Move origin back

    // Draw the text
    ctx.font = "bold " + font;
    ctx.fillStyle = color;
    // ctx.textAlign = "center";
    ctx.textBaseline = "center";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas;
  }

  createTextTexture(text) {
    const canvas = this.createTextCanvas(text);
    const texture = new THREE.CanvasTexture(canvas);

    // Set initial offset values
    texture.repeat.set(2, 2);
    texture.offset.set(-1.25, -0.3);

    // Store the texture for later updates
    this.textTexture = texture;

    return texture;
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
            // Set default material name to "none"
            if (child.material) {
              child.material.name = "none"; // Default material name
            }

            child.userData.originalMaterial = child.material; // Store the original material

            child.castShadow = true; // Enable shadow casting
            child.receiveShadow = true; // Enable shadow receiving

            if (child.name === "Inside") {
              // Add a custom texture to the part
              const texture = this.createTextTexture("SWEAR");
              child.material = new THREE.MeshStandardMaterial({
                map: texture,
              });

              // Set the material name for configuration retrieval
              child.material.name = "Text texture";

              // Store the original material for later use
              child.userData.originalMaterial = child.material;
            }

            // Assign a default name if not present
            if (!child.name) {
              child.name = "Unnamed Part"; // You can set more descriptive names if known
            }
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
      if (this.isOrderFinishOpen()) {
        return; // Skip raycasting when orderFinish is open
      }

      // Normalize mouse position to [-1, 1]
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update the raycaster
      this.update();
    });

    // Click event to select part and show color picker
    this.domElement.addEventListener("click", (event) => {
      if (this.isOrderFinishOpen()) {
        return; // Skip raycasting when orderFinish is open
      }

      if (this.intersectedObject) {
        this.selectedPart = this.intersectedObject;
        this.showColorPicker();
      }
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

        // Set cursor style to pointer if an object is intersected
        this.domElement.style.cursor = "pointer";

        // Highlight the intersected part
        if (this.intersectedObject !== intersectedObject) {
          if (this.intersectedObject) {
            this.removeHighlight(this.intersectedObject);
          }

          this.intersectedObject = intersectedObject;
          this.addHighlight(this.intersectedObject);
        }
      } else {
        // Reset cursor style if no object is intersected
        this.domElement.style.cursor = "auto";
        // Remove highlight if no object is intersected
        if (this.intersectedObject) {
          this.removeHighlight(this.intersectedObject);
          this.intersectedObject = null;
        }
      }
    }
  }

  // Show the color picker with the name of the selected part
  showColorPicker() {
    const colorPickerContainer = document.querySelector(
      ".color-picker-container"
    );
    const partNameElement = colorPickerContainer.querySelector(".shoe-part");
    const shoeText = document.querySelector(".shoe-text");
    const inputText = document.querySelector(".text-input");

    // Update the part name dynamically
    if (this.selectedPart && this.selectedPart.name) {
      partNameElement.textContent = this.selectedPart.name; // Set the name of the selected part
    } else {
      partNameElement.textContent = "Unknown Part"; // Fallback if no name is set
    }

    // First, animate the shoe model to the new position using GSAP
    gsap.to(this.model.position, {
      x: -2, // Set the new position for the shoe
      y: 0, // Keep the same y-position
      z: 0, // Keep the same z-position
      duration: 1, // Animation duration in seconds
      ease: "power2.out", // Easing for smooth movement
    });

    // Use GSAP to animate the container's width and height
    gsap.to(colorPickerContainer, {
      duration: 0.5, // Animation duration in seconds
      right: "0vw", // Set the width to 33.33%
      ease: "power2.out", // Easing function for smooth animation
    });

    // Finally, make the container visible after the animation starts
    colorPickerContainer.style.display = "flex"; // Show the container

    if (this.selectedPart.name === "Inside") {
      shoeText.style.display = "block";
      inputText.style.display = "block";
    } else {
      shoeText.style.display = "none";
      inputText.style.display = "none";
    }
  }

  // Apply text to the selected part
  applyTextToSelectedPart(text) {
    if (this.selectedPart) {
      const texture = this.createTextTexture(text);
      this.selectedPart.material = new THREE.MeshStandardMaterial({
        map: texture,
      });

      // Assign the material name for configuration retrieval
      this.selectedPart.material.name = "Text texture";

      this.selectedPart.userData.originalMaterial = this.selectedPart.material;
    }
  }

  // Apply the selected color to the part
  applyColorToSelectedPart(color) {
    if (this.selectedPart) {
      this.selectedPart.material.color.set(color);
    }
  }

  loadMaterial(materialName) {
    if (!this.selectedPart) {
      console.error("No part selected.");
      return;
    }

    if (materialName === "none") {
      // Reset to a default material
      // this.applyColorToSelectedPart("#ffffff");
      this.selectedPart.material = new THREE.MeshStandardMaterial({
        color: "#ffffff",
      });
      this.selectedPart.userData.originalMaterial = this.selectedPart.material;
      this.selectedPart.material.name = "Plain Material"; // Set a default name
      console.log(
        "Textures removed, material reset to plain MeshStandardMaterial."
      );
      return;
    }

    const materialConfig = this.materials[materialName];
    if (!materialConfig) {
      console.error("Invalid material name:", materialName);
      return;
    }

    const loader = new THREE.TextureLoader();
    const exrLoader = new EXRLoader();

    const textures = {
      map: loader.load(materialConfig.diffuse),
      aoMap: loader.load(materialConfig.ao),
      normalMap: exrLoader.load(materialConfig.normal),
      roughnessMap: exrLoader.load(materialConfig.roughness),
    };

    this.selectedPart.material = new THREE.MeshStandardMaterial({
      ...textures,
      metalness: 0.2,
      roughness: 1.0,
    });

    // Assign the material name for configuration retrieval
    this.selectedPart.material.name = materialConfig.name;

    this.selectedPart.userData.originalMaterial = this.selectedPart.material;
  }

  // Set up the color picker and save button
  setupColorPicker() {
    const colorPickerContainer = document.querySelector(
      ".color-picker-container"
    );
    const colorGrid = document.querySelector(".color-grid");
    const closeButton = document.querySelector(".fa-close"); // Select the close button

    // Add event listener for the text input
    const textInput = document.querySelector(".text-input");
    textInput.addEventListener("input", (event) => {
      const text = event.target.value;
      this.applyTextToSelectedPart(text);
    });

    // Add event listener for the color grid
    colorGrid.addEventListener("click", (event) => {
      const target = event.target;

      // console.log(target);

      // Check if the clicked element is a color div
      if (target.classList.contains("color")) {
        const selectedColor = target.getAttribute("data-color"); // Get the color from data-color

        // console.log(selectedColor);
        this.applyColorToSelectedPart(`#${selectedColor}`); // Apply color with '#' prefix
        // this.hideColorPicker(); // Optionally hide the color picker
      }
    });

    const materialGrid = document.querySelector(".material-grid");

    materialGrid.addEventListener("click", (event) => {
      const target = event.target;

      // Check if the clicked element is a material div
      if (target.classList.contains("material")) {
        const selectedMaterial = target.getAttribute("data-material"); // Get material name
        this.loadMaterial(selectedMaterial); // Apply the selected material
      }
    });

    // Event listener for the close button
    closeButton.addEventListener("click", () => {
      this.hideColorPicker();
    });

    // Add event listener for clicking outside the color picker
    document.addEventListener("click", (event) => {
      // Check if the click is outside the color picker container and its children

      // Check if the color picker is visible (i.e., right is not -25vw)
      const isColorPickerVisible = colorPickerContainer.style.right === "0vw";
      if (
        isColorPickerVisible &&
        !this.intersectedObject &&
        !colorPickerContainer.contains(event.target) &&
        !event.target.closest(".color-picker-container") &&
        !event.target.closest(".color-grid") &&
        !event.target.closest(".material-grid")
      ) {
        this.hideColorPicker(); // Hide the color picker
      }
    });
  }

  // Hide the color picker with a closing animation
  hideColorPicker() {
    const colorPickerContainer = document.querySelector(
      ".color-picker-container"
    );

    // Animate the container's width and height to 0 to close it
    gsap.to(colorPickerContainer, {
      duration: 0.5, // Animation duration in seconds
      right: "-25vw", // Set the width to 0% to collapse it
      ease: "power2.in", // Easing function for smooth closing
      onComplete: () => {
        // After the animation is complete, hide the container
        colorPickerContainer.style.display = "none"; // Hide the container
      },
    });

    // First, animate the shoe model to the new position using GSAP
    gsap.to(this.model.position, {
      x: 0, // Set the new position for the shoe
      y: 0, // Keep the same y-position
      z: 0, // Keep the same z-position
      duration: 1, // Animation duration in seconds
      ease: "sine", // Easing for smooth movement
    });
  }

  // Add highlight material to the object
  addHighlight(object) {
    object.material = this.highlightMaterial;
  }

  // Remove highlight material and restore original
  removeHighlight(object) {
    object.material = object.userData.originalMaterial || object.material;
  }

  getShoeConfiguration() {
    const configuration = {};

    if (this.model) {
      this.model.traverse((child) => {
        if (child.isMesh) {
          configuration[child.name] = {
            color: child.material.color.getHexString(),
            material: child.material.name || "none", // Retrieve material name
          };
        }
      });
    }

    return configuration;
  }

  isOrderFinishOpen() {
    const orderFinish = document.querySelector(".order-finish");
    return orderFinish && orderFinish.style.right === "0vw";
  }
}
