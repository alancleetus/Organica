import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { handleLogout } from "./auth/Logout";

import Settings3LineIcon from "remixicon-react/Settings3LineIcon";
import WifiOffLineIcon from "remixicon-react/WifiOffLineIcon";
import Download2LineIcon from "remixicon-react/Download2LineIcon";

import LogoutBoxRLineIcon from "remixicon-react/LogoutBoxRLineIcon";

function Header({ notes = [] }) {
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

      // Create a download link and trigger it
      const link = document.createElement("a");
      link.href = URL.createObjectURL(notesBlob);
      link.download = "notes_backup.json";
      link.click();
      URL.revokeObjectURL(link.href);

      console.log("Notes exported successfully!");
    } catch (error) {
      console.error("Error exporting notes:", error);
    }
  };

  return (
    <div className="sidebar-actions-shell">
      {!isOnline && (
        <div className="sidebar-status" aria-label="Wifi offline">
          <WifiOffLineIcon />
          <span>Offline</span>
        </div>
      )}
      <div className="sidebar-actions">
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
          data-testid="logout-button"
        >
          <LogoutBoxRLineIcon />
        </button>
      </div>
    </div>
  );
}

export default Header;
