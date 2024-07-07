import { useState, useEffect } from "react";
import Note from "./Note";
import CreateArea from "./CreateArea";
import { db, auth } from "./Firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import Header from "./Header";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function NotesManager({ theme, toggleTheme }) {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // Redirect to login if not authenticated
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

  // Fetch notes from Firestore when the component mounts
  useEffect(() => {
    const fetchNotes = async () => {
      if (user) {
        try {
          const notesCollection = collection(db, "notes");
          const q = query(notesCollection, where("userId", "==", user.uid));
          const notesSnapshot = await getDocs(q);
          const notesList = notesSnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setNotes(notesList);
          console.log("Fetched notes:", notesList);
        } catch (error) {
          console.error("Error fetching notes:", error);
        }
      }
    };

    fetchNotes();
  }, [user]);

  const addNote = async (key, title, content) => {
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    const note = { key, title, content, userId: user.uid };
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
      <Header toggleTheme={toggleTheme} theme={theme} />
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
