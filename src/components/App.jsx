import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import NotesManager from "./NotesManager";
import Login from "./auth/Login";
import Register from "./auth/Register";
import EditNote from "./EditNote";
import AddNote from "./AddNote";

import AuthProvider from "./auth/AuthProvider";
import { PrivateRoute, PublicOnlyRoute } from "./auth/RouteGuards";

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
      <AuthProvider>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route
              path="/login"
              element={<Login theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route
              path="/register"
              element={<Register theme={theme} toggleTheme={toggleTheme} />}
            />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route
              path="/main"
              element={<NotesManager theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route
              path="/edit/:id"
              element={<EditNote theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route
              path="/note"
              element={<AddNote theme={theme} toggleTheme={toggleTheme} />}
            />
            <Route path="/" element={<Navigate to="/main" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
