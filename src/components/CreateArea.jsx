import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Fab } from "@mui/material";
import { Zoom } from "@mui/material";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

import CheckboxList from "./DNDCheckboxList";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";

function CreateArea(props) {
  // State hooks to manage title, content, and visibility
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const [visible, setVisible] = React.useState(false);
  const [isList, setIsList] = React.useState(false);

  // Function to expand the note taking area on focus
  const handleFocusIn = () => setVisible(true);

  // Function to handle focus out
  const handleBlur = (event) => {
    // Check if the blur event is related to a child element of the form
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setVisible(false);
    }
  };

  const handleListToggle = () => setIsList((prevValue) => !prevValue);

  const handleContentChange = (e) => {
    const newText = e.target.value;

    setContent(newText);
  };

  let [itemsArray, setItemsArray] = useState([]);
  const updateItemsArray = (updatedItemsArray) => {
    setItemsArray(updatedItemsArray);
    console.log("updated list");
  };
  const addNewItem = () => {
    const newItem = {
      id: "" + (itemsArray.length + 1),
      text: "",
      checked: false,
    };
    const updatedItems = [...itemsArray, newItem];
    setItemsArray(updatedItems);
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
              type="text"
            />
          </Zoom>
        )}

        {!isList ? (
          <textarea
            name="content"
            placeholder="Take a note..."
            rows={visible ? "3" : "1"}
            onChange={handleContentChange}
            value={content}
          />
        ) : (
          <>
            <CheckboxList
              itemsArray={itemsArray}
              updateItemsArray={updateItemsArray}
              editable="true"
            />
            <Grid
              container
              spacing={2}
              style={{
                marginLeft: "20px",
                color: "var(--primary-muted-color)",
                display: visible ? "" : "none",
              }}
              onClick={addNewItem}
            >
              <Grid item xs={1}>
                <AddIcon style={{ flexGrow: 0 }} />
              </Grid>
              <Grid item xs={10}>
                <p style={{ flexGrow: 2 }}>add new item</p>
              </Grid>
            </Grid>
          </>
        )}

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
              setItemsArray([]);
              handleBlur(e);

              return isList
                ? props.addNote(uuidv4(), title, itemsArray, isList)
                : props.addNote(uuidv4(), title, content, isList);
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
