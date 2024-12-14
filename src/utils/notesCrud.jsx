import { db } from "../components/Firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  query,
  where,
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

  const creationDate = Date.now(); // Current date and time

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
      modifiedDate: Date.now(), // Update the modified date
    });

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, isPinned, modifiedDate: Date.now() } : note
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
      modifiedDate: Date.now(), // Update the modified date
    });

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, isFavorite, modifiedDate: Date.now() }
          : note
      )
    );
    console.log(`Note ${id} is ${isFavorite ? "favorited" : "unfavorited"}`);
  } catch (error) {
    console.error("Error favoriting/unfavoriting note:", error);
  }
};

export const ArchiveNote = async (id, isArchived, setNotes) => {
  try {
    const noteRef = doc(db, "notes", id); // Get the document reference
    const currentNote = await getDoc(noteRef); // Fetch the current note data

    if (!currentNote.exists()) {
      console.error("Note does not exist");
      return;
    }

    await updateDoc(noteRef, {
      isArchived, // Update the archived status
      modifiedDate: Date.now(), // Update the modified date
    });

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, isArchived, modifiedDate: Date.now() }
          : note
      )
    );
    console.log(
      `Note ${id} has been ${isArchived ? "archived" : "unarchived"}`
    );
  } catch (error) {
    console.error("Error archiving/unarchiving note:", error);
  }
};

export const UpdateNote = async (
  id,
  newTitle,
  newContent,
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
      isPinned: isPinned !== undefined ? isPinned : noteData.isPinned,
      isFavorite: isFavorite !== undefined ? isFavorite : noteData.isFavorite,
      isArchived: isArchived !== undefined ? isArchived : noteData.isArchived,
      tags: tags !== undefined ? tags : noteData.tags,
      dueDateTime:
        dueDateTime !== undefined ? dueDateTime : noteData.dueDateTime,
      reminderDateTime:
        reminderDateTime !== undefined
          ? reminderDateTime
          : noteData.reminderDateTime,
      modifiedDate: Date.now(), // Update the modified date
    };

    await updateDoc(noteRef, updatedFields); // Update Firestore

    console.log("Updated note with id:", id);
  } catch (error) {
    console.error("Error updating note:", error);
  }
};
export const AddTagsToNote = async (id, newTags, setNotes) => {
  try {
    const noteRef = doc(db, "notes", id);
    const currentNote = await getDoc(noteRef);

    if (!currentNote.exists()) {
      console.error("Note does not exist");
      return;
    }

    const { tags = [] } = currentNote.data();
    const updatedTags = Array.from(new Set([...tags, ...newTags])); // Avoid duplicates

    await updateDoc(noteRef, {
      tags: updatedTags,
      modifiedDate: Date.now(),
    });

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, tags: updatedTags, modifiedDate: Date.now() }
          : note
      )
    );

    console.log(`Tags added to note ${id}:`, newTags);
  } catch (error) {
    console.error("Error adding tags:", error);
  }
};

export const RemoveTagsFromNote = async (id, tagsToRemove, setNotes) => {
  try {
    const noteRef = doc(db, "notes", id);
    const currentNote = await getDoc(noteRef);

    if (!currentNote.exists()) {
      console.error("Note does not exist");
      return;
    }

    const { tags = [] } = currentNote.data();
    const updatedTags = tags.filter((tag) => !tagsToRemove.includes(tag));

    await updateDoc(noteRef, {
      tags: updatedTags,
      modifiedDate: Date.now(),
    });

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, tags: updatedTags, modifiedDate: Date.now() }
          : note
      )
    );

    console.log(`Tags removed from note ${id}:`, tagsToRemove);
  } catch (error) {
    console.error("Error removing tags:", error);
  }
};

export const ReplaceTagsForNote = async (id, newTags, setNotes) => {
  try {
    const noteRef = doc(db, "notes", id);

    await updateDoc(noteRef, {
      tags: newTags,
      modifiedDate: Date.now(),
    });

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, tags: newTags, modifiedDate: Date.now() }
          : note
      )
    );

    console.log(`Tags replaced for note ${id}:`, newTags);
  } catch (error) {
    console.error("Error replacing tags:", error);
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
export const fetchNotesByTag = async (tag) => {
  const q = query(
    collection(db, "notes"),
    where("tags", "array-contains", tag)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const fetchAllTags = async (userId) => {
  try {
    const notesCollection = collection(db, "notes");
    const q = query(notesCollection, where("userId", "==", userId));

    const querySnapshot = await getDocs(q);

    // Aggregate tags
    const allTags = new Set(); // To store unique tags
    querySnapshot.forEach((doc) => {
      const noteData = doc.data();
      if (noteData.tags && Array.isArray(noteData.tags)) {
        noteData.tags.forEach((tag) => allTags.add(tag));
      }
    });

    const uniqueTags = Array.from(allTags); // Convert Set to Array
    console.log("Fetched unique tags:", uniqueTags);
    return uniqueTags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};
