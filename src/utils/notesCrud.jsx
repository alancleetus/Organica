import { db } from "../components/Firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import isEqual from "lodash/isEqual";
import { v4 as uuidv4 } from "uuid";

export const CreateNote = async (
  user,
  title,
  content,
  isList = false,
  setNotes
) => {
  if (!user) {
    console.error("User is not authenticated");
    return;
  }

  const timestamp = new Date(); // Current date and time

  const note = {
    key: uuidv4(),
    title,
    content,
    isList,
    userId: user.uid,
    timestamp,
  };

  try {
    const docRef = await addDoc(collection(db, "notes"), note);
    console.log("Added note:", { ...note, id: docRef.id });
  } catch (error) {
    console.error("Error adding note:", error);
  }
};

export const UpdateNote = async (id, newTitle, newContent, setNotes) => {
  try {
    const noteRef = doc(db, "notes", id); // Get the document reference
    const currentNote = await getDoc(noteRef); // Fetch the current note data

    if (!currentNote.exists()) {
      console.error("Note does not exist");
      return;
    }

    const noteData = currentNote.data();
    if (noteData.title === newTitle && isEqual(noteData.content, newContent)) {
      console.log("No changes detected, skipping update");
      return;
    }

    await updateDoc(noteRef, { title: newTitle, content: newContent }); // Update Firestore
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, title: newTitle, content: newContent }
          : note
      )
    ); // Update state
    console.log("Updated note with id:", id);
  } catch (error) {
    console.error("Error updating note:", error);
  }
};

export const DeleteNote = async (id, setNotes) => {
  try {
    const noteRef = doc(db, "notes", id); // Get the document reference
    await deleteDoc(noteRef); // Delete Firestore document
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id)); // Update state
    console.log("Removed note with id:", id);
  } catch (error) {
    console.error("Error removing note:", error);
  }
};

export const ReadNoteById = async (id) => {
  try {
    const noteRef = doc(db, "notes", id); // Get the document reference
    const noteDoc = await getDoc(noteRef); // Fetch the document
    if (noteDoc.exists()) {
      return { id: noteDoc.id, ...noteDoc.data() }; // Return note with ID
    } else {
      console.error("Note not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching note:", error);
    throw error;
  }
};
