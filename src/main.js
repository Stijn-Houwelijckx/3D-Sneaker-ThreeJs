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

// Select the color picker and save button elements
// const colorPicker = document.getElementById("color-picker");
const saveColorButton = document.getElementById("save-color");

let programmaticClick = false; // Flag to track programmatic clicks

// // Add an event listener to the color picker
// colorPicker.addEventListener("click", (event) => {
//   if (programmaticClick) {
//     // Reset the flag and allow the default color picker behavior
//     programmaticClick = false;
//     return;
//   }

//   // Prevent the default behavior of opening the color picker
//   event.preventDefault();

//   // Animate the margin-top of the save button using GSAP
//   gsap.to(saveColorButton, {
//     duration: 0.5, // Animation duration in seconds
//     marginTop: "250px", // Target margin-top value
//     ease: "power2.out", // Easing function for smooth motion
//     onComplete: () => {
//       // Add a small delay before triggering the color picker
//       setTimeout(() => {
//         programmaticClick = true; // Set flag to avoid loop
//         colorPicker.dispatchEvent(new MouseEvent("click", { bubbles: true }));
//       }, 200); // Add a 200ms delay before triggering
//     },
//   });
// });

// colorPicker.addEventListener("blur", () => {
//   // Reset the margin-top of the save button
//   gsap.to(saveColorButton, {
//     duration: 0.5, // Animation duration in seconds
//     marginTop: "0px", // Reset margin-top value
//     ease: "power2.out",
//   });
// });
