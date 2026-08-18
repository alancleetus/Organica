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
import Settings from "./Settings";

import AuthProvider from "./auth/AuthProvider";
import { PrivateRoute, PublicOnlyRoute } from "./auth/RouteGuards";

function resolveInitialPalette() {
  const saved = localStorage.getItem("palette");
  if (saved) return saved;

  // One-time migration from the old light/dark-only toggle so existing
  // users don't silently lose their preference.
  const legacyTheme = localStorage.getItem("theme");
  if (legacyTheme === "dark") return "monochrome-dark";
  return "slate-light";
}

let App = () => {
  /****** Color palette start *******/
  const [palette, setPalette] = useState(resolveInitialPalette);

  useEffect(() => {
    document.documentElement.setAttribute("data-palette", palette);
    localStorage.setItem("palette", palette);
  }, [palette]);
  /****** Color palette end *******/

  /****** Font scheme start *******/
  const [fontScheme, setFontScheme] = useState(
    () => localStorage.getItem("fontScheme") || "gilroy"
  );

  useEffect(() => {
    if (fontScheme === "gilroy") {
      document.documentElement.removeAttribute("data-font");
    } else {
      document.documentElement.setAttribute("data-font", fontScheme);
    }
    localStorage.setItem("fontScheme", fontScheme);
  }, [fontScheme]);
  /****** Font scheme end *******/

  return (
    <Router>
      <AuthProvider>

        <ToastContainer
          position="bottom-center"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          style={{ zIndex: 99999 }}
        />
        
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route
              path="/main"
              element={<NotesManager palette={palette} setPalette={setPalette} />}
            />
            <Route
              path="/settings"
              element={
                <Settings
                  palette={palette}
                  setPalette={setPalette}
                  fontScheme={fontScheme}
                  setFontScheme={setFontScheme}
                />
              }
            />
            <Route path="/edit/:id" element={<Navigate to="/main" replace />} />
            <Route path="/note" element={<Navigate to="/main" replace />} />
            <Route path="/" element={<Navigate to="/main" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
