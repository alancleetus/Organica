import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import { UpdateNote, DeleteNote } from "../utils/notesCrud";
import { useNavigate } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Menu, MenuItem } from "@mui/material";
import { EditNote } from "@mui/icons-material";
import DOMPurify from "dompurify";
function Note(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const sanitizedContent = DOMPurify.sanitize(props.content);
  // Menu handlers
  const handleFabClick = (event) => setAnchorEl(event.currentTarget); // Open menu
  const handleMenuClose = () => setAnchorEl(null); // Close menu

  // console.log(props);
  return (
    <>
      <div className="note" onDoubleClick={() => navigate(`/note/${props.id}`)}>
        <div className="note-header">
          <div className="note-header-left">
            <h1 className="note-title">{props.title}</h1>
          </div>
          <div id="menuIcon">
            <MoreHorizIcon onClick={handleFabClick} />
            {/* Menu for FAB options */}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => navigate(`/note/${props.id}`)}>
                <EditNote style={{ marginRight: "10px" }} />
                Edit Note
              </MenuItem>
              <MenuItem onClick={() => DeleteNote(props.id, props.setNotes)}>
                <DeleteIcon style={{ marginRight: "10px" }} />
                Delete note
              </MenuItem>
            </Menu>
          </div>
        </div>
        <div
          className="note-content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        ></div>{" "}
        <div className="note-date">
          <p className="date-time-text">{props.date}</p>
        </div>
      </div>
    </>
  );
}

export default Note;
