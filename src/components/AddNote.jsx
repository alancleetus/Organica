import React, { useEffect, useState } from "react";
import CheckboxList from "./DNDCheckboxList";
import { CreateNote } from "../utils/notesCrud";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase";

function AddNote() {
  const navigate = useNavigate();
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isList, setIsList] = useState(false);
  const [itemsArray, setItemsArray] = useState([]);
  const [user, setUser] = useState(null);

  /****  Redirect to login if not authenticated ****/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);
  const updateItemsArray = (updatedItemsArray) => {
    setItemsArray(updatedItemsArray);
  };

  const handleSaveClick = () => {
    // Create a new note
    CreateNote(user, editedTitle, editedContent, isList, itemsArray).then(
      () => {
        navigate("/main"); // Redirect to main page after creation
      }
    );
  };

  const handleCancelClick = () => {
    navigate("/main"); // Redirect without saving
  };

  return (
    <div className="note-page">
      <input
        className="titleInput"
        type="text"
        value={editedTitle}
        onChange={(e) => setEditedTitle(e.target.value)}
        placeholder="Add a title..."
      />
      {isList ? (
        <CheckboxList
          itemsArray={itemsArray}
          updateItemsArray={updateItemsArray}
        />
      ) : (
        <textarea
          className="contentInput"
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          placeholder="Take a note..."
        />
      )}
      <div className="note-page-actions">
        <Button onClick={handleCancelClick} color="primary">
          <CancelIcon /> Cancel
        </Button>
        <Button onClick={handleSaveClick} color="primary" variant="contained">
          <SaveIcon /> Save
        </Button>
      </div>
    </div>
  );
}

export default AddNote;
