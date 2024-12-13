import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckboxList from "./DNDCheckboxList";
import { v4 as uuidv4 } from "uuid";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import { UpdateNote, DeleteNote } from "../utils/notesCrud";
import { useNavigate } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Menu, MenuItem } from "@mui/material";
import { EditNote } from "@mui/icons-material";

function Note(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  let [itemsArray, setItemsArray] = useState(props.content);

  const updateItemsArray = (updatedItemsArray) => {
    setItemsArray(updatedItemsArray);
    UpdateNote(props.id, editedTitle, updatedItemsArray);
  };

  useEffect(() => {
    setItemsArray(props.content);
  }, [props.content]);

  // Menu handlers
  const handleFabClick = (event) => setAnchorEl(event.currentTarget); // Open menu
  const handleMenuClose = () => setAnchorEl(null); // Close menu

  return (
    <>
      <div className="note" onDoubleClick={() => navigate(`/note/${props.id}`)}>
        <div className="note-header">
          <div className="note-header-left">
            <h1 className="note-title">{props.title}</h1>
            <div className="note-badge-div">
              {props.isList && (
                <p className="note-badge">
                  {Array.from(itemsArray).reduce((acc, item) => {
                    if (!item.checked) acc += 1; // Count unchecked items
                    return acc;
                  }, 0)}
                </p>
              )}
            </div>
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
        {props.isList ? (
          <CheckboxList
            itemsArray={itemsArray}
            updateItemsArray={updateItemsArray}
          />
        ) : (
          <>
            <p className="note-content">{props.content}</p>
          </>
        )}

        <div className="note-date">
          <p className="date-time-text">{props.date}</p>
        </div>
      </div>
    </>
  );
}

export default Note;
