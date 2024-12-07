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

const primus = Primus.connect("https://threed-sneaker-nodejs.onrender.com", {
  reconnect: {
    max: Infinity,
    min: 500,
    retries: 10,
  },
});

// Event listener for form submission
orderForm.addEventListener("submit", async (e) => {
  const formData = new FormData(orderForm);

  const name = formData.get("name");
  const email = formData.get("email");
  const street = formData.get("street");
  const houseNr = formData.get("houseNr");
  const zipcode = formData.get("zipcode");
  const city = formData.get("city");

  const configuration = sceneManager.getShoeConfiguration();

  // Build the sneaker parts array based on your shoe configuration
  const sneakerParts = Object.entries(configuration).map(
    ([partName, details]) => ({
      partName: partName.replace("_", " "), // Format part names if necessary
      color: details.color,
      material: details.material,
    })
  );

  const orderPayload = {
    order: {
      user: {
        name: name,
        email: email,
        address: {
          street: street,
          houseNr: houseNr,
          zipcode: zipcode,
          city: city,
        },
      },
      sneaker: {
        parts: sneakerParts,
      },
    },
  };

  console.log("Order Payload:", orderPayload);

  e.preventDefault();

  try {
    // Send the POST request
    const response = await fetch(
      "https://threed-sneaker-nodejs.onrender.com/api/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      }
    );

    if (response.ok) {
      const responseData = await response.json();

      if (responseData) {
        primus.write({
          action: "newOrder",
          data: responseData,
        });
      }
      console.log("Order submitted successfully:", responseData);

      // Show success message and reset the form
      gsap.to(orderFinish, {
        duration: 0.5,
        right: "-25vw",
        ease: "power2.in",
        onComplete: () => {
          orderFinish.style.display = "none";
          placeOrderButton.style.display = "block";
          loaderBackdrop.style.display = "block";

          setTimeout(() => {
            loaderBackdrop.style.display = "none";
            succesMessage.style.display = "block";
          }, 2000);

          orderForm.reset();

          setTimeout(() => {
            succesMessage.style.display = "none";
          }, 5000);
        },
      });
    } else {
      console.error("Error submitting order:", await response.text());
      alert("There was an error processing your order. Please try again.");
    }
  } catch (error) {
    console.error("Network error:", error);
    alert(
      "Network error. Please check your internet connection and try again."
    );
  }
});
