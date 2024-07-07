import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";

// Get the root element
const rootElement = document.getElementById("root");

// Create a root
const root = createRoot(rootElement);

// Initial render: Render an element to the root.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
