import React, { useState, useEffect } from "react";
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
function Note(props) {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(props.isPinned);
  const [isFavorite, setIsFavorite] = useState(props.isFavorite);

  const [updatedContent, setUpdateContent] = useState("");
  const [contentChanged, setContentChanged] = useState(false);
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
      setUpdateContent(editor.getHTML());
      setContentChanged(true);
    },
  });

  const saveChanges = () => {
    setContentChanged(false);
    UpdateNote({ id: props.id, newContent: updatedContent });
    setUpdateContent("");
  };
  return (
    <>
      <div className="note">
        <div className="note-header">
          <div className="note-header-left">
            {contentChanged && (
              <SaveLineIcon
                color="var(--primary-muted-color)"
                onClick={() => saveChanges()}
              />
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
                    PinNote({ id: props.id, isPinned: !prev });
                    return !prev;
                  });
                }}
              />
            )}
            <div id="menuIcon">
              <MoreHorizIcon onClick={handleFabClick} />
              {/* Menu for FAB options */}
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                id="test"
              >
                <MenuItem
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
                      PinNote({ id: props.id, isPinned: !prev });
                      return !prev;
                    });
                  }}
                >
                  <PushpinLineIcon style={{ marginRight: "10px" }} />
                  Pin Note
                </MenuItem>
                <MenuItem onClick={() => navigate(`/note/${props.id}`)}>
                  <EditNote style={{ marginRight: "10px" }} />
                  Edit Note
                </MenuItem>
                <MenuItem onClick={() => DeleteNote(props.id, props.setNotes)}>
                  <DeleteIcon style={{ marginRight: "10px" }} />
                  Delete note
                </MenuItem>
              </Menu>
            </div>
          </div>
        </div>
        <div className="note-content">
          {editor && <EditorContent editor={editor} />}
        </div>

        <div className="note-tags">
          {props.tags &&
            props.tags.map((tag, index) => (
              <p
                key={index}
                className={"tag-badge"}
                style={{
                  backgroundColor: generateColorForTag(tag),
                  color: "black",
                  cursor: "default",
                }}
              >
                {tag}
              </p>
            ))}
        </div>
        <div className="note-date">
          {!props.reminderDateTime && !props.dueDateTime && (
            <p className="date-time-text">{props.date}</p>
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
      </div>
    </>
  );
}

export default Note;
