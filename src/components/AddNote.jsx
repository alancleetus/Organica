import React, { act, useEffect, useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./Firebase";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Add this line for styling
import { CreateNote, fetchAllTags } from "../utils/notesCrud";
import TipTapEditor from "./TiptapEditor";
import TimeLineIcon from "remixicon-react/TimeLineIcon";
import NotificationLineIcon from "remixicon-react/NotificationLineIcon";

import ArrowLeftSLineIcon from "remixicon-react/ArrowLeftSLineIcon";
import { generateColorForTag } from "../utils/generateColorForTag";

function AddNote() {
  const navigate = useNavigate();
  const [editedTitle, setEditedTitle] = useState("");
  const [user, setUser] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [reminderDate, setReminderDate] = useState(null);
  const [editorContent, setEditorContent] = useState(null);
  const [tags, setTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);

  /****  Redirect to login if not authenticated ****/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  /**** Fetch Tags for the User ****/
  useEffect(() => {
    if (user) {
      fetchAllTags(user.uid)
        .then((fetchedTags) => {
          setTags(fetchedTags);
        })
        .catch((error) => console.error("Error fetching tags:", error));
    }
  }, [user]);

  // useEffect(() => {
  //   console.log("editorContent:", editorContent);
  // }, [editorContent]);

  const handleSaveClick = () => {
    // Create a new note
    CreateNote(user, editedTitle, editorContent, dueDate, reminderDate).then(
      () => {
        navigate("/main"); // Redirect to main page after creation
      }
    );
  };

  const handleCancelClick = () => {
    navigate("/main"); // Redirect without saving
  };

  const handleTagClick = (tag) => {
    setActiveTags((prevTags) => {
      if (prevTags.includes(tag)) {
        // If the tag is already active, remove it
        return prevTags.filter((t) => t !== tag);
      } else {
        // If the tag is not active, add it
        return [...prevTags, tag];
      }
    });
  };

  return (
    <div className="note-page">
      <div className="note-page-header">
        <button className="note-page-back-button" onClick={handleCancelClick}>
          <ArrowLeftSLineIcon />
        </button>
        <input
          className="titleInput"
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          placeholder="New Task"
        />
      </div>

      <div className="note-page-body">
        <div className="note-page-tag-selector">
          <p>Tags:</p>
          {tags.length > 0 ? (
            tags.map((tag, index) => (
              <p
                key={index}
                className={
                  activeTags.includes(tag) ? "tag-badge active" : "tag-badge"
                }
                onClick={() => handleTagClick(tag)}
                style={{
                  backgroundColor: activeTags.includes(tag)
                    ? generateColorForTag(tag)
                    : "var(--badge-bg-color)",
                }}
              >
                {tag}
              </p>
            )) // Render each tag in a <p> tag
          ) : (
            <p>No tags available</p>
          )}
        </div>
        <div className="note-page-editor">
          <TipTapEditor setEditorContent={setEditorContent} />
        </div>
      </div>

      <div className="date-time-picker">
        <div>
          <TimeLineIcon className="IconButton" />
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Due Date"
          />
        </div>
        <div>
          <NotificationLineIcon className="IconButton" />
          <DatePicker
            selected={reminderDate}
            onChange={(date) => setReminderDate(date)}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Reminder Date"
          />
        </div>
      </div>

      <div className="note-page-actions">
        <button
          onClick={handleSaveClick}
          className="notes-page-save-button"
          variant="contained"
        >
          Create Note
        </button>
      </div>
    </div>
  );
}

export default AddNote;
