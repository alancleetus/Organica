import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { CreateNote } from "../utils/notesCrud";
import PlainTextNoteEditor from "./PlainTextNoteEditor";
import ChecklistEditor from "./ChecklistEditor";
import { trimNoteContent } from "../utils/noteContent";

function AddNoteModal({ open, onClose, onCreated, user, setNotes }) {
  const [title, setTitle] = useState("");
  const [noteType, setNoteType] = useState("text");
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setNoteType("text");
      setEditorContent("");
      setIsSaving(false);
      return;
    }

    const focusTimer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 50);

    return () => clearTimeout(focusTimer);
  }, [open]);

  const isEditorEmpty = editorContent.trim() === "";
  const isNoteEmpty = title.trim() === "" && isEditorEmpty;

  const handleClose = () => {
    if (isSaving) return;

    if (!isNoteEmpty) {
      const confirmDiscard = window.confirm(
        "Discard this note? Your changes won't be saved."
      );
      if (!confirmDiscard) return;
    }

    onClose();
  };

  const handleSave = async () => {
    if (isNoteEmpty || !user) {
      handleClose();
      return;
    }

    setIsSaving(true);

    try {
      const createdNote = await CreateNote({
        user,
        title: title.trim(),
        content: trimNoteContent(editorContent),
        noteType,
        setNotes,
      });
      if (createdNote && onCreated) {
        onCreated(createdNote);
      }
      onClose();
    } catch (error) {
      console.error("Error creating note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleModalKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleSave();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      handleClose();
    }
  };

  const handleTypeChange = (nextType) => {
    if (nextType === noteType) return;
    setNoteType(nextType);
    setEditorContent("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      data-testid="add-note-modal"
      PaperProps={{
        className: "create-note-modal",
      }}
      BackdropProps={{
        className: "create-note-backdrop",
      }}
    >
      <DialogContent
        className="create-note-modal-content"
        onKeyDown={handleModalKeyDown}
      >
        <div className="create-note-modal-shell">
          <div className="create-note-type-picker" role="group" aria-label="Note type">
            <button
              type="button"
              className={`create-note-type-button${noteType === "text" ? " is-active" : ""}`}
              data-testid="note-type-text"
              onClick={() => handleTypeChange("text")}
            >
              Note
            </button>
            <button
              type="button"
              className={`create-note-type-button${noteType === "checklist" ? " is-active" : ""}`}
              data-testid="note-type-checklist"
              onClick={() => handleTypeChange("checklist")}
            >
              Checklist
            </button>
          </div>

          <input
            ref={titleInputRef}
            className="create-note-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            data-testid="note-title"
          />

          <div className="create-note-editor">
            {noteType === "checklist" ? (
              <ChecklistEditor
                value={editorContent}
                onChange={setEditorContent}
                editorTestId="note-content"
                className="create-note-editor-field"
              />
            ) : (
              <PlainTextNoteEditor
                value={editorContent}
                onChange={setEditorContent}
                editorTestId="note-content"
                placeholder="Take a note..."
                className="create-note-editor-field"
              />
            )}
          </div>

          <div className="create-note-actions">
            <button
              type="button"
              className="create-note-close-button"
              onClick={handleClose}
              data-testid="cancel-add-note"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="button"
              className="create-note-save-button"
              onClick={handleSave}
              data-testid="note-save"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddNoteModal;
