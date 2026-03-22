import React, { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  UpdateNote,
  DeleteNote,
  PinNote,
  FavoriteNote,
} from "../utils/notesCrud";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Menu, MenuItem } from "@mui/material";
import { useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorContent } from "@tiptap/react";
import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import PushpinFillIcon from "remixicon-react/PushpinFillIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import HeartFillIcon from "remixicon-react/HeartFillIcon";
import SaveLineIcon from "remixicon-react/SaveLineIcon";
import TaskListShortcut from "../utils/taskListShortcut";

const AUTOSAVE_DELAY_MS = 2500;

function Note(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isPinned, setIsPinned] = useState(props.isPinned);
  const [isFavorite, setIsFavorite] = useState(props.isFavorite);
  const [editedTitle, setEditedTitle] = useState(props.title || "");
  const [updatedContent, setUpdateContent] = useState(props.content || "");
  const [saveState, setSaveState] = useState("idle");
  const lastSavedNoteRef = useRef({
    title: props.title || "",
    content: props.content || "",
  });
  const latestDraftRef = useRef({
    title: props.title || "",
    content: props.content || "",
  });
  const queuedSaveRef = useRef(null);
  const isSavingRef = useRef(false);
  const handleFabClick = (event) => setAnchorEl(event.currentTarget); // Open menu
  const handleMenuClose = () => setAnchorEl(null); // Close menu

  const saveLabel =
    saveState === "saving"
      ? "Autosaving..."
      : saveState === "saved"
        ? "All changes saved"
        : saveState === "error"
          ? "Save failed"
          : "Ready";

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: "note-editor-content", // You can customize classes if needed
      },
    },
    extensions: [StarterKit, TaskList, TaskItem, TaskListShortcut],
    content: props.content,
    onUpdate: ({ editor }) => {
      const nextContent = editor.getHTML();
      setUpdateContent(nextContent);
    },
    onBlur: () => {
      if (
        latestDraftRef.current.title !== lastSavedNoteRef.current.title ||
        latestDraftRef.current.content !== lastSavedNoteRef.current.content
      ) {
        saveChanges(latestDraftRef.current);
      }
    },
  });

  useEffect(() => {
    latestDraftRef.current = {
      title: editedTitle,
      content: updatedContent,
    };
  }, [editedTitle, updatedContent]);

  useEffect(() => {
    setIsPinned(props.isPinned);
    setIsFavorite(props.isFavorite);
  }, [props.isPinned, props.isFavorite]);

  useEffect(() => {
    const nextTitle = props.title || "";
    const nextContent = props.content || "";
    const previousSaved = lastSavedNoteRef.current;
    const savedSnapshotChanged =
      nextTitle !== previousSaved.title || nextContent !== previousSaved.content;

    if (!savedSnapshotChanged) return;

    const hasLocalEdits =
      editedTitle !== previousSaved.title ||
      updatedContent !== previousSaved.content;

    lastSavedNoteRef.current = {
      title: nextTitle,
      content: nextContent,
    };

    if (hasLocalEdits) return;

    setEditedTitle(nextTitle);
    setUpdateContent(nextContent);

    if (editor && editor.getHTML() !== nextContent) {
      editor.commands.setContent(nextContent || "<p></p>", false);
    }
  }, [props.title, props.content, editedTitle, updatedContent, editor]);

  const hasPendingChanges =
    editedTitle !== lastSavedNoteRef.current.title ||
    updatedContent !== lastSavedNoteRef.current.content;

  useEffect(() => {
    if (hasPendingChanges) {
      setSaveState("pending");
    } else if (saveState !== "saving") {
      setSaveState("idle");
    }
  }, [editedTitle, updatedContent]);

  const saveChanges = async (
    noteToSave = {
      title: editedTitle,
      content: updatedContent,
    }
  ) => {
    const nextTitle = noteToSave.title ?? "";
    const nextContent = noteToSave.content ?? "<p></p>";

    if (
      nextTitle === lastSavedNoteRef.current.title &&
      nextContent === lastSavedNoteRef.current.content
    ) {
      setSaveState("idle");
      return;
    }

    if (isSavingRef.current) {
      queuedSaveRef.current = { title: nextTitle, content: nextContent };
      return;
    }

    isSavingRef.current = true;
    setSaveState("saving");

    try {
      await UpdateNote({
        id: props.id,
        newTitle: nextTitle,
        newContent: nextContent,
        setNotes: props.setNotes,
      });
      lastSavedNoteRef.current = {
        title: nextTitle,
        content: nextContent,
      };
      setSaveState("saved");
    } catch (error) {
      console.error("Error autosaving note:", error);
      setSaveState("error");
    } finally {
      isSavingRef.current = false;

      if (
        queuedSaveRef.current &&
        (queuedSaveRef.current.title !== lastSavedNoteRef.current.title ||
          queuedSaveRef.current.content !== lastSavedNoteRef.current.content)
      ) {
        const queuedNote = queuedSaveRef.current;
        queuedSaveRef.current = null;
        saveChanges(queuedNote);
      }
    }
  };

  useEffect(() => {
    if (!hasPendingChanges) return;

    const autosaveTimer = setTimeout(() => {
      saveChanges(latestDraftRef.current);
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(autosaveTimer);
  }, [editedTitle, updatedContent, hasPendingChanges]);

  return (
    <>
      <article className="note-card">
        <div className="note-header">
          <div className="note-header-left">
            {(hasPendingChanges || saveState === "saving") && (
              <button
                type="button"
                className="note-save-button"
                data-testid="note-card-save"
                aria-label={
                  saveState === "saving" ? "Saving note" : "Save note now"
                }
                onClick={() => saveChanges()}
                disabled={saveState === "saving"}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  cursor: saveState === "saving" ? "wait" : "pointer",
                }}
              >
                <SaveLineIcon color="var(--primary-muted-color)" />
              </button>
            )}
            <input
              className="note-title-input"
              data-testid="note-card-title-input"
              value={editedTitle}
              onChange={(event) => setEditedTitle(event.target.value)}
              onBlur={() => {
                if (
                  latestDraftRef.current.title !==
                    lastSavedNoteRef.current.title ||
                  latestDraftRef.current.content !==
                    lastSavedNoteRef.current.content
                ) {
                  saveChanges(latestDraftRef.current);
                }
              }}
              placeholder="Untitled note"
            />
          </div>

          <div className="note-header-right">
            {isFavorite && (
              <HeartFillIcon
                onClick={() => {
                  setIsFavorite((prev) => {
                    FavoriteNote({ id: props.id, isFavorite: !prev });
                    return !prev;
                  });
                  handleMenuClose();
                }}
              />
            )}
            {isPinned && (
              <PushpinFillIcon
                onClick={() => {
                  setIsPinned((prev) => {
                    PinNote(props.id, !prev, props.setNotes);
                    return !prev;
                  });
                  handleMenuClose();
                }}
              />
            )}
            <div
              id="menuIcon"
              data-testid="note-card-menu-button"
              onClick={handleFabClick}
            >
              <MoreHorizIcon />
              {/* Menu for FAB options */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                id="test"
              >
                <MenuItem inputProps={{ 'data-testid': 'note-card-menu-favorite-button' }}
                  onClick={() => {
                    setIsFavorite((prev) => {
                      FavoriteNote({ id: props.id, isFavorite: !prev });
                      return !prev;
                    });
                    handleMenuClose();
                  }}
                >
                  <HeartLineIcon style={{ marginRight: "10px" }} />
                  Favorite Note
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setIsPinned((prev) => {
                      PinNote(props.id, !prev, props.setNotes);
                      return !prev;
                    });
                    handleMenuClose();
                  }}
                   data-testid="note-card-menu-pin-button"
                >
                  <PushpinLineIcon style={{ marginRight: "10px" }} />
                  Pin Note
                </MenuItem>
                <MenuItem data-testid="note-card-menu-delete-button"  onClick={() => DeleteNote(props.id, props.setNotes)}>
                  <DeleteIcon style={{ marginRight: "10px" }} />
                  Delete note
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
        <div
          className="note-content"
          data-testid="note-card-content"
        >
          {editor && <EditorContent editor={editor} />}
        </div>
        <div className="note-footer">
          <p className="note-save-state" data-state={saveState}>
            {saveLabel}
          </p>
          <p className="note-date" data-testid="note-card-date">
            {props.date}
          </p>
        </div>
      </article>
    </>
  );
}

export default Note;
