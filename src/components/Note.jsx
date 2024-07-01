import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
function note(props) {
  return (
    <div className="note">
      <h1>{props.title}</h1>
      <p>{props.content}</p>
      <button
        onClick={() => {
          return props.removeNote(props.id);
        }}
      >
        <DeleteIcon />
      </button>
    </div>
  );
}

export default note;
