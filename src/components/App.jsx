import { useState, useEffect } from "react";
import Header from "./Header";
import NotesManager from "./NotesManager";

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
    <>
      <Header toggleTheme={toggleTheme} theme={theme} />
      <NotesManager />
    </>
  );
};

export default App;
