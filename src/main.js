// Importing the necessary modules
import "../css/style.css"; // Your custom CSS
import * as THREE from "three"; // Importing Three.js
import gsap from "gsap"; // Importing GSAP for animations
import * as dat from "dat.gui"; // Importing dat.GUI for UI controls
import { SceneManager } from "./SceneManager"; // Importing SceneManager from SceneManager.js

// Create the canvas element and append it to the document body
const canvas = document.getElementById("canvas");

// Initialize the SceneManager with the canvas
const sceneManager = new SceneManager(canvas);

// Main render loop
function render() {
  requestAnimationFrame(render);
  sceneManager.update();
}

render();
