// sceneSubjects/GeneralLights.js

import * as THREE from "three";

export class GeneralLights {
  constructor(scene) {
    // Create an AmbientLight with color and intensity
    this.ambientLight = new THREE.AmbientLight("white", 0.1);

    scene.add(this.ambientLight); // Add the light to the

    // Create a PointLight with initial color and intensity
    this.light = new THREE.PointLight("white", 100);
    this.light.position.set(0, 5, 0); // Set the position of the light

    // Enable shadow casting for the light
    this.light.castShadow = true; // Enable shadow casting for the light
    this.light.shadow.mapSize.width = 4096; // Set shadow map width
    this.light.shadow.mapSize.height = 4096; // Set shadow map height

    // set color and intensity
    this.light.color.set("white");

    scene.add(this.light); // Add the light to the scene

    // Add a helper for the light (this will show a sphere for a point light)
    this.helper = new THREE.PointLightHelper(this.light, 1); // You can adjust the size (1 here)
    scene.add(this.helper); // Add helper to the scene
  }

  // Method to update light intensity
  setIntensity(intensity) {
    this.light.intensity = intensity;
  }

  // Method to update light color
  setColor(color) {
    this.light.color.set(color); // Set the color of the light
  }

  // Method to update light position
  setPosition(x, y, z) {
    this.light.position.set(x, y, z); // Set the light's position
  }

  // Method to toggle visibility of the helper
  toggleHelperVisibility(visible) {
    this.helper.visible = visible;
  }

  // Update light intensity and color based on time
  update(time) {
    // this.light.intensity = (Math.sin(time) + 1.5) / 1.5; // Pulsing light effect
    // this.light.color.setHSL(Math.sin(time), 0.5, 0.5); // Changing light color over time
  }
}
