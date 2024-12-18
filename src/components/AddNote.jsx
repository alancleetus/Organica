import React, { act, useEffect, useState } from "react";
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
import { CreateTag, FetchTagsByUser } from "../utils/tagsCrud";
import AddLineIcon from "remixicon-react/AddLineIcon";
function AddNote() {
  const navigate = useNavigate();
  const [editedTitle, setEditedTitle] = useState("");
  const [user, setUser] = useState(null);
  const [dueDateTime, setDueDateTime] = useState(null);
  const [reminderDateTime, setReminderDateTime] = useState(null);
  const [editorContent, setEditorContent] = useState(null);
  const [tags, setTags] = useState([]);
  const [activeTags, setActiveTags] = useState([]);

  const [tagInput, setTagInput] = useState(""); // Input field value for tags
  const [isLoading, setIsLoading] = useState(false); // Loading state for tag creation

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
      FetchTagsByUser(user.uid)
        .then((fetchedTags) => {
          setTags(fetchedTags);
        })
        .catch((error) => console.error("Error fetching tags:", error));
    }
  }, [user]);

  useEffect(() => {
    console.log("date due:", dueDateTime);
    dueDateTime && console.log(typeof dueDateTime);
    dueDateTime && console.log(dueDateTime instanceof Date);
    // console.log("date due:", formatTimestampToDate(props.dueDate.seconds));
  }, [dueDateTime]);
  const handleSaveClick = () => {
    // Create a new note
    CreateNote({
      user,
      title: editedTitle,
      content: editorContent,
      tags: activeTags,
      reminderDateTime,
      dueDateTime,
    }).then(() => {
      navigate("/main"); // Redirect to main page after creation
    });
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

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = async (e) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      const trimmedInput = tagInput.trim();

      // Check if tag already exists
      const existingTag = tags.find(
        (tag) => tag.tagName.toLowerCase() === trimmedInput.toLowerCase()
      );

      if (existingTag) {
        // Add existing tag to activeTags
        handleTagClick(existingTag);
      } else if (user) {
        // Create a new tag
        setIsLoading(true);
        try {
          const newTag = await CreateTag({
            userId: user.uid,
            tagName: trimmedInput,
            tagColor: generateColorForTag(trimmedInput),
          });

          setTags((prevTags) => [...prevTags, newTag]);
          handleTagClick(newTag);
        } catch (error) {
          console.error("Error creating tag:", error);
        } finally {
          setIsLoading(false);
        }
      }
      setTagInput(""); // Clear input
    }
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
          <div className="tags-list">
            <p>Tags:</p>
            {tags.map((tag) => (
              <p
                key={tag.id}
                className={
                  activeTags.includes(tag.tagName)
                    ? "tag-badge active"
                    : "tag-badge"
                }
                onClick={() => handleTagClick(tag.tagName)}
                style={{
                  backgroundColor: activeTags.includes(tag.tagName)
                    ? tag.tagColor
                    : "#ccc",
                }}
              >
                {tag.tagName}
              </p>
            ))}
          </div>
          <div className="add-tag-button">
            <input
              type="text"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add a tag"
              disabled={isLoading}
            />
            <button
              className="add-tag-plus-button"
              onClick={async () => {
                if (tagInput.trim() !== "") {
                  const trimmedInput = tagInput.trim();

                  // Check if tag already exists
                  const existingTag = tags.find(
                    (tag) =>
                      tag.tagName.toLowerCase() === trimmedInput.toLowerCase()
                  );

                  if (existingTag) {
                    // Add existing tag to activeTags
                    handleTagClick(existingTag.tagName);
                  } else if (user) {
                    // Create a new tag
                    setIsLoading(true);
                    try {
                      const newTag = await CreateTag({
                        userId: user.uid,
                        tagName: trimmedInput,
                        tagColor: generateColorForTag(trimmedInput),
                      });

                      setTags((prevTags) => [...prevTags, newTag]);
                      handleTagClick(newTag);
                    } catch (error) {
                      console.error("Error creating tag:", error);
                    } finally {
                      setIsLoading(false);
                    }
                  }
                  setTagInput(""); // Clear input
                }
              }}
              disabled={isLoading}
            >
              <AddLineIcon />
            </button>
            {isLoading && <p>Loading...</p>}
          </div>
        </div>

        <div className="note-page-editor">
          <TipTapEditor setEditorContent={setEditorContent} />
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
          Create Note
        </button>
      </div>
    </div>
  );
}

export default AddNote;
