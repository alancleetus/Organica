import React, { useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { Menu, MenuItem } from "@mui/material";
import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import PushpinFillIcon from "remixicon-react/PushpinFillIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import HeartFillIcon from "remixicon-react/HeartFillIcon";
import { DeleteNote, PinNote, UpdateNote, ReplaceTagsForNote } from "../utils/notesCrud";
import PlainTextNoteEditor from "./PlainTextNoteEditor";
import ChecklistEditor from "./ChecklistEditor";
import { normalizeNoteContent, resolveNoteType } from "../utils/noteContent";

const AUTOSAVE_DELAY_MS = 2500;

function Note(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isPinned, setIsPinned] = useState(props.isPinned);
  const [isFavorite, setIsFavorite] = useState(props.isFavorite);
  const [tags, setTags] = useState(props.tags || []);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const tagInputRef = useRef(null);
  const [editedTitle, setEditedTitle] = useState(props.title || "");
  const [updatedContent, setUpdatedContent] = useState(
    normalizeNoteContent(props.content || "")
  );
  const [saveState, setSaveState] = useState("idle");

  const lastSavedNoteRef = useRef({
    title: props.title || "",
    content: normalizeNoteContent(props.content || ""),
  });
  const latestDraftRef = useRef({
    title: props.title || "",
    content: normalizeNoteContent(props.content || ""),
  });
  const queuedSaveRef = useRef(null);
  const isSavingRef = useRef(false);
  const noteType = resolveNoteType({ noteType: props.noteType, content: props.content });

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const saveLabel =
    saveState === "saving"
      ? "Autosaving..."
      : saveState === "saved"
        ? "All changes saved"
        : saveState === "error"
          ? "Save failed"
          : "Ready";

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
    setTags(props.tags || []);
  }, [props.tags]);

  useEffect(() => {
    if (isAddingTag) {
      tagInputRef.current?.focus();
    }
  }, [isAddingTag]);

  const handleAddTag = (event) => {
    event.preventDefault();
    const nextTag = tagDraft.trim();
    setTagDraft("");
    setIsAddingTag(false);

    if (!nextTag || tags.includes(nextTag)) return;

    const nextTags = [...tags, nextTag];
    setTags(nextTags);
    ReplaceTagsForNote(props.id, nextTags, props.setNotes);
  };

  const handleRemoveTag = (tagToRemove) => {
    const nextTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(nextTags);
    ReplaceTagsForNote(props.id, nextTags, props.setNotes);
  };

  useEffect(() => {
    const nextTitle = props.title || "";
    const nextContent = normalizeNoteContent(props.content || "");
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
    setUpdatedContent(nextContent);
  }, [props.title, props.content, editedTitle, updatedContent]);

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
    const nextContent = normalizeNoteContent(noteToSave.content ?? "");

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

  const flushPendingSave = () => {
    if (
      latestDraftRef.current.title !== lastSavedNoteRef.current.title ||
      latestDraftRef.current.content !== lastSavedNoteRef.current.content
    ) {
      saveChanges(latestDraftRef.current);
    }
  };

  return (
    <>
      <article className="note-card">
        <div className="note-header">
          <div className="note-header-left">
            <input
              className="note-title-input"
              data-testid="note-card-title-input"
              value={editedTitle}
              onChange={(event) => setEditedTitle(event.target.value)}
              onBlur={flushPendingSave}
              placeholder="Untitled note"
            />
          </div>

          <div className="note-header-right">
            <button
              type="button"
              className={`note-action-button${isFavorite ? " is-active" : ""}`}
              aria-label={isFavorite ? "Unfavorite note" : "Favorite note"}
              onClick={() => {
                const nextFavorite = !isFavorite;
                setIsFavorite(nextFavorite);
                UpdateNote({
                  id: props.id,
                  isFavorite: nextFavorite,
                  setNotes: props.setNotes,
                });
                handleMenuClose();
              }}
            >
              {isFavorite ? <HeartFillIcon /> : <HeartLineIcon />}
            </button>

            <button
              type="button"
              className={`note-action-button${isPinned ? " is-active" : ""}`}
              aria-label={isPinned ? "Unpin note" : "Pin note"}
              onClick={() => {
                const nextPinned = !isPinned;
                setIsPinned(nextPinned);
                PinNote(props.id, nextPinned, props.setNotes);
                handleMenuClose();
              }}
            >
              {isPinned ? <PushpinFillIcon /> : <PushpinLineIcon />}
            </button>

            <button
              type="button"
              id="menuIcon"
              aria-label="More note actions"
              aria-expanded={Boolean(anchorEl)}
              data-testid="note-card-menu-button"
              onClick={handleMenuOpen}
            >
              <MoreHorizIcon />
            </button>
          </div>
        </div>

        <div className="note-tag-row">
          {tags.map((tag) => (
            <span
              className={`tag-chip tag-chip-removable${props.tagColors?.[tag] ? " has-folder-color" : ""}`}
              key={tag}
              style={props.tagColors?.[tag] ? { "--folder-accent": props.tagColors[tag] } : undefined}
            >
              <FolderOutlinedIcon aria-hidden="true" />
              <span className="tag-chip-label">{tag}</span>
              <button
                type="button"
                className="tag-chip-remove"
                aria-label={`Remove ${tag} folder`}
                onClick={() => handleRemoveTag(tag)}
              >
                <CloseIcon />
              </button>
            </span>
          ))}

          {isAddingTag ? (
            <form className="note-tag-input-form" onSubmit={handleAddTag}>
              <input
                ref={tagInputRef}
                type="text"
                className="note-tag-input"
                placeholder="Folder name"
                value={tagDraft}
                onChange={(event) => setTagDraft(event.target.value)}
                onBlur={() => {
                  if (!tagDraft.trim()) setIsAddingTag(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setTagDraft("");
                    setIsAddingTag(false);
                  }
                }}
              />
              <button type="submit" className="note-tag-input-submit" aria-label="Add folder">
                <AddIcon />
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="note-tag-add"
              onClick={() => setIsAddingTag(true)}
            >
              <AddIcon />
              <span>Folder</span>
            </button>
          )}
        </div>

        <div className="note-content" data-testid="note-card-content">
          {noteType === "checklist" ? (
            <ChecklistEditor
              value={updatedContent}
              onChange={setUpdatedContent}
              onBlur={flushPendingSave}
              editorTestId="note-card-content-editor"
              className="note-detail-editor"
            />
          ) : (
            <PlainTextNoteEditor
              value={updatedContent}
              onChange={setUpdatedContent}
              onBlur={flushPendingSave}
              editorTestId="note-card-content-editor"
              placeholder="Start writing..."
              className="note-detail-editor"
            />
          )}
        </div>

        <div className="note-footer">
          <p className="note-save-state" data-state={saveState}>
            {saveLabel}
          </p>
          <p className="note-date" data-testid="note-card-date">
            {props.date}
          </p>
        </div>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            data-testid="note-card-menu-delete-button"
            onClick={() => {
              handleMenuClose();
              DeleteNote(props.id, props.setNotes);
            }}
          >
            <DeleteIcon style={{ marginRight: "10px" }} />
            Delete note
          </MenuItem>
        </Menu>
      </article>
    </>
  );
}

export default Note;
