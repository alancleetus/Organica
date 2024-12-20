import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./Header";
import Note from "./Note";
import AddNoteFab from "./AddNoteFab";
import { fetchNotes } from "../utils/fetchNotes.js";
import { formatTimestampToDate } from "../utils/formatTimestampToDate.js";
import Sorter from "./Sorter";
import HorizontalDatePicker from "./HorizontalDatePicker";
import { FetchTagsByUser } from "../utils/tagsCrud.jsx";
function NotesManager({ theme, toggleTheme }) {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [sortingMethod, setSortingMethod] = useState("title");
  const [fetchedTags, setFetchedTags] = useState([]);
  useEffect(() => {
    if (user) {
      FetchTagsByUser(user.uid)
        .then((fetchedTags) => setFetchedTags(fetchedTags))
        .catch((error) => console.error("Error fetching tags:", error));
    }
  }, [user]);

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
    const getNotes = async () => {
      if (user) {
        const fetchedNotes = await fetchNotes(user);
        setNotes(fetchedNotes || []); // Ensure `notes` is always an array
      }
    };

    getNotes();
  }, [user]);

  /*****  Fetch notes when route changes back to /main *****/
  useEffect(() => {
    const getNotes = async () => {
      if (user) {
        const fetchedNotes = await fetchNotes(user);
        setNotes(fetchedNotes || []); // Update notes when navigating back to /main

        console.log("Fetch notes:", fetchedNotes);
      }
    };

    getNotes();
  }, [user, navigate]); // Dependency on `navigate` ensures the fetch is triggered on route change

  const handleSortingChange = (newMethod) => {
    setSortingMethod(newMethod);
    sortNotes(sortedNotes);
  };
  const [isAscending, setIsAscending] = useState(true); // Default to ascending
  const sortNotes = (method) => {
    if (!Array.isArray(notes)) return []; // Guard against invalid `notes`

    const sortedNotes = [...notes]; // Make a copy
    switch (method) {
      case "title":
        sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
      case "creationDT":
        sortedNotes.sort(
          (a, b) => new Date(a.creationDate) - new Date(b.creationDate)
        );
      case "modifiedDT":
        sortedNotes.sort(
          (a, b) => new Date(a.modifiedDate) - new Date(b.modifiedDate)
        );
      case "dueDT":
        sortedNotes.sort(
          (a, b) => new Date(a.dueDateTime) - new Date(b.dueDateTime)
        );
      case "reminderDT":
        sortedNotes.sort(
          (a, b) => new Date(a.reminderDateTime) - new Date(b.reminderDateTime)
        );
      default:
        sortedNotes;
    }

    return isAscending ? sortedNotes : sortedNotes.reverse();
  };
  const toggleSortDirection = () => {
    setIsAscending((prev) => !prev);
  };
  const sortedNotes = sortNotes(sortingMethod);

  return (
    <div className="page-body">
      <AddNoteFab user={user} />
      <Header toggleTheme={toggleTheme} theme={theme} />
      <HorizontalDatePicker
        onDateChange={(date) => console.log("date:", date)}
      />

      <div className="sectioned-div">
        <div className="section-title">
          <h2>All Notes</h2>
          <p className="section-badge">{sortedNotes.length}</p>
        </div>
        <Sorter
          sortingOptions={[
            { value: "title", label: "Title" },
            { value: "creationDT", label: "Creation Date" },
            { value: "modifiedDT", label: "Modified Date" },
            { value: "dueDT", label: "Due Date" },
            { value: "reminderDT", label: "Reminder Date" },
          ]}
          currentSorting={sortingMethod}
          onSortingChange={handleSortingChange}
          toggleSortDirection={toggleSortDirection}
          isAscending={isAscending}
        />
      </div>

      <div id="notes-grid">
        {sortedNotes.map((note) => (
          <Note
            key={note.id}
            id={note.id}
            title={note.title}
            date={formatTimestampToDate(note.creationDate)}
            content={note.content}
            isPinned={note.isPinned}
            isFavorite={note.isFavorite}
            setNotes={setNotes}
            tags={note.tags}
            fetchedTags={fetchedTags}
            dueDateTime={note.dueDateTime}
            reminderDateTime={note.reminderDateTime}
          />
        ))}
      </div>
    </div>
  );
}

export default NotesManager;
