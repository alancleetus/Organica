import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { handleLogout } from "./auth/Logout";

import Settings3LineIcon from "remixicon-react/Settings3LineIcon";
import WifiOffLineIcon from "remixicon-react/WifiOffLineIcon";
import Download2LineIcon from "remixicon-react/Download2LineIcon";
import MoonLineIcon from "remixicon-react/MoonLineIcon";
import SunLineIcon from "remixicon-react/SunLineIcon";
import LogoutBoxRLineIcon from "remixicon-react/LogoutBoxRLineIcon";

import { PALETTES, getPaletteToggleTarget } from "./Settings";

function Header({ notes = [], palette, setPalette }) {
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

  const exportNotes = async () => {
    try {
      const notesBlob = new Blob([JSON.stringify(notes, null, 2)], {
        type: "application/json",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(notesBlob);
      link.download = "notes_backup.json";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error exporting notes:", error);
    }
  };

  const isDark = PALETTES.find((option) => option.id === palette)?.mode === "Dark";

  return (
    <div className="sidebar-actions-shell">
      {!isOnline && (
        <div className="sidebar-status" aria-label="Wifi offline">
          <WifiOffLineIcon />
          <span>Offline</span>
        </div>
      )}
      <div className="sidebar-actions">
        {setPalette && (
          <button
            className="dark-mode-button"
            onClick={() => setPalette(getPaletteToggleTarget(palette))}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <SunLineIcon /> : <MoonLineIcon />}
          </button>
        )}
        <button
          className="dark-mode-button"
          onClick={exportNotes}
          aria-label="Export Notes"
          disabled={!notes.length}
        >
          <Download2LineIcon />
        </button>
        <Link className="dark-mode-button" to="/settings" aria-label="Settings">
          <Settings3LineIcon />
        </Link>
        <button
          className="dark-mode-button"
          onClick={() => {
            handleLogout();
            window.location.href = "/login";
          }}
          aria-label="Log out"
          data-testid="logout-button"
        >
          <LogoutBoxRLineIcon />
        </button>
      </div>
    </div>
  );
}

export default Header;
