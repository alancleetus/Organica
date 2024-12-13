import React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

import "../public/styles/styles.css";
import "../public/styles/badge.css";
import "../public/styles/header.css";
import "../public/styles/loginRegister.css";
import "../public/styles/modal.css";
import "../public/styles/note.css";
import "../public/styles/noteContainer.css";
import "../public/styles/sorter.css";
import "../public/styles/section.css";
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

// Register the service worker
serviceWorkerRegistration.register();
