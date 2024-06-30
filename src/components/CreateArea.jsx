import React from "react";
import { v4 as uuidv4 } from "uuid";

function CreateArea(props) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  return (
    <div>
      <form>
        <input
          name="title"
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
        <textarea
          name="content"
          placeholder="Take a note..."
          rows="3"
          onChange={(e) => setContent(e.target.value)}
          value={content}
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            setTitle("");
            setContent("");
            return props.addNote(uuidv4(), title, content);
          }}
        >
          +
        </button>
      </form>
    </div>
  );
}

export default CreateArea;
