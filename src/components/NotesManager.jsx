import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./Header";
import Note from "./Note";
import AddNoteModal from "./AddNoteModal";
import AddNoteFab from "./AddNoteFab";
import NoteListItem from "./NoteListItem";
import { fetchNotes } from "../utils/fetchNotes.js";
import { formatTimestampToDate } from "../utils/formatTimestampToDate.js";
import Sorter from "./Sorter";

function NotesManager({ theme, toggleTheme }) {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [sortingMethod, setSortingMethod] = useState(() => {
    return localStorage.getItem("notesSortingMethod") || "title";
  });
  const [isAscending, setIsAscending] = useState(() => {
    const savedSortDirection = localStorage.getItem("notesSortDirection");
    return savedSortDirection ? savedSortDirection === "asc" : true;
  });
  const [activeFilter, setActiveFilter] = useState(() => {
    return localStorage.getItem("notesActiveFilter") || "all";
  });
  const [searchTerm, setSearchTerm] = useState(() => {
    return localStorage.getItem("notesSearchTerm") || "";
  });
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [mobileBrowseTab, setMobileBrowseTab] = useState("notes");
  const [mobileScreen, setMobileScreen] = useState("browse");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateLayout = () => setIsMobileLayout(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);

    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (!isMobileLayout) {
      setMobileScreen("browse");
      setMobileBrowseTab("notes");
    }
  }, [isMobileLayout]);

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
    localStorage.setItem("notesActiveFilter", activeFilter);
  }, [activeFilter]);

  useEffect(() => {
    localStorage.setItem("notesSearchTerm", searchTerm);
  }, [searchTerm]);

  const sortedNotes = useMemo(
    () => sortNotes(sortingMethod),
    [notes, sortingMethod, isAscending]
  );

  const visibleNotes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return sortedNotes.filter((note) => {
      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "pinned" && note.isPinned) ||
        (activeFilter === "favorites" && note.isFavorite) ||
        (activeFilter === "tasks" &&
          note.content?.includes('data-type="taskList"'));

      if (!matchesFilter) return false;
      if (!normalizedSearch) return true;

      const title = note.title?.toLowerCase() || "";
      const content = note.content?.replace(/<[^>]*>/g, " ").toLowerCase() || "";
      return (
        title.includes(normalizedSearch) || content.includes(normalizedSearch)
      );
    });
  }, [sortedNotes, activeFilter, searchTerm]);

  useEffect(() => {
    const handleKeyboardShortcuts = (event) => {
      const target = event.target;
      const isTypingIntoField =
        target instanceof HTMLElement &&
        (target.closest("input, textarea, [contenteditable='true']") ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA");

      if (
        !isTypingIntoField &&
        event.key.toLowerCase() === "n" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        event.preventDefault();
        setIsAddNoteOpen(true);
      }

      if (!isTypingIntoField && event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => window.removeEventListener("keydown", handleKeyboardShortcuts);
  }, []);

  useEffect(() => {
    if (!visibleNotes.length) {
      setSelectedNoteId(null);
      if (isMobileLayout) {
        setMobileScreen("browse");
      }
      return;
    }

    setSelectedNoteId((currentSelectedNoteId) => {
      const selectedNoteStillExists = visibleNotes.some(
        (note) => note.id === currentSelectedNoteId
      );

      return selectedNoteStillExists
        ? currentSelectedNoteId
        : visibleNotes[0].id;
    });
  }, [visibleNotes, isMobileLayout]);

  const selectedNote =
    visibleNotes.find((note) => note.id === selectedNoteId) || null;
  const pinnedCount = notes.filter((note) => note.isPinned).length;
  const favoriteCount = notes.filter((note) => note.isFavorite).length;
  const checklistCount = notes.filter((note) =>
    note.content?.includes('data-type="taskList"')
  ).length;
  const hasScopedView = activeFilter !== "all" || searchTerm.trim() !== "";

  const handleSelectNote = (noteId) => {
    setSelectedNoteId(noteId);
    if (isMobileLayout) {
      setMobileScreen("detail");
    }
  };

  const resetListView = () => {
    setActiveFilter("all");
    setSearchTerm("");
    setMobileBrowseTab("notes");
  };

  const renderSidebar = () => (
    <aside className="notes-sidebar">
      <div className="notes-sidebar-top">
        <div className="notes-sidebar-brand">
          <p className="notes-sidebar-kicker">Organica</p>
          <h2 className="notes-sidebar-title">My Notes</h2>
          <p>Clean focus for your notes, ideas, and checklists.</p>
        </div>

        <div className="notes-sidebar-section">
          <button
            type="button"
            className={`notes-sidebar-link${activeFilter === "all" ? " is-active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All Notes
            <span>{sortedNotes.length}</span>
          </button>
          <button
            type="button"
            className={`notes-sidebar-link${activeFilter === "pinned" ? " is-active" : ""}`}
            onClick={() => setActiveFilter("pinned")}
          >
            Pinned
            <span>{pinnedCount}</span>
          </button>
          <button
            type="button"
            className={`notes-sidebar-link${activeFilter === "favorites" ? " is-active" : ""}`}
            onClick={() => setActiveFilter("favorites")}
          >
            Favorites
            <span>{favoriteCount}</span>
          </button>
        </div>
      </div>

      <div className="notes-sidebar-summary">
        <p className="notes-sidebar-summary-title">Quick Stats</p>
        <div className="notes-sidebar-summary-grid">
          <div>
            <span>Total</span>
            <strong>{sortedNotes.length}</strong>
          </div>
          <div>
            <span>Pinned</span>
            <strong>{pinnedCount}</strong>
          </div>
          <div>
            <span>Favs</span>
            <strong>{favoriteCount}</strong>
          </div>
          <div>
            <span>Tasks</span>
            <strong>{checklistCount}</strong>
          </div>
        </div>
      </div>

      <div className="notes-sidebar-bottom">
        <Header toggleTheme={toggleTheme} theme={theme} notes={notes} />
      </div>
    </aside>
  );

  const renderListPanel = () => (
    <section className="notes-list-panel">
      <div className="sectioned-div notes-panel-header">
        <div className="section-title">
          <div>
            <p className="notes-panel-kicker">Library</p>
            <h2>All Notes</h2>
          </div>
          <p className="section-badge">{visibleNotes.length}</p>
        </div>
        <Sorter
          sortingOptions={[
            { value: "title", label: "Title" },
            { value: "creationDT", label: "Created" },
            { value: "modifiedDT", label: "Modified" },
            { value: "dueDT", label: "Due" },
            { value: "reminderDT", label: "Reminder" },
          ]}
          currentSorting={sortingMethod}
          onSortingChange={handleSortingChange}
          toggleSortDirection={toggleSortDirection}
          isAscending={isAscending}
        />
      </div>

      <div className="notes-list-tools">
        <input
          ref={searchInputRef}
          type="search"
          className="notes-search-input"
          placeholder="Search notes"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          data-testid="notes-search-input"
        />
        <button
          type="button"
          className={`notes-filter-chip${activeFilter === "tasks" ? " is-active" : ""}`}
          onClick={() =>
            setActiveFilter((prev) => (prev === "tasks" ? "all" : "tasks"))
          }
        >
          Tasks
        </button>
      </div>

      <div className="notes-list-scroll">
        {visibleNotes.length ? (
          visibleNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={handleSelectNote}
              setNotes={setNotes}
            />
          ))
        ) : (
          <div className="notes-list-empty">
            <p className="notes-detail-label">No matches</p>
            <h3>
              {hasScopedView
                ? "Your current view is hiding notes."
                : "Nothing fits this view right now."}
            </h3>
            <p>
              {hasScopedView
                ? "Clear search and filters to show every note again."
                : "Try a different filter, clear search, or create a new note."}
            </p>
            {hasScopedView && (
              <button
                type="button"
                className="notes-list-reset"
                onClick={resetListView}
              >
                Show all notes
              </button>
            )}
          </div>
        )}
      </div>

      <div className="notes-list-footer">
        <AddNoteFab onClick={() => setIsAddNoteOpen(true)} />
      </div>
    </section>
  );

  const renderDetailPanel = (mobile = false) => (
    <section className="notes-detail-panel">
      {selectedNote ? (
        <div className="notes-detail-shell">
          <div className="notes-detail-meta">
            <div>
              <p className="notes-detail-label">Note Workspace</p>
              <p className="notes-detail-breadcrumb">
                My Notes / {selectedNote.title?.trim() || "Untitled note"}
              </p>
            </div>
            <div className="notes-detail-meta-actions">
              {mobile && (
                <button
                  type="button"
                  className="notes-mobile-back"
                  onClick={() => {
                    setMobileBrowseTab("notes");
                    setMobileScreen("browse");
                  }}
                >
                  <ArrowLeftLineIcon />
                  <span>All Notes</span>
                </button>
              )}
              <div className="notes-detail-meta-pill">
                <span>Last updated</span>
                <p className="notes-detail-date">
                  {formatTimestampToDate(
                    selectedNote.modifiedDate || selectedNote.creationDate
                  )}
                </p>
              </div>
            </div>
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
        <button
          type="button"
          className="notes-detail-empty"
          onClick={() => setIsAddNoteOpen(true)}
        >
          <p className="notes-detail-label">No note selected</p>
          <h3>Pick a note or start a new one.</h3>
          <p>
            Use `N` to create a note, `/` to search, or choose a note from the
            list.
          </p>
        </button>
      )}
    </section>
  );

  return (
    <div className="page-body">
      <AddNoteModal
        open={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        onCreated={(createdNote) => {
          setSelectedNoteId(createdNote.id);
          if (isMobileLayout) {
            setMobileScreen("detail");
          }
        }}
        user={user}
        setNotes={setNotes}
      />
      {isMobileLayout ? (
        <div className="notes-mobile-shell">
          {mobileScreen === "browse" ? (
            <>
              <div className="notes-mobile-tabs">
                <button
                  type="button"
                  className={`notes-mobile-tab${mobileBrowseTab === "notes" ? " is-active" : ""}`}
                  onClick={() => setMobileBrowseTab("notes")}
                >
                  All Notes
                </button>
                <button
                  type="button"
                  className={`notes-mobile-tab${mobileBrowseTab === "organize" ? " is-active" : ""}`}
                  onClick={() => setMobileBrowseTab("organize")}
                >
                  Organize
                </button>
              </div>

              {mobileBrowseTab === "notes" ? renderListPanel() : renderSidebar()}
            </>
          ) : (
            renderDetailPanel(true)
          )}
        </div>
      ) : (
        <div className="notes-workspace">
          {renderSidebar()}
          {renderListPanel()}
          {renderDetailPanel()}
        </div>
      )}
    </div>
  );
}

export default NotesManager;
