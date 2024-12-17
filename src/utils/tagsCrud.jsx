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
  getDocs,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const tagsCollection = collection(db, "tags"); // Tags collection reference

// Create a new tag
export const CreateTag = async ({ userId, tagName, tagColor }) => {
  if (!userId || !tagName || !tagColor) {
    console.error("All fields are required to create a tag");
    return;
  }

  const tag = {
    id: uuidv4(),
    userId, // Link the tag to the user
    tagName,
    tagColor,
    creationDate: Date.now(),
    modifiedDate: Date.now(),
  };

  try {
    const docRef = await addDoc(tagsCollection, tag);
    console.log("Created tag:", { ...tag, id: docRef.id });
    return { ...tag, id: docRef.id };
  } catch (error) {
    console.error("Error creating tag:", error);
  }
};

// Read all tags for a user
export const FetchTagsByUser = async (userId) => {
  if (!userId) {
    console.error("User ID is required to fetch tags");
    return;
  }

  try {
    const q = query(tagsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const tags = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Fetched tags for user:", tags);
    return tags;
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

// Update a tag
export const UpdateTag = async ({ id, tagName, tagColor }) => {
  if (!id || (!tagName && !tagColor)) {
    console.error("Tag ID and at least one field to update are required");
    return;
  }

  try {
    const tagRef = doc(db, "tags", id);
    const currentTag = await getDoc(tagRef);

    if (!currentTag.exists()) {
      console.error("Tag does not exist");
      return;
    }

    const updatedFields = {
      tagName: tagName || currentTag.data().tagName,
      tagColor: tagColor || currentTag.data().tagColor,
      modifiedDate: Date.now(),
    };

    await updateDoc(tagRef, updatedFields);
    console.log("Updated tag:", { id, ...updatedFields });
    return { id, ...updatedFields };
  } catch (error) {
    console.error("Error updating tag:", error);
  }
};

// Delete a tag
export const DeleteTag = async (id) => {
  if (!id) {
    console.error("Tag ID is required to delete a tag");
    return;
  }

  try {
    const tagRef = doc(db, "tags", id);
    await deleteDoc(tagRef);
    console.log("Deleted tag with ID:", id);
  } catch (error) {
    console.error("Error deleting tag:", error);
  }
};

// Fetch a single tag by ID
export const FetchTagById = async (id) => {
  if (!id) {
    console.error("Tag ID is required to fetch the tag");
    return;
  }

  try {
    const tagRef = doc(db, "tags", id);
    const tagDoc = await getDoc(tagRef);

    if (tagDoc.exists()) {
      console.log("Fetched tag:", { id: tagDoc.id, ...tagDoc.data() });
      return { id: tagDoc.id, ...tagDoc.data() };
    } else {
      console.error("Tag not found");
      return null;
    }
  } catch (error) {
    console.error("Error fetching tag:", error);
    throw error;
  }
};
