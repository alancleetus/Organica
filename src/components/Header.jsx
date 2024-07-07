import React from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness5Icon from "@mui/icons-material/Brightness5";
import { Logout } from "@mui/icons-material";
import { handleLogout } from "./auth/Logout";
function Header({ toggleTheme, theme }) {
  return (
    <header>
      <h1>
        <HighlightIcon></HighlightIcon>Keeper
      </h1>
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
