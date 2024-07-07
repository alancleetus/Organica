import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import AddIcon from "@mui/icons-material/Add";
import { Fab } from "@mui/material";
import { Zoom } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

function CreateArea(props) {
  // State hooks to manage title, content, and visibility
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [visible, setVisible] = React.useState(false);

  const [isList, setIsList] = React.useState(false);

  // Function to expand the note taking area on focus
  const handleFocusIn = () => {
    setVisible(true);
  };

  // Function to handle focus out
  const handleBlur = (event) => {
    // Check if the blur event is related to a child element of the form
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setVisible(false);
    }
  };
  const handleListToggle = () => {
    setIsList((prevValue) => !prevValue);
  };
  useEffect(() => {
    if (isList) {
      setContent((prevContent) => {
        // Split the text into lines
        const lines = prevContent.split("\n");

        // Add a bullet point to each line
        const bulletedLines = lines.map((line) => "• " + line);

        // Join the lines back together
        const outputText = bulletedLines.join("\n");

        return outputText;
      });
    } else {
      setContent((prevContent) => {
        // Remove bullet points from each line if present
        const lines = prevContent.split("\n");
        const unbulletedLines = lines.map((line) =>
          line.startsWith("• ") ? line.substring(2) : line
        );
        return unbulletedLines.join("\n");
      });
    }
  }, [isList]);

  const handleContentChange = (e) => {
    const newText = e.target.value;
    if (isList) {
      const lines = newText.split("\n");
      const lastLineIndex = lines.length - 1;
      if (lines[lastLineIndex] && !lines[lastLineIndex].startsWith("• ")) {
        lines[lastLineIndex] = "• " + lines[lastLineIndex];
      }
      setContent(lines.join("\n"));
    } else {
      setContent(newText);
    }
  };
  return (
    <div>
      <form
        className="create-note"
        onFocus={handleFocusIn}
        onBlur={handleBlur}
        tabIndex={-1} // Make the form focusable
      >
        {/* Conditionally render the title input with a Zoom animation */}
        {visible && (
          <Zoom in={visible}>
            <input
              name="title"
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </Zoom>
        )}
        <textarea
          name="content"
          placeholder="Take a note..."
          rows={visible ? "3" : "1"}
          onChange={handleContentChange}
          value={content}
        />

        <Zoom
          in={visible}
          onClick={handleListToggle}
          style={{ color: isList && "var(--primary-color)" }}
        >
          <FormatListBulletedIcon></FormatListBulletedIcon>
        </Zoom>

        {/* Render the floating action button with a Zoom animation */}
        <Zoom in={visible}>
          <Fab
            onClick={(e) => {
              e.preventDefault();
              setTitle("");
              setContent("");
              handleBlur(e);
              return props.addNote(uuidv4(), title, content);
            }}
          >
            <AddIcon></AddIcon>
          </Fab>
        </Zoom>
      </form>
    </div>
  );
}

export default CreateArea;
