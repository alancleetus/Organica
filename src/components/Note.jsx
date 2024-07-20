import React, { useState, useEffect } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckboxList from "./DNDCheckboxList";

import { v4 as uuidv4 } from "uuid";
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Grid";
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
      //const updatedItems = itemsArray.filter((item) => item.text != "");
      const updatedItems = itemsArray;
      setItemsArray(updatedItems);
      //console.log("removing empty item");
      props.editNote(props.id, editedTitle, updatedItems);
    } else if (editedTitle !== props.title || editedContent !== props.content)
      props.editNote(props.id, editedTitle, editedContent);

    setIsEditing(false);
  };

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
          <h1>{props.title}</h1>
          {props.isList ? (
            <CheckboxList
              itemsArray={itemsArray}
              updateItemsArray={updateItemsArray}
            />
          ) : (
            <p>{props.content}</p>
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
