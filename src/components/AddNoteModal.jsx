import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { CreateNote } from "../utils/notesCrud";
import TipTapEditor from "./TiptapEditor";
import CheckboxMultipleLineIcon from "remixicon-react/CheckboxMultipleLineIcon";

function AddNoteModal({ open, onClose, onCreated, user, setNotes }) {
  const [title, setTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setEditorContent("");
      setIsSaving(false);
    }
  }, [open]);

  const isEditorEmpty = !editorContent || editorContent === "<p></p>";
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
        content: editorContent || "<p></p>",
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
      <DialogContent className="create-note-modal-content">
        <div className="create-note-modal-shell">
          <div className="create-note-head">
            <div className="create-note-pill">
              <CheckboxMultipleLineIcon />
              <span>Checklist ready</span>
            </div>
          </div>

          <input
            className="create-note-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            data-testid="note-title"
          />

          <div className="create-note-editor">
            <TipTapEditor
              setEditorContent={setEditorContent}
              toolbarMode="task-only"
              editorTestId="note-content"
              placeholder="Take a note..."
            />
          </div>

          <div className="create-note-actions">
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
      </DialogContent>
    </Dialog>
  );
}

export default AddNoteModal;
