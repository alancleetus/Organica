import React, { useEffect, useState } from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness5Icon from "@mui/icons-material/Brightness5";
import { Logout } from "@mui/icons-material";
import { handleLogout } from "./auth/Logout";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import WifiIcon from "@mui/icons-material/Wifi";
function Header({ toggleTheme, theme }) {
  const [isOnline, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);
  return (
    <header>
      <h1>
        <HighlightIcon></HighlightIcon>Keeper
      </h1>

      {!isOnline && (
        <WifiOffIcon style={{ color: "red", float: "right", margin: "10px" }} />
      )}

      <button
        className="dark-mode-button"
        style={{ marginRight: "10px" }}
        onClick={toggleTheme}
      >
        {theme === "light" ? <Brightness4Icon /> : <Brightness5Icon />}{" "}
      </button>
      <button
        className="dark-mode-button"
        onClick={() => {
          handleLogout();
          window.location.href = "/login";
        }}
      >
        <Logout />
      </button>
    </header>
  );
}

export default Header;
