import React, { useEffect, useState } from "react";
import HighlightIcon from "@mui/icons-material/Highlight";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { Logout } from "@mui/icons-material";
import { handleLogout } from "./auth/Logout";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
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

  const exportNotes = async () => {
    try {
      // Fetch all notes
      const notesCollection = collection(db, "notes");
      const q = query(notesCollection, where("userId", "==", user.uid));
      const notesSnapshot = await getDocs(q);
      const notesList = notesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Create a JSON blob
      const notesBlob = new Blob([JSON.stringify(notesList, null, 2)], {
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
    <header>
      <h1>
        <HighlightIcon></HighlightIcon>Organica
      </h1>

      {!isOnline && (
        <WifiOffIcon style={{ color: "red", float: "right", margin: "10px" }} />
      )}

      <button
        className="dark-mode-button"
        style={{ marginRight: "10px" }}
        onClick={exportNotes}
      >
        <FileDownloadIcon />
      </button>

      <button
        className="dark-mode-button"
        style={{ marginRight: "10px" }}
        onClick={toggleTheme}
      >
        {theme === "light" ? <DarkModeIcon /> : <LightModeIcon />}
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
