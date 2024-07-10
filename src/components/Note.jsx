import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

function note(props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(props.title);
  const [editedContent, setEditedContent] = useState(props.content);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (editedTitle !== props.title || editedContent !== props.content)
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
            />
          </h1>
          <p>
            <textarea
              className="contentInput"
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
          </p>
          <button className="saveButton" onClick={handleSaveClick}>
            {editedTitle !== props.title || editedContent !== props.content ? (
              <SaveIcon />
            ) : (
              <CancelIcon />
            )}
          </button>
        </>
      ) : (
        <>
          <h1>{props.title}</h1>
          <p>{props.content}</p>
          <button className="editButton" onClick={handleEditClick}>
            <EditIcon />
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
      )}
    </div>
  );
}

export default note;
