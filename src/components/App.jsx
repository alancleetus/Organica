import { useState, useEffect } from "react";
import NotesManager from "./NotesManager";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./auth/Login";
import Register from "./auth/Register";
import Logout from "./auth/Logout";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
let App = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme); // Apply the theme to the document
    localStorage.setItem("theme", theme); // Save theme to local storage
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light"); // Toggle between light and dark themes
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route
            path="/login"
            element={<Login theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route
            path="/register"
            element={<Register theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route path="/logout" element={<Logout />} />
          <Route
            path="/main"
            element={<NotesManager theme={theme} toggleTheme={toggleTheme} />}
          />
        </Routes>
      </div>{" "}
      <ToastContainer />
    </Router>
  );
};

export default App;
