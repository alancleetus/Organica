import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NotesManager from "./NotesManager";
import Login from "./auth/Login";
import Register from "./auth/Register";
import EditNote from "./EditNote";
import AddNote from "./AddNote";

let App = () => {
  /****** Toggle Darkmode Start *******/
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
  /****** Toggle Darkmode End *******/

  return (
    <Router>
      <div>
        <Routes>
          // redirect to login page
          <Route
            path="/*"
            element={<Login theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route
            path="/register"
            element={<Register theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route
            path="/main"
            element={<NotesManager theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route
            path="/note/:id"
            element={<EditNote theme={theme} toggleTheme={toggleTheme} />}
          />
          <Route
            path="/note/"
            element={<AddNote theme={theme} toggleTheme={toggleTheme} />}
          />
        </Routes>
      </div>
      <ToastContainer />
    </Router>
  );
};

export default App;
