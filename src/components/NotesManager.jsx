import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./Header";
import Note from "./Note";
import AddNoteFab from "./AddNoteFab";
import AddNoteModal from "./AddNoteModal";
import NoteListItem from "./NoteListItem";
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
  const [selectedNoteId, setSelectedNoteId] = useState(null);

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
    localStorage.setItem("notesSortingMethod", sortingMethod);
  }, [sortingMethod]);

  useEffect(() => {
    localStorage.setItem("notesSortDirection", isAscending ? "asc" : "desc");
  }, [isAscending]);

  useEffect(() => {
    setSortedNotes(sortNotes(sortingMethod));
  }, [notes, sortingMethod, isAscending]);

  useEffect(() => {
    if (!sortedNotes.length) {
      setSelectedNoteId(null);
      return;
    }

    setSelectedNoteId((currentSelectedNoteId) => {
      const selectedNoteStillExists = sortedNotes.some(
        (note) => note.id === currentSelectedNoteId
      );

      return selectedNoteStillExists
        ? currentSelectedNoteId
        : sortedNotes[0].id;
    });
  }, [sortedNotes]);

  const selectedNote =
    sortedNotes.find((note) => note.id === selectedNoteId) || null;

  return (
    <div className="page-body">
      <AddNoteFab onClick={() => setIsAddNoteOpen(true)} />
      <AddNoteModal
        open={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onCreated={(createdNote) => setSelectedNoteId(createdNote.id)}
        user={user}
        setNotes={setNotes}
      />
      <Header toggleTheme={toggleTheme} theme={theme} notes={notes} />
      <div className="notes-workspace">
        <aside className="notes-sidebar">
          <div className="notes-sidebar-brand">
            <p className="notes-sidebar-kicker">Workspace</p>
            <h2>My Notes</h2>
            <p>Clean focus for your notes, ideas, and checklists.</p>
          </div>

          <div className="notes-sidebar-section">
            <button type="button" className="notes-sidebar-link is-active">
              All Notes
              <span>{sortedNotes.length}</span>
            </button>
            <button type="button" className="notes-sidebar-link">
              Pinned
              <span>{notes.filter((note) => note.isPinned).length}</span>
            </button>
            <button type="button" className="notes-sidebar-link">
              Favorites
              <span>{notes.filter((note) => note.isFavorite).length}</span>
            </button>
          </div>
        </aside>

        <section className="notes-list-panel">
          <div className="sectioned-div notes-panel-header">
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

          <div className="notes-list-scroll">
            {sortedNotes.map((note) => (
              <NoteListItem
                key={note.id}
                note={note}
                isSelected={note.id === selectedNoteId}
                onSelect={setSelectedNoteId}
              />
            ))}
          </div>
        </section>

        <section className="notes-detail-panel">
          {selectedNote ? (
            <div className="notes-detail-shell">
              <div className="notes-detail-meta">
                <p className="notes-detail-label">Selected Note</p>
                <p className="notes-detail-date">
                  Last updated{" "}
                  {formatTimestampToDate(
                    selectedNote.modifiedDate || selectedNote.creationDate
                  )}
                </p>
              </div>

              <Note
                key={selectedNote.id}
                id={selectedNote.id}
                title={selectedNote.title}
                date={formatTimestampToDate(
                  selectedNote.modifiedDate || selectedNote.creationDate
                )}
                content={selectedNote.content}
                isPinned={selectedNote.isPinned}
                isFavorite={selectedNote.isFavorite}
                setNotes={setNotes}
              />
            </div>
          ) : (
            <div className="notes-detail-empty">
              <p className="notes-detail-label">No note selected</p>
              <h3>Pick a note to preview it here.</h3>
              <p>
                Use the add button to create a note, or choose one from the
                list.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default NotesManager;
