import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import Header from "./Header";
import Note from "./Note";
import CreateArea from "./CreateArea";
import CheckboxList from "./DNDCheckboxList";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

function NotesManager({ theme, toggleTheme }) {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

  /*****  Fetch notes from Firestore when the component mounts *****/
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

  const addNote = async (key, title, content, isList = false) => {
    // Check if user logged in
    if (!user) {
      console.error("User is not authenticated");
      return;
    }

    //removes empty lines
    if (isList) {
      const updatedContent = content.filter((item) => item.text != "");
      content = updatedContent;
    }

    // Create new note obj
    const note = { key, title, content, isList, userId: user.uid };

    // Add note to firebase db
    try {
      const docRef = await addDoc(collection(db, "notes"), note);
      // Add note to start of Notes arr
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

  const editNote = async (id, newTitle, newContent) => {
    try {
      // Ensure the document reference is correct
      const noteRef = doc(db, "notes", id);
      console.log("Document reference:", noteRef);

      // Update the document in Firestore
      await updateDoc(noteRef, {
        title: newTitle,
        content: newContent,
      });
      console.log("Document updated in Firestore");

      // Update the state to reflect the changes in the UI
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === id
            ? { ...note, title: newTitle, content: newContent }
            : note
        )
      );
      console.log("Updated note with id:", id);
    } catch (error) {
      console.error("Error updating note:", error);

      // // Update UI even if offline
      // setNotes((prevNotes) =>
      //   prevNotes.map((note) =>
      //     note.id === id
      //       ? { ...note, title: newTitle, content: newContent }
      //       : note
      //   )
      // );
    }
  };

  return (
    <>
      <Header toggleTheme={toggleTheme} theme={theme} />
      <CreateArea addNote={addNote} />

      {/* <CheckboxList
        itemsArray={itemsArray}
        updateItemsArray={updateItemsArray}
      /> */}
      {/* <div className="centered-notes-container"> */}
      {/* <div>
        {notes.map((note) => (
          <Note
            key={note.id}
            id={note.id}
            title={note.title}
            content={note.content}
            isList={note.isList}
            removeNote={removeNote}
            editNote={editNote}
          />
        ))}
      </div> */}

      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 650: 2, 900: 3, 1200: 4 }}
      >
        <Masonry>
          {notes.map((note) => (
            <Note
              key={note.id}
              id={note.id}
              title={note.title}
              content={note.content}
              isList={note.isList}
              removeNote={removeNote}
              editNote={editNote}
            />
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </>
  );
}

export default NotesManager;
