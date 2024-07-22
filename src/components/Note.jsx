import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckboxList from "./DNDCheckboxList";

import { v4 as uuidv4 } from "uuid";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid";
import Badge from "@mui/material/Badge";
import { styled } from "@mui/material/styles";

function note(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(props.title);
  const [editedContent, setEditedContent] = useState(props.content);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  let [itemsArray, setItemsArray] = useState(props.content);

  const updateItemsArray = (updatedItemsArray) => {
    setItemsArray(updatedItemsArray);
    props.editNote(props.id, editedTitle, updatedItemsArray);
  };

  useEffect(() => {
    setItemsArray(props.content);
  }, [props.content]);

  const handleSaveClick = () => {
    if (props.isList) {
      //const updatedItems = itemsArray.filter((item) => item.text !== "");
      const updatedItems = itemsArray;
      setItemsArray(updatedItems);
      //console.log("removing empty item");
      props.editNote(props.id, editedTitle, updatedItems);
    } else if (editedTitle !== props.title || editedContent !== props.content) {
      props.editNote(props.id, editedTitle, editedContent);
    }

    setIsEditing(false);
  };

  const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
      right: -20,
      top: 10,
      padding: "0 4px",
      color: "var(--primary-color)",
      background: "var(--create-note-bg-color)",
      fontSize: "13px",
    },
  }));

  return (
    <div className="note">
      {isEditing ? (
        <>
          <h1>
            <input
              className="titleInput"
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              placeholder="Add a title..."
            />
          </h1>
          {props.isList ? (
            <CheckboxList
              itemsArray={itemsArray}
              updateItemsArray={updateItemsArray}
              editable={isEditing}
            />
          ) : (
            <p>
              <textarea
                className="contentInput"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                placeholder="Take a note..."
              />
            </p>
          )}
          <button className="saveButton" onClick={handleSaveClick}>
            {editedTitle !== props.title || editedContent !== props.content ? (
              <SaveIcon />
            ) : (
              <CancelIcon />
            )}
          </button>
          <button
            className="deleteButton"
            onClick={() => {
              return props.removeNote(props.id);
            }}
          >
            <DeleteIcon />
          </button>
        </>
      ) : (
        <>
          {props.isList ? (
            <>
              <StyledBadge
                badgeContent={Array.from(itemsArray).reduce((acc, item) => {
                  if (!item.checked) acc += 1;
                  return acc;
                }, 0)}
              >
                <h1>{props.title}</h1>
              </StyledBadge>

              <CheckboxList
                itemsArray={itemsArray}
                updateItemsArray={updateItemsArray}
              />
            </>
          ) : (
            <>
              <h1>{props.title}</h1>
              <p>{props.content}</p>{" "}
            </>
          )}

          <button className="editButton" onClick={handleEditClick}>
            <EditIcon />
          </button>
        </>
      )}
    </div>
  );
}

export default note;
