import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UpdateNote, DeleteNote, ReadNoteById } from "../utils/notesCrud";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import Button from "@mui/material/Button";
import TipTapEditor from "./TiptapEditor";

function EditNote({ theme, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editorContent, setEditorContent] = useState("<p></p>");

  useEffect(() => {
    const fetchNote = async () => {
      const fetchedNote = await ReadNoteById(id);
      console.log(fetchedNote);

      setNote(fetchedNote);
      setEditedTitle(fetchedNote.title);
      setEditorContent(fetchedNote.content);
    };

    fetchNote();
  }, [id]);

  const handleSaveClick = async () => {
    try {
      await UpdateNote(id, editedTitle, editorContent); // Wait for the update to finish
      navigate("/main"); // Redirect back to main page
    } catch (error) {
      console.error("Error updating note:", error);
      // Handle the error (e.g., show a toast notification)
    }
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

      <TipTapEditor
        setEditorContent={setEditorContent}
        initialContent={editorContent}
      />

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
