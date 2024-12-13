import { db } from "../components/Firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export const fetchNotes = async (user) => {
  if (user) {
    try {
      const notesCollection = collection(db, "notes");
      const q = query(notesCollection, where("userId", "==", user.uid));
      const notesSnapshot = await getDocs(q);
      const notesList = notesSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      return notesList;
    } catch (error) {
      console.error("Error fetching notes:", error);
      return [];
    }
  } else return [];
};
