import React, { useState, useEffect, useRef } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { v4 as uuidv4 } from "uuid";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import {
  UpdateNote,
  DeleteNote,
  PinNote,
  FavoriteNote,
} from "../utils/notesCrud";
import { useNavigate } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { ListItem, Menu, MenuItem } from "@mui/material";
import { EditNote } from "@mui/icons-material";
import DOMPurify from "dompurify";
import { generateColorForTag } from "../utils/generateColorForTag";
import TimeLineIcon from "remixicon-react/TimeLineIcon";
import NotificationLineIcon from "remixicon-react/NotificationLineIcon";
import { formatTimestampToDate } from "../utils/formatTimestampToDate";
import { useEditor } from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorProvider, useCurrentEditor, EditorContent } from "@tiptap/react";
import TextStyle from "@tiptap/extension-text-style";
import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import PushpinFillIcon from "remixicon-react/PushpinFillIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import HeartFillIcon from "remixicon-react/HeartFillIcon";
import SaveLineIcon from "remixicon-react/SaveLineIcon";

const AUTOSAVE_DELAY_MS = 2500;

function Note(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(props.isPinned);
  const [isFavorite, setIsFavorite] = useState(props.isFavorite);

  const [updatedContent, setUpdateContent] = useState("");
  const [contentChanged, setContentChanged] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const lastSavedContentRef = useRef(props.content || "");
  const queuedSaveRef = useRef(null);
  const isSavingRef = useRef(false);
  // Menu handlers
  const handleFabClick = (event) => setAnchorEl(event.currentTarget); // Open menu
  const handleMenuClose = () => setAnchorEl(null); // Close menu

  // console.log("note prop", props);

  const editor = useEditor({
    editorProps: {
      attributes: {
        class: "note-editor-content", // You can customize classes if needed
      },
    },
    extensions: [StarterKit, TaskList, TaskItem],
    content: props.content,
    onUpdate: ({ editor }) => {
      const nextContent = editor.getHTML();

      if (nextContent === lastSavedContentRef.current) {
        setUpdateContent("");
        setContentChanged(false);
        setSaveState("idle");
        return;
      }

      setUpdateContent(nextContent);
      setContentChanged(true);
      setSaveState("pending");
    },
  });

  useEffect(() => {
    lastSavedContentRef.current = props.content || "";
  }, [props.content]);

  const saveChanges = async (contentToSave = updatedContent) => {
    if (!contentToSave || contentToSave === lastSavedContentRef.current) {
      setContentChanged(false);
      setSaveState("idle");
      return;
    }

    if (isSavingRef.current) {
      queuedSaveRef.current = contentToSave;
      return;
    }

    isSavingRef.current = true;
    setSaveState("saving");

    try {
      await UpdateNote({
        id: props.id,
        newContent: contentToSave,
        setNotes: props.setNotes,
      });
      lastSavedContentRef.current = contentToSave;
      setUpdateContent("");
      setContentChanged(false);
      setSaveState("saved");
    } catch (error) {
      console.error("Error autosaving note:", error);
      setSaveState("error");
    } finally {
      isSavingRef.current = false;

      if (
        queuedSaveRef.current &&
        queuedSaveRef.current !== lastSavedContentRef.current
      ) {
        const queuedContent = queuedSaveRef.current;
        queuedSaveRef.current = null;
        saveChanges(queuedContent);
      }
    }
  };

  useEffect(() => {
    if (!contentChanged || !updatedContent) return;

    const autosaveTimer = setTimeout(() => {
      saveChanges(updatedContent);
    }, AUTOSAVE_DELAY_MS);

    return () => clearTimeout(autosaveTimer);
  }, [contentChanged, updatedContent]);

  return (
    <>
      <article className="note-card">
        <div className="note-header">
          <div className="note-header-left">
            {(contentChanged || saveState === "saving") && (
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
            <h1 className="note-title">{props.title}</h1>
          </div>

          <div className="note-header-right">
            {isFavorite && (
              <HeartFillIcon
                onClick={() => {
                  setIsFavorite((prev) => {
                    FavoriteNote({ id: props.id, isFavorite: !prev });
                    return !prev;
                  });
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
            <div id="menuIcon"  data-testid= "note-card-menu-button" >
              <MoreHorizIcon onClick={handleFabClick} />
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
                <MenuItem data-testid="note-card-menu-edit-button"  onClick={() => navigate(`/edit/${props.id}`)}>
                  <EditNote style={{ marginRight: "10px" }} />
                  Edit Note
                </MenuItem>
                <MenuItem data-testid="note-card-menu-delete-button"  onClick={() => DeleteNote(props.id, props.setNotes)}>
                  <DeleteIcon style={{ marginRight: "10px" }} />
                  Delete note
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
        <div className="note-content" data-testid="note-card-content">
          {editor && <EditorContent editor={editor} />}
        </div>

        <div className="note-tags">
          {props.tags &&
            props.tags.map((tagId, index) => {
              const tag = props.fetchedTags.find((t) => t.id === tagId);
              return tag ? (
                <p
                  key={index}
                  className="tag-badge"
                  style={{
                    backgroundColor: tag.tagColor,
                    color: "black",
                    cursor: "default",
                  }}
                >
                  {tag.tagName}
                </p>
              ) : null;
            })}
        </div>
        <div className="note-date">
          {!props.reminderDateTime && !props.dueDateTime && (
            <p className="date-time-text" data-testid="note-card-date">
              {props.date}
            </p>
          )}

          <div className="date-inner-container">
            {props.reminderDateTime && (
              <p className="date-time-text">
                <NotificationLineIcon className="IconButton" />
                {props.reminderDateTime
                  ? props.reminderDateTime.toDate().toLocaleString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: false,
                    })
                  : "No Reminder Date"}
              </p>
            )}

            {props.dueDateTime && (
              <p className="date-time-text">
                <TimeLineIcon className="IconButton" />
                {props.dueDateTime
                  ? props.dueDateTime.toDate().toLocaleString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      hour: "numeric",
                      minute: "numeric",
                      hour12: false,
                    })
                  : "No Due Date"}
              </p>
            )}
          </div>
        </div>
      </article>
    </>
  );
}

export default Note;
