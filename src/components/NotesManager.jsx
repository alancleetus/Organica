import { useState, useEffect } from "react";
import Note from "./Note";
import CreateArea from "./CreateArea";
import { db } from "./Firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";

function NotesManager() {
  const [notes, setNotes] = useState([]);

  // Fetch notes from Firestore when the component mounts
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesCollection = collection(db, "notes");
        const notesSnapshot = await getDocs(notesCollection);
        const notesList = notesSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setNotes(notesList);
        console.log("Fetched notes:", notesList);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchNotes();
  }, []);

  const addNote = async (key, title, content) => {
    const note = { key, title, content };
    try {
      const docRef = await addDoc(collection(db, "notes"), note);
      setNotes((prevNotes) => [{ ...note, id: docRef.id }, ...prevNotes]);
      console.log("Added note:", { ...note, id: docRef.id });
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  const removeNote = async (id) => {
    try {
      // Log the ID of the note to be removed
      console.log("Attempting to remove note with id:", id);

      // Ensure the document reference is correct
      const noteRef = doc(db, "notes", id);
      console.log("Document reference:", noteRef);

      // Delete the document from Firestore
      await deleteDoc(noteRef);
      console.log("Document deleted from Firestore");

      // Update the state to remove the note from the UI
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
      console.log("Removed note with id:", id);
    } catch (error) {
      // Log any errors encountered during the process
      console.error("Error removing note:", error);
    }
  };

  return (
    <>
      <CreateArea addNote={addNote} />
      <div className="centered-notes-container">
        {notes.map((note) => (
          <Note
            key={note.id}
            id={note.id}
            title={note.title}
            content={note.content}
            removeNote={removeNote}
          />
        ))}
      </div>
    </>
  );
}

export default NotesManager;
