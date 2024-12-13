import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CheckboxList from "./DNDCheckboxList";
import { UpdateNote, DeleteNote, ReadNoteById } from "../utils/notesCrud";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";

function EditNote({ theme, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [isList, setIsList] = useState(false);
  const [itemsArray, setItemsArray] = useState([]);

  useEffect(() => {
    const fetchNote = async () => {
      const fetchedNote = await ReadNoteById(id);
      setNote(fetchedNote);
      setEditedTitle(fetchedNote.title);
      setEditedContent(fetchedNote.content);
      setIsList(fetchedNote.isList);
      setItemsArray(fetchedNote.content || []);
    };

    fetchNote();
  }, [id]);

  const updateItemsArray = (updatedItemsArray) => {
    setItemsArray(updatedItemsArray);
    UpdateNote(id, editedTitle, updatedItemsArray);
  };

  const handleSaveClick = () => {
    if (isList) {
      UpdateNote(id, editedTitle, itemsArray);
    } else {
      UpdateNote(id, editedTitle, editedContent);
    }
    navigate("/main"); // Redirect back to main page
  };

  const handleCancelClick = () => {
    navigate("/main"); // Redirect without saving
  };

  const handleDeleteClick = () => {
    DeleteNote(id, setNote);
    navigate("/main"); // Redirect after deletion
  };

  if (!note) return <p>Loading...</p>;

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
        <Button onClick={handleDeleteClick} color="secondary">
          <DeleteIcon /> Delete
        </Button>
      </div>
    </div>
  );
}

export default EditNote;
