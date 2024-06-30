import React from "react";

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
        X
      </button>
    </div>
  );
}

export default note;
