import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import notesList from "/notes";
import CreateArea from "./CreateArea";

let App = () => {
  const [notes, setNotes] = React.useState([...notesList]);

  function addNote(key, title, content) {
    return setNotes((prevValue) => {
      return [{ key: key, title: title, content: content }, ...prevValue];
    });
  }
  function removeNote(key) {
    return setNotes((prevValue) => {
      return prevValue.filter((note, index) => {
        return key !== note.key;
      });
    });
  }

  return (
    <>
      <Header />
      <CreateArea addNote={addNote} />
      {notes.map((note) => (
        <Note
          key={note.key}
          id={note.key}
          title={note.title}
          content={note.content}
          removeNote={removeNote}
        />
      ))}
      <Footer />
    </>
  );
};

export default App;
