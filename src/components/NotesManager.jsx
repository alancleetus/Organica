import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./Header";
import Note from "./Note";
import AddNoteFab from "./AddNoteFab";
import AddNoteModal from "./AddNoteModal";
import { fetchNotes } from "../utils/fetchNotes.js";
import { formatTimestampToDate } from "../utils/formatTimestampToDate.js";
import Sorter from "./Sorter";

function NotesManager({ theme, toggleTheme }) {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [sortingMethod, setSortingMethod] = useState(() => {
    return localStorage.getItem("notesSortingMethod") || "title";
  });
  const [isAscending, setIsAscending] = useState(() => {
    const savedSortDirection = localStorage.getItem("notesSortDirection");
    return savedSortDirection ? savedSortDirection === "asc" : true;
  });
  const [sortedNotes, setSortedNotes] = useState([]);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const getNotes = async () => {
      if (user) {
        const fetchedNotes = await fetchNotes(user);
        setNotes(fetchedNotes || []);
      }
    };

    getNotes();
  }, [user]);

  useEffect(() => {
    const getNotes = async () => {
      if (user) {
        const fetchedNotes = await fetchNotes(user);
        setNotes(fetchedNotes || []);
      }
    };

    getNotes();
  }, [user, navigate]);

  const sortNotes = (method) => {
    if (!Array.isArray(notes)) return [];

    const sorted = [...notes];

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
    localStorage.setItem("notesSortingMethod", sortingMethod);
  }, [sortingMethod]);

  useEffect(() => {
    localStorage.setItem("notesSortDirection", isAscending ? "asc" : "desc");
  }, [isAscending]);

  useEffect(() => {
    setSortedNotes(sortNotes(sortingMethod));
  }, [notes, sortingMethod, isAscending]);

  return (
    <div className="page-body">
      <AddNoteFab onClick={() => setIsAddNoteOpen(true)} />
      <AddNoteModal
        open={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        user={user}
        setNotes={setNotes}
      />
      <Header toggleTheme={toggleTheme} theme={theme} />

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
            date={formatTimestampToDate(note.modifiedDate || note.creationDate)}
            content={note.content}
            isPinned={note.isPinned}
            isFavorite={note.isFavorite}
            setNotes={setNotes}
            tags={note.tags}
            fetchedTags={[]}
            dueDateTime={note.dueDateTime}
            reminderDateTime={note.reminderDateTime}
          />
        ))}
      </div>
    </div>
  );
}

export default NotesManager;
