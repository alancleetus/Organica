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
  setNotes,
  tags = [],
  dueDateTime = null,
  reminderDateTime = null
) => {
  if (!user) {
    console.error("User is not authenticated");
    return;
  }

  const creationDate = new Date(); // Current date and time

  const note = {
    key: uuidv4(),
    title,
    content,
    isList,
    userId: user.uid,
    creationDate,
    modifiedDate: creationDate, // Initially the same as creation date
    isPinned: false, // Default values for new fields
    isFavorite: false,
    isArchived: false,
    tags,
    dueDateTime,
    reminderDateTime,
  };

  try {
    const docRef = await addDoc(collection(db, "notes"), note);
    console.log("Added note:", { ...note, id: docRef.id });
  } catch (error) {
    console.error("Error adding note:", error);
  }
};

export const PinNote = async (id, isPinned, setNotes) => {
  try {
    const noteRef = doc(db, "notes", id); // Get the document reference
    const currentNote = await getDoc(noteRef); // Fetch the current note data

    if (!currentNote.exists()) {
      console.error("Note does not exist");
      return;
    }

    await updateDoc(noteRef, {
      isPinned, // Update the pinning status
      modifiedDate: new Date(), // Update the modified date
    });

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, isPinned, modifiedDate: new Date() } : note
      )
    );
    console.log(`Note ${id} is ${isPinned ? "pinned" : "unpinned"}`);
  } catch (error) {
    console.error("Error pinning/unpinning note:", error);
  }
};
export const FavoriteNote = async (id, isFavorite, setNotes) => {
  try {
    const noteRef = doc(db, "notes", id); // Get the document reference
    const currentNote = await getDoc(noteRef); // Fetch the current note data

    if (!currentNote.exists()) {
      console.error("Note does not exist");
      return;
    }

    await updateDoc(noteRef, {
      isFavorite, // Update the favorite status
      modifiedDate: new Date(), // Update the modified date
    });

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, isFavorite, modifiedDate: new Date() }
          : note
      )
    );
    console.log(`Note ${id} is ${isFavorite ? "favorited" : "unfavorited"}`);
  } catch (error) {
    console.error("Error favoriting/unfavoriting note:", error);
  }
};
export const UpdateNote = async (
  id,
  newTitle,
  newContent,
  setNotes,
  isPinned,
  isFavorite,
  isArchived,
  tags,
  dueDateTime,
  reminderDateTime
) => {
  try {
    const noteRef = doc(db, "notes", id); // Get the document reference
    const currentNote = await getDoc(noteRef); // Fetch the current note data

    if (!currentNote.exists()) {
      console.error("Note does not exist");
      return;
    }

    const noteData = currentNote.data();
    const updatedFields = {
      title: newTitle,
      content: newContent,
      isPinned,
      isFavorite,
      isArchived,
      tags,
      dueDateTime,
      reminderDateTime,
      modifiedDate: new Date(), // Update the modified date
    };

    if (
      noteData.title === newTitle &&
      isEqual(noteData.content, newContent) &&
      noteData.isPinned === isPinned &&
      noteData.isFavorite === isFavorite &&
      noteData.isArchived === isArchived &&
      isEqual(noteData.tags, tags) &&
      noteData.dueDateTime === dueDateTime &&
      noteData.reminderDateTime === reminderDateTime
    ) {
      console.log("No changes detected, skipping update");
      return;
    }

    await updateDoc(noteRef, updatedFields); // Update Firestore
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, ...updatedFields } : note
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
