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
import Settings from "./Settings";

import AuthProvider from "./auth/AuthProvider";
import { PrivateRoute, PublicOnlyRoute } from "./auth/RouteGuards";
import { loadFontSize, saveFontSize } from "../utils/fontSizePrefs";

const MOBILE_VIEWPORT_QUERY = "(max-width: 900px)";

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

    // Keeps the phone's status bar / system nav bar in sync with the
    // active palette instead of the hardcoded black from index.html —
    // browsers color that chrome from this meta tag, not from any CSS.
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      const background = getComputedStyle(document.documentElement)
        .getPropertyValue("--background-color")
        .trim();
      if (background) themeColorMeta.setAttribute("content", background);
    }
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

  /****** Text weight start *******/
  const [textWeight, setTextWeight] = useState(
    () => localStorage.getItem("textWeight") || "regular"
  );

  useEffect(() => {
    if (textWeight === "regular") {
      document.documentElement.removeAttribute("data-text-weight");
    } else {
      document.documentElement.setAttribute("data-text-weight", textWeight);
    }
    localStorage.setItem("textWeight", textWeight);
  }, [textWeight]);
  /****** Text weight end *******/

  /****** Font size start *******/
  // Desktop and mobile keep independent values (see fontSizePrefs.js) and
  // both are editable from Settings at once, regardless of which screen
  // size you're currently viewing it on — only the one matching the
  // current viewport is actually applied to the page.
  const [isMobileViewport, setIsMobileViewport] = useState(
    () => window.matchMedia(MOBILE_VIEWPORT_QUERY).matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY);
    const handleChange = (event) => setIsMobileViewport(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const [fontSizeDesktop, setFontSizeDesktopState] = useState(() => loadFontSize(false));
  const [fontSizeMobile, setFontSizeMobileState] = useState(() => loadFontSize(true));

  const setFontSizeDesktop = (value) => {
    setFontSizeDesktopState(value);
    saveFontSize(value, false);
  };

  const setFontSizeMobile = (value) => {
    setFontSizeMobileState(value);
    saveFontSize(value, true);
  };

  const activeFontSize = isMobileViewport ? fontSizeMobile : fontSizeDesktop;

  useEffect(() => {
    if (activeFontSize === "medium") {
      document.documentElement.removeAttribute("data-font-size");
    } else {
      document.documentElement.setAttribute("data-font-size", activeFontSize);
    }
  }, [activeFontSize]);
  /****** Font size end *******/

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
          </Route>

          <Route element={<PrivateRoute />}>
            <Route
              path="/main"
              element={
                <NotesManager palette={palette} setPalette={setPalette} />
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  palette={palette}
                  setPalette={setPalette}
                  fontScheme={fontScheme}
                  setFontScheme={setFontScheme}
                  textWeight={textWeight}
                  setTextWeight={setTextWeight}
                  fontSizeDesktop={fontSizeDesktop}
                  setFontSizeDesktop={setFontSizeDesktop}
                  fontSizeMobile={fontSizeMobile}
                  setFontSizeMobile={setFontSizeMobile}
                  isMobileViewport={isMobileViewport}
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
