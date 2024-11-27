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

// Select the "Place Order" button
const placeOrderButton = document.querySelector(".place-order-btn");
const orderFinish = document.querySelector(".order-finish");
const finishOrderBtn = document.querySelector(".finish-order-btn");
const cancelOrderBtn = document.querySelector(".cancel-order-btn");
const orderForm = document.querySelector(".order-form");
const loaderBackdrop = document.querySelector(".loader-backdrop");
const succesMessage = document.querySelector(".order-success");

// Add event listener for the button
placeOrderButton.addEventListener("click", () => {
  // Hide the button
  placeOrderButton.style.display = "none";

  // Show the order finish message
  orderFinish.style.display = "flex";

  gsap.to(orderFinish, {
    duration: 0.5, // Animation duration in seconds
    right: "0vw", // Set the width to 33.33%
    ease: "power2.out", // Easing function for smooth animation
  });

  const configuration = sceneManager.getShoeConfiguration();
  console.log("Shoe Configuration:", configuration);
});

// Add event listener for the "Cancel Order" button
cancelOrderBtn.addEventListener("click", (e) => {
  e.preventDefault();

  gsap.to(orderFinish, {
    duration: 0.5, // Animation duration in seconds
    right: "-25vw", // Set the width to 0% to collapse it
    ease: "power2.in", // Easing function for smooth closing
    onComplete: () => {
      // After the animation is complete, hide the container
      orderFinish.style.display = "none"; // Hide the container
      placeOrderButton.style.display = "block";
    },
  });
});

// Event listener for form submission
orderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // close the order finish message
  gsap.to(orderFinish, {
    duration: 0.5, // Animation duration in seconds
    right: "-25vw", // Set the width to 0% to collapse it
    ease: "power2.in", // Easing function for smooth closing
    onComplete: () => {
      // After the animation is complete, hide the container
      orderFinish.style.display = "none"; // Hide the container
      placeOrderButton.style.display = "block";

      // Show the loader backdrop
      loaderBackdrop.style.display = "block";

      // Simulate a delay for the loader
      setTimeout(() => {
        // Hide the loader backdrop after 2 seconds
        loaderBackdrop.style.display = "none";

        // Show a success message
        succesMessage.style.display = "block";
      }, 2000);

      // Reset the form
      orderForm.reset();

      // Close the success message after 5 seconds
      setTimeout(() => {
        succesMessage.style.display = "none";
      }, 5000);
    },
  });
});
