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
  const [isAscending, setIsAscending] = useState(true); // Default to ascending
  const [sortedNotes, setSortedNotes] = useState([]);

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

  /*****  Fetch tags when user is authenticated *****/
  useEffect(() => {
    if (user) {
      FetchTagsByUser(user.uid)
        .then((fetchedTags) => setFetchedTags(fetchedTags))
        .catch((error) => console.error("Error fetching tags:", error));
    }
  }, [user]);

  /*****  Fetch notes when the component mounts *****/
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
      }
    };

    getNotes();
  }, [user, navigate]); // Dependency on `navigate` ensures the fetch is triggered on route change

  /***** Sorting Mechanism *****/
  const sortNotes = (method) => {
    if (!Array.isArray(notes)) return []; // Ensure `notes` is valid

    const sorted = [...notes];

    // Sort by the selected method
    switch (method) {
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "creationDT":
        sorted.sort(
          (a, b) => new Date(a.creationDate) - new Date(b.creationDate)
        );
        break;
      case "modifiedDT":
        sorted.sort(
          (a, b) => new Date(a.modifiedDate) - new Date(b.modifiedDate)
        );
        break;
      case "dueDT":
        sorted.sort(
          (a, b) => new Date(a.dueDateTime) - new Date(b.dueDateTime)
        );
        break;
      case "reminderDT":
        sorted.sort(
          (a, b) => new Date(a.reminderDateTime) - new Date(b.reminderDateTime)
        );
        break;
      default:
        break;
    }

    if (!isAscending) sorted.reverse();
    sorted.sort((a, b) => b.isPinned - a.isPinned);

    return sorted;
  };

  const handleSortingChange = (newMethod) => {
    setSortingMethod(newMethod);
    setSortedNotes(sortNotes(newMethod));
  };

  const toggleSortDirection = () => {
    setIsAscending((prev) => !prev);
  };

  useEffect(() => {
    setSortedNotes(sortNotes(sortingMethod));
  }, [notes, sortingMethod, isAscending]);

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

      <div className="notes-masonry">
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
