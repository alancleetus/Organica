import React, { useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import FileCopyOutlinedIcon from "@mui/icons-material/FileCopyOutlined";
import CenterFocusStrongOutlinedIcon from "@mui/icons-material/CenterFocusStrongOutlined";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { Menu, MenuItem } from "@mui/material";
import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import PushpinFillIcon from "remixicon-react/PushpinFillIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import HeartFillIcon from "remixicon-react/HeartFillIcon";
import CalendarEventLineIcon from "remixicon-react/CalendarEventLineIcon";
import AlarmLineIcon from "remixicon-react/AlarmLineIcon";
import { PinNote, UpdateNote, ReplaceTagsForNote } from "../utils/notesCrud";
import PlainTextNoteEditor from "./PlainTextNoteEditor";
import ChecklistEditor from "./ChecklistEditor";
import { normalizeNoteContent, resolveNoteType, trimNoteContent } from "../utils/noteContent";
import { formatDate } from "../utils/dateFormat";
import { RECURRENCE_OPTIONS } from "../utils/recurrence";

const AUTOSAVE_DELAY_MS = 1200;

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

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(updatedContent);
    } catch (error) {
      console.error("Error copying note text:", error);
    }
  };

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

  const [dueDateTime, setDueDateTimeState] = useState(props.dueDateTime || "");
  const [reminderDateTime, setReminderDateTimeState] = useState(props.reminderDateTime || "");
  const [recurrenceRule, setRecurrenceRuleState] = useState(props.recurrenceRule || "");

  useEffect(() => setDueDateTimeState(props.dueDateTime || ""), [props.dueDateTime]);
  useEffect(() => setReminderDateTimeState(props.reminderDateTime || ""), [props.reminderDateTime]);
  useEffect(() => setRecurrenceRuleState(props.recurrenceRule || ""), [props.recurrenceRule]);

  // A native datetime-local input fires onChange with value === "" for
  // every incomplete intermediate keystroke while a date is being typed
  // segment by segment (e.g. right after just the month is entered) —
  // not only when the field is deliberately cleared. Persisting on that
  // intermediate empty value silently wiped out a due date the user was
  // still in the middle of typing. Only a complete value gets saved here;
  // an actual clear goes through the dedicated buttons below instead,
  // which is the only place null is ever sent for these two fields.
  const handleDueDateChange = (value) => {
    setDueDateTimeState(value);
    if (!value) return;
    UpdateNote({ id: props.id, dueDateTime: value, setNotes: props.setNotes });
  };

  // Clearing the due date drops any recurrence with it — a repeat rule
  // with nothing to repeat from doesn't mean anything.
  const handleClearDueDate = () => {
    setDueDateTimeState("");
    setRecurrenceRuleState("");
    UpdateNote({ id: props.id, dueDateTime: null, recurrenceRule: null, setNotes: props.setNotes });
  };

  const handleReminderDateChange = (value) => {
    setReminderDateTimeState(value);
    if (!value) return;
    UpdateNote({ id: props.id, reminderDateTime: value, setNotes: props.setNotes });
  };

  const handleClearReminderDate = () => {
    setReminderDateTimeState("");
    UpdateNote({ id: props.id, reminderDateTime: null, setNotes: props.setNotes });
  };

  const handleRecurrenceChange = (value) => {
    setRecurrenceRuleState(value);
    UpdateNote({ id: props.id, recurrenceRule: value || null, setNotes: props.setNotes });
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
      // Trimmed only for what actually reaches Firestore — comparisons
      // above and lastSavedNoteRef below stay keyed on the untrimmed
      // value so they still match the live editor state exactly. If
      // they didn't, a trailing space the trim just removed would make
      // updatedContent/editedTitle look permanently "still different
      // from last save," and autosave would fire on a loop forever.
      await UpdateNote({
        id: props.id,
        newTitle: nextTitle.trim(),
        newContent: trimNoteContent(nextContent),
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

  // For checklist actions with no text field to blur (toggling, removing,
  // reordering) — saves the content ChecklistEditor just produced directly,
  // rather than reading it back out of state, since setUpdatedContent's
  // update wouldn't have landed yet if this ran right after it.
  const handleChecklistImmediateSave = (content) => {
    saveChanges({ title: latestDraftRef.current.title, content });
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
              readOnly={props.isReadOnly}
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
                list={`note-folder-suggestions-${props.id}`}
                autoComplete="off"
              />
              <datalist id={`note-folder-suggestions-${props.id}`}>
                {(props.existingFolders || [])
                  .filter((folderName) => !tags.includes(folderName))
                  .map((folderName) => (
                    <option key={folderName} value={folderName} />
                  ))}
              </datalist>
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

        <div className="note-schedule-row">
          <label className="note-schedule-field">
            <CalendarEventLineIcon aria-hidden="true" />
            <span>Due</span>
            <input
              type="datetime-local"
              value={dueDateTime}
              onChange={(event) => handleDueDateChange(event.target.value)}
              disabled={props.isReadOnly}
              data-testid="note-due-date-input"
            />
            {dueDateTime && !props.isReadOnly && (
              <button
                type="button"
                className="note-schedule-clear"
                aria-label="Clear due date"
                onClick={handleClearDueDate}
              >
                <CloseIcon />
              </button>
            )}
          </label>

          <label className="note-schedule-field">
            <AlarmLineIcon aria-hidden="true" />
            <span>Remind</span>
            <input
              type="datetime-local"
              value={reminderDateTime}
              onChange={(event) => handleReminderDateChange(event.target.value)}
              disabled={props.isReadOnly}
              data-testid="note-reminder-date-input"
            />
            {reminderDateTime && !props.isReadOnly && (
              <button
                type="button"
                className="note-schedule-clear"
                aria-label="Clear reminder"
                onClick={handleClearReminderDate}
              >
                <CloseIcon />
              </button>
            )}
          </label>

          {dueDateTime && (
            <label className="note-schedule-field note-schedule-recurrence">
              <select
                value={recurrenceRule}
                onChange={(event) => handleRecurrenceChange(event.target.value)}
                disabled={props.isReadOnly}
                data-testid="note-recurrence-select"
              >
                {RECURRENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="note-content" data-testid="note-card-content">
          {noteType === "checklist" ? (
            <ChecklistEditor
              value={updatedContent}
              onChange={setUpdatedContent}
              onImmediateSave={handleChecklistImmediateSave}
              onBlur={flushPendingSave}
              editorTestId="note-card-content-editor"
              className="note-detail-editor"
              readOnly={props.isReadOnly}
            />
          ) : (
            <PlainTextNoteEditor
              value={updatedContent}
              onChange={setUpdatedContent}
              onBlur={flushPendingSave}
              editorTestId="note-card-content-editor"
              placeholder="Start writing..."
              className="note-detail-editor"
              readOnly={props.isReadOnly}
            />
          )}
        </div>

        <div className="note-footer">
          <p className="note-save-state" data-testid="note-card-save-state" data-state={saveState}>
            {props.isReadOnly ? "Read-only" : saveLabel}
          </p>
          <p className="note-date" data-testid="note-card-date">
            Created {formatDate(props.createdDate, props.dateFormat)}
            {props.updatedDate && props.updatedDate !== props.createdDate && (
              <> &middot; Updated {formatDate(props.updatedDate, props.dateFormat)}</>
            )}
          </p>
        </div>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            data-testid="note-card-menu-focus-button"
            onClick={() => {
              handleMenuClose();
              props.onToggleFocus?.();
            }}
          >
            <CenterFocusStrongOutlinedIcon style={{ marginRight: "10px" }} />
            {props.isFocusNote ? "Unpin focus note" : "Pin as focus note"}
          </MenuItem>
          <MenuItem
            data-testid="note-card-menu-copy-button"
            onClick={() => {
              handleMenuClose();
              handleCopyText();
            }}
          >
            <ContentCopyOutlinedIcon style={{ marginRight: "10px" }} />
            Copy text
          </MenuItem>
          <MenuItem
            data-testid="note-card-menu-duplicate-button"
            onClick={() => {
              handleMenuClose();
              props.onDuplicate?.();
            }}
          >
            <FileCopyOutlinedIcon style={{ marginRight: "10px" }} />
            Duplicate note
          </MenuItem>
          <MenuItem
            data-testid="note-card-menu-archive-button"
            onClick={() => {
              handleMenuClose();
              props.onArchive?.();
            }}
          >
            {props.isArchived ? (
              <UnarchiveOutlinedIcon style={{ marginRight: "10px" }} />
            ) : (
              <ArchiveOutlinedIcon style={{ marginRight: "10px" }} />
            )}
            {props.isArchived ? "Unarchive note" : "Archive note"}
          </MenuItem>
          <MenuItem
            data-testid="note-card-menu-delete-button"
            onClick={() => {
              handleMenuClose();
              props.onDelete?.();
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
