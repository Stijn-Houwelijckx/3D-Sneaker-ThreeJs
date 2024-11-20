import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // Import OrbitControls
import * as dat from "dat.gui"; // Importing dat.GUI for UI controls

import { Atmosphere } from "./sceneSubjects/Atmosphere"; // Importing Atmosphere
import { GeneralLights } from "./sceneSubjects/GeneralLights"; // Importing GeneralLights
import { ShoeModel } from "./sceneSubjects/ShoeModel"; // Importing ShoeModel

export class SceneManager {
  constructor(canvas) {
    // Initialize clock
    this.clock = new THREE.Clock();

    // Initialize screen dimensions from window size
    this.screenDimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    // Build the scene, renderer, camera, and scene subjects
    this.scene = this.buildScene();
    this.renderer = this.buildRenderer(canvas, this.screenDimensions);
    this.camera = this.buildCamera(this.screenDimensions);
    this.sceneSubjects = this.createSceneSubjects(this.scene);

    // Create the atmosphere (skybox with environment texture)
    this.atmosphere = new Atmosphere(this.scene); // Add atmosphere to the scene

    // Bind the window resize event
    window.addEventListener("resize", this.onWindowResize.bind(this));

    // Add OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enabled = false;
    // this.controls.enableDamping = true; // Smooth movement
    // this.controls.dampingFactor = 0.25; // Damping factor for smoothness
    // this.controls.screenSpacePanning = false; // Disable screen space panning
    // this.controls.enableZoom = false; // Disable zooming
    // this.controls.enablePan = false; // Disable panning

    // // Restrict horizontal rotation (azimuth angle)
    // this.controls.minAzimuthAngle = -Math.PI / 4; // Limit to -45 degrees
    // this.controls.maxAzimuthAngle = Math.PI / 4; // Limit to +45 degrees

    // // Restrict vertical rotation (polar angle)
    // this.controls.minPolarAngle = Math.PI / 4; // Limit to +45 degrees above horizon
    // this.controls.maxPolarAngle = Math.PI / 2; // Limit to +90 degrees (no looking below)

    // this.controls.target.set(0, 0, 0); // Target the center of the scene
    // this.controls.update(); // Initial update

    // Set an initial camera position for better view

    this.camera.position.set(0, 1.8, 3); // Adjust this as needed

    // Set up the GUI for controls
    this.gui = new dat.GUI();
    this.createGUI(); // Create the GUI with controls
  }

  // Builds the 3D scene
  buildScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("black"); // Set background color of the scene
    return scene;
  }

  // Builds the WebGLRenderer and sets up for canvas
  buildRenderer(canvas, { width, height }) {
    const renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    const DPR = window.devicePixelRatio || 1;
    renderer.setPixelRatio(DPR);
    renderer.setSize(width, height); // Set initial size of the renderer
    renderer.gammaInput = true;
    renderer.gammaOutput = true;

    // Apply tone mapping for realistic lighting
    renderer.toneMapping = THREE.ACESFilmicToneMapping; // Tone mapping algorithm
    renderer.toneMappingExposure = 0.5; // Exposure level (adjust as needed)

    return renderer;
  }

  // Builds the camera for perspective rendering
  buildCamera({ width, height }) {
    const aspectRatio = width / height;
    const fieldOfView = 75;
    const nearPlane = 0.01;
    const farPlane = 1000;
    const camera = new THREE.PerspectiveCamera(
      fieldOfView,
      aspectRatio,
      nearPlane,
      farPlane
    );
    return camera;
  }

  // Create scene subjects (objects, lights, etc.)
  createSceneSubjects(scene) {
    return [
      new GeneralLights(scene), // Add lights to the scene
      new ShoeModel(
        this.renderer.domElement,
        scene,
        "/models/Shoe_compressed/Shoe_compressed.gltf",
        this.camera
      ), // Load and add the shoe model as a scene subject
    ];
  }

  // Create GUI for controlling the lights and helper visibility
  createGUI() {
    // Get the current state of the light from the first scene subject (GeneralLights)
    const light = this.sceneSubjects[0].light; // Access the light in GeneralLights
    const lightPosition = light.position; // Get current position of the light

    // Create the object to hold GUI controls
    const lightControls = {
      intensity: light.intensity, // Set initial intensity from the light object
      color: light.color.getHex(), // Set initial color from the light object
      positionX: lightPosition.x, // Set initial X position
      positionY: lightPosition.y, // Set initial Y position
      positionZ: lightPosition.z, // Set initial Z position
      helperVisible: this.sceneSubjects[0].helper.visible, // Set initial helper visibility
    };

    // Add light intensity control
    this.gui.add(lightControls, "intensity", 0, 100).onChange((value) => {
      this.sceneSubjects[0].setIntensity(value); // Update intensity in the scene
    });

    // Add light color control
    this.gui.addColor(lightControls, "color").onChange((value) => {
      this.sceneSubjects[0].setColor(value); // Update light color in the scene
    });

    // Add position controls for the light
    this.gui.add(lightControls, "positionX", -10, 10).onChange((value) => {
      this.sceneSubjects[0].setPosition(
        value,
        lightControls.positionY,
        lightControls.positionZ
      ); // Update light position
    });
    this.gui.add(lightControls, "positionY", -10, 10).onChange((value) => {
      this.sceneSubjects[0].setPosition(
        lightControls.positionX,
        value,
        lightControls.positionZ
      ); // Update light position
    });
    this.gui.add(lightControls, "positionZ", -10, 10).onChange((value) => {
      this.sceneSubjects[0].setPosition(
        lightControls.positionX,
        lightControls.positionY,
        value
      ); // Update light position
    });

    // Add helper visibility control
    this.gui.add(lightControls, "helperVisible").onChange((value) => {
      this.sceneSubjects[0].toggleHelperVisibility(value); // Toggle helper visibility
    });
  }

  // Method to update the scene each frame
  update() {
    const elapsedTime = this.clock.getElapsedTime();

    // Update each scene subject (lights, objects, etc.)
    this.sceneSubjects.forEach((subject) => subject.update(elapsedTime));

    // Update the atmosphere
    this.atmosphere.update(); // Optional update for animation

    // Update the OrbitControls for interaction
    this.controls.update(); // Ensure controls are updated on every frame

    // Update shoe model rotation interaction
    const shoe = this.sceneSubjects.find(
      (subject) => subject instanceof ShoeModel
    );
    if (shoe) {
      shoe.update(elapsedTime); // Delegate rotation update to the ShoeModel instance
    }

    // Render the scene with the camera
    this.renderer.render(this.scene, this.camera);
  }

  // Handle window resizing to adjust canvas and camera
  onWindowResize() {
    // Update the screen dimensions
    this.screenDimensions.width = window.innerWidth;
    this.screenDimensions.height = window.innerHeight;

    // Update camera aspect ratio and renderer size
    this.camera.aspect =
      this.screenDimensions.width / this.screenDimensions.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(
      this.screenDimensions.width,
      this.screenDimensions.height
    );
  }
}
