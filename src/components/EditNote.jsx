import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  UpdateNote,
  DeleteNote,
  ReadNoteById,
  fetchAllTags,
} from "../utils/notesCrud";

import TipTapEditor from "./TiptapEditor";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Add this line for styling

import TimeLineIcon from "remixicon-react/TimeLineIcon";
import NotificationLineIcon from "remixicon-react/NotificationLineIcon";
import ArrowLeftSLineIcon from "remixicon-react/ArrowLeftSLineIcon";
import { generateColorForTag } from "../utils/generateColorForTag";

function EditNote({ theme, toggleTheme }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editorContent, setEditorContent] = useState("<p></p>");
  const [tags, setTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);

  const [user, setUser] = useState(null);
  const [dueDateTime, setDueDateTime] = useState(null);
  const [reminderDateTime, setReminderDateTime] = useState(null);
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

  useEffect(() => {
    const updateHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    // Initial setup
    updateHeight();

    // Re-calculate on resize
    window.addEventListener("resize", updateHeight);

    return () => {
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const handleSaveClick = async () => {
    try {
      await UpdateNote({
        id,
        newTitle: editedTitle,
        newContent: editorContent,
        tags: activeTags,
        reminderDateTime,
        dueDateTime,
      }); // Wait for the update to finish
      navigate("/main"); // Redirect back to main page
    } catch (error) {
      console.error("Error updating note:", error);
      // Handle the error (e.g., show a toast notification)
    }
  };

  const handleCancelClick = () => {
    navigate("/main"); // Redirect without saving
  };

  // const handleDeleteClick = () => {
  //   DeleteNote(id, setNote);
  //   navigate("/main"); // Redirect after deletion
  // };

  if (!note) return <p>Loading...</p>;

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
          <TipTapEditor
            setEditorContent={setEditorContent}
            initialContent={editorContent}
          />
        </div>
      </div>

      <div className="date-time-picker">
        <div>
          <TimeLineIcon className="IconButton" />

          <DatePicker
            selected={dueDateTime}
            onChange={(date) => setDueDateTime(date)}
            showTimeSelect
            dateFormat="Pp"
            placeholderText="Due Date"
          />
        </div>
        <div>
          <NotificationLineIcon className="IconButton" />
          <DatePicker
            selected={reminderDateTime}
            onChange={(date) => setReminderDateTime(date)}
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
          Save Note
        </button>
      </div>
    </div>
  );
}

export default EditNote;
