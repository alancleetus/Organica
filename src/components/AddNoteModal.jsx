import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { CreateNote } from "../utils/notesCrud";
import PlainTextNoteEditor from "./PlainTextNoteEditor";

function AddNoteModal({ open, onClose, onCreated, user, setNotes }) {
  const [title, setTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
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
        content: editorContent,
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
          <div className="create-note-header">
            <div>
              <p className="create-note-kicker">Quick note</p>
              <input
                ref={titleInputRef}
                className="create-note-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Title"
                data-testid="note-title"
              />
            </div>
            <p className="create-note-shortcut">Cmd/Ctrl+Enter to save</p>
          </div>

          <div className="create-note-editor">
            <PlainTextNoteEditor
              value={editorContent}
              onChange={setEditorContent}
              editorTestId="note-content"
              placeholder="Take a note..."
              className="create-note-editor-field"
            />
          </div>

          <div className="create-note-actions">
            <p className="create-note-helper">
              Saved to your main notes board
            </p>
            <div className="create-note-action-buttons">
              <button
                type="button"
                className="create-note-close-button"
                onClick={handleClose}
                data-testid="cancel-add-note"
                disabled={isSaving}
              >
                Close
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AddNoteModal;
