import React from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness5Icon from "@mui/icons-material/Brightness5";
function Header({ toggleTheme, theme }) {
  return (
    <header>
      <h1>
        <HighlightIcon></HighlightIcon>Keeper
      </h1>
      <button className="dark-mode-button" onClick={toggleTheme}>
        {theme === "light" ? <Brightness4Icon /> : <Brightness5Icon />}{" "}
      </button>
    </header>
  );
}

export default Header;
