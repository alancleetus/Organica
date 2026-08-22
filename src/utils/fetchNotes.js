import { db } from "../components/Firebase";
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { normalizeNoteContent, uncheckAllChecklistItems } from "./noteContent";
import { getNextOccurrence } from "./recurrence";

const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

export const fetchNotes = async (user) => {
  if (!user) return [];

  try {
    const notesCollection = collection(db, "notes");
    const q = query(notesCollection, where("userId", "==", user.uid));
    const notesSnapshot = await getDocs(q);
    const rawNotes = notesSnapshot.docs.map((docSnap) => ({
      ...docSnap.data(),
      id: docSnap.id,
      content: normalizeNoteContent(docSnap.data().content || ""),
    }));

    const now = Date.now();
    const notesList = [];

    for (const note of rawNotes) {
      // Trash older than the retention window is purged for good — fired
      // without blocking the fetch, since the note is simply left out of
      // what gets returned either way.
      if (note.isDeleted && note.deletedDate && now - note.deletedDate > TRASH_RETENTION_MS) {
        deleteDoc(doc(db, "notes", note.id)).catch((error) =>
          console.error("Error purging trashed note:", error)
        );
        continue;
      }

      // A recurring note whose due date has passed rolls forward to its
      // next occurrence (looping past any missed periods, e.g. the app
      // not being opened for two weeks) and starts unchecked again.
      if (note.recurrenceRule && note.dueDateTime && new Date(note.dueDateTime).getTime() <= now) {
        const nextDueDateTime = getNextOccurrence(note.dueDateTime, note.recurrenceRule, now);
        const nextContent =
          note.noteType === "checklist" ? uncheckAllChecklistItems(note.content) : note.content;
        const updatedFields = {
          dueDateTime: nextDueDateTime,
          content: nextContent,
          modifiedDate: now,
        };
        updateDoc(doc(db, "notes", note.id), updatedFields).catch((error) =>
          console.error("Error rolling recurring note forward:", error)
        );
        notesList.push({ ...note, ...updatedFields });
        continue;
      }

      notesList.push(note);
    }

    return notesList;
  } catch (error) {
    console.error("Error fetching notes:", error);
    return [];
  }
};
