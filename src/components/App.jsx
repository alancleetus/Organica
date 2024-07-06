import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import notesList from "/notes";
import CreateArea from "./CreateArea";

let App = () => {
  // App component Start

  // State hook to manage the list of notes, initialized with notesList
  const [notes, setNotes] = React.useState([...notesList]);

  // Function to add a new note to the list
  function addNote(key, title, content) {
    // Update the notes state by adding the new note at the beginning of the array
    return setNotes((prevValue) => {
      return [{ key: key, title: title, content: content }, ...prevValue];
    });
  }

  // Function to remove a note from the list by its key
  function removeNote(key) {
    // Update the notes state by filtering out the note with the matching key
    return setNotes((prevValue) => {
      return prevValue.filter((note, index) => {
        return key !== note.key;
      });
    });
  }

  return (
    <>
      <Header />

      {/* Render the CreateArea component and pass the addNote function as a prop */}
      <CreateArea addNote={addNote} />

      {/* Create a Note component for each note in the notesList*/}
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
