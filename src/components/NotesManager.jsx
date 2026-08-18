import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import PencilLineIcon from "remixicon-react/PencilLineIcon";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./Header";
import Note from "./Note";
import AddNoteModal from "./AddNoteModal";
import AddNoteFab from "./AddNoteFab";
import NoteListItem from "./NoteListItem";
import { fetchNotes } from "../utils/fetchNotes.js";
import { formatTimestampToDate } from "../utils/formatTimestampToDate.js";
import { ReplaceTagsForNote } from "../utils/notesCrud";
import { CreateTag, UpdateTag, DeleteTag, FetchTagsByUser } from "../utils/tagsCrud";
import Sorter from "./Sorter";
import { getSearchableText, isChecklistContent } from "../utils/noteContent";

const RESERVED_FILTERS = ["all", "pinned", "favorites", "tasks", "notes-only"];

// Curated, distinct hues a folder can be color-coded with — rendered via
// color-mix() in styles.css so each one adapts to whichever theme palette
// is active instead of needing a hand-tuned value per theme.
export const FOLDER_COLORS = [
  { id: "red", hex: "#EF4444" },
  { id: "orange", hex: "#F97316" },
  { id: "amber", hex: "#F59E0B" },
  { id: "green", hex: "#22C55E" },
  { id: "teal", hex: "#14B8A6" },
  { id: "blue", hex: "#3B82F6" },
  { id: "indigo", hex: "#6366F1" },
  { id: "purple", hex: "#A855F7" },
  { id: "pink", hex: "#EC4899" },
];

function filterLabel(filter) {
  switch (filter) {
    case "all":
      return "All Notes";
    case "pinned":
      return "Pinned";
    case "favorites":
      return "Favorites";
    case "tasks":
      return "Tasks";
    case "notes-only":
      return "Notes Only";
    default:
      return filter;
  }
}

function NotesManager() {
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
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [folderRenameDraft, setFolderRenameDraft] = useState("");
  const [tagDocs, setTagDocs] = useState([]);

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

  /***** Fetch folder color assignments (tagsCrud.jsx) *****/
  useEffect(() => {
    const getTagDocs = async () => {
      if (user) {
        const fetchedTags = await FetchTagsByUser(user.uid);
        setTagDocs(fetchedTags || []);
      }
    };

    getTagDocs();
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
          (activeFilter === "tasks" && isChecklistContent(note.content)) ||
          (activeFilter === "notes-only" && !isChecklistContent(note.content)) ||
          (!RESERVED_FILTERS.includes(activeFilter) &&
            (note.tags || []).includes(activeFilter));

      if (!matchesFilter) return false;
      if (!normalizedSearch) return true;

      const title = note.title?.toLowerCase() || "";
      const content = getSearchableText(note.content);
      return (
        title.includes(normalizedSearch) || content.includes(normalizedSearch)
      );
    });
  }, [sortedNotes, activeFilter, searchTerm]);

  // Tags already live on every note (notesCrud.jsx); "folders" are just the
  // set of tags currently in use, derived once and shared by both the
  // desktop sidebar list and the mobile grid.
  const folders = useMemo(() => {
    const counts = new Map();
    notes.forEach((note) => {
      (note.tags || []).forEach((tag) => {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      });
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [notes]);

  // tagName -> { id, colorId } for folders that have been color-coded via
  // the tagsCrud.jsx sidecar collection (notes only store tag *names*, so
  // this is a separate lookup, not part of the note itself).
  const tagColorDocsByName = useMemo(() => {
    const map = new Map();
    tagDocs.forEach((doc) => {
      map.set(doc.tagName, doc);
    });
    return map;
  }, [tagDocs]);

  // tagName -> hex, the shape NoteListItem/Note actually consume.
  const tagColors = useMemo(() => {
    const colorsById = new Map(FOLDER_COLORS.map((c) => [c.id, c.hex]));
    const result = {};
    tagColorDocsByName.forEach((doc, name) => {
      const hex = colorsById.get(doc.tagColor);
      if (hex) result[name] = hex;
    });
    return result;
  }, [tagColorDocsByName]);

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
  const checklistCount = notes.filter((note) => isChecklistContent(note.content)).length;
  const hasScopedView = activeFilter !== "all" || searchTerm.trim() !== "";

  const handleSelectNote = (noteId) => {
    setSelectedNoteId(noteId);
    if (isMobileLayout) {
      setMobileScreen("detail");
    }
  };

  // Used by both the Library rows and the Folders group: on mobile, picking
  // a filter from the Folders tab should jump straight to the (now
  // filtered) note list, not leave the user staring at the same tab.
  const handleFilterSelect = (filterValue) => {
    setActiveFilter(filterValue);
    if (isMobileLayout) {
      setMobileBrowseTab("notes");
    }
  };

  const resetListView = () => {
    setActiveFilter("all");
    setSearchTerm("");
    setMobileBrowseTab("notes");
  };

  const startRenamingFolder = (folderName) => {
    setRenamingFolder(folderName);
    setFolderRenameDraft(folderName);
  };

  const cancelRenamingFolder = () => {
    setRenamingFolder(null);
    setFolderRenameDraft("");
  };

  // Folders are just tags in use (see the `folders` memo above) — renaming
  // one means re-tagging every note that carries it. If a note already has
  // the new name too, the rename just merges into it rather than erroring.
  // The color assignment (if any) is a separate doc keyed by name, so it
  // gets renamed alongside the notes or the color would silently "stick"
  // to the old, now-unused name.
  const commitFolderRename = (oldName) => {
    const nextName = folderRenameDraft.trim();
    setRenamingFolder(null);
    setFolderRenameDraft("");

    if (!nextName || nextName === oldName) return;

    notes
      .filter((note) => (note.tags || []).includes(oldName))
      .forEach((note) => {
        const nextTags = Array.from(
          new Set(note.tags.map((tag) => (tag === oldName ? nextName : tag)))
        );
        ReplaceTagsForNote(note.id, nextTags, setNotes);
      });

    const existingColorDoc = tagColorDocsByName.get(oldName);
    if (existingColorDoc) {
      UpdateTag({ id: existingColorDoc.id, tagName: nextName }).then(() => {
        setTagDocs((prev) =>
          prev.map((doc) =>
            doc.id === existingColorDoc.id ? { ...doc, tagName: nextName } : doc
          )
        );
      });
    }

    if (activeFilter === oldName) {
      setActiveFilter(nextName);
    }
  };

  // Assign (or clear, colorId === null) a folder's color. Create-or-update
  // against the tagsCrud.jsx doc for this name, since a folder may not have
  // one yet the first time a color is picked. Clearing deletes the doc
  // outright rather than writing a falsy tagColor — UpdateTag's own guard
  // rejects an update where neither tagName nor tagColor is truthy.
  const handleFolderColorChange = (folderName, colorId) => {
    const existing = tagColorDocsByName.get(folderName);

    if (!colorId) {
      if (existing) {
        DeleteTag(existing.id).then(() => {
          setTagDocs((prev) => prev.filter((doc) => doc.id !== existing.id));
        });
      }
      return;
    }

    if (existing) {
      UpdateTag({ id: existing.id, tagColor: colorId }).then(() => {
        setTagDocs((prev) =>
          prev.map((doc) =>
            doc.id === existing.id ? { ...doc, tagColor: colorId } : doc
          )
        );
      });
      return;
    }

    CreateTag({ userId: user.uid, tagName: folderName, tagColor: colorId }).then(
      (created) => {
        if (created) setTagDocs((prev) => [...prev, created]);
      }
    );
  };

  const renderColorSwatchRow = (folderName) => {
    const currentColorId = tagColorDocsByName.get(folderName)?.tagColor || null;

    return (
      <div className="folder-color-swatch-row">
        <button
          type="button"
          className={`folder-color-swatch-none${!currentColorId ? " is-active" : ""}`}
          aria-label="No folder color"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => handleFolderColorChange(folderName, null)}
        />
        {FOLDER_COLORS.map((color) => (
          <button
            type="button"
            key={color.id}
            className={`folder-color-swatch${currentColorId === color.id ? " is-active" : ""}`}
            style={{ "--swatch-color": color.hex }}
            aria-label={`Set folder color to ${color.id}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleFolderColorChange(folderName, color.id)}
          />
        ))}
      </div>
    );
  };

  const renderSearchInput = () => (
    <div className="notes-search-field">
      <SearchIcon aria-hidden="true" />
      <input
        ref={searchInputRef}
        type="search"
        className="notes-search-input"
        placeholder="Search notes"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        data-testid="notes-search-input"
      />
    </div>
  );

  const renderSidebar = (foldersAsGrid = false) => (
    <aside className="notes-sidebar">
      <div className="notes-sidebar-top">
        <div className="notes-sidebar-profile">
          <span className="notes-avatar" aria-hidden="true">
            <PersonOutlineIcon />
          </span>
          <span className="notes-sidebar-profile-name">
            {user?.email || "My workspace"}
          </span>
        </div>

        {renderSearchInput()}

        <div className="notes-sidebar-section">
          <p className="notes-sidebar-group-label">Library</p>
          <button
            type="button"
            className={`notes-sidebar-link${activeFilter === "all" ? " is-active" : ""}`}
            onClick={() => handleFilterSelect("all")}
          >
            <DescriptionOutlinedIcon />
            <span className="notes-sidebar-link-label">All Notes</span>
            <span className="notes-sidebar-link-count">{sortedNotes.length}</span>
          </button>
          <button
            type="button"
            className={`notes-sidebar-link${activeFilter === "pinned" ? " is-active" : ""}`}
            onClick={() => handleFilterSelect("pinned")}
          >
            <PushpinLineIcon />
            <span className="notes-sidebar-link-label">Pinned</span>
            <span className="notes-sidebar-link-count">{pinnedCount}</span>
          </button>
          <button
            type="button"
            className={`notes-sidebar-link${activeFilter === "favorites" ? " is-active" : ""}`}
            onClick={() => handleFilterSelect("favorites")}
          >
            <HeartLineIcon />
            <span className="notes-sidebar-link-label">Favorites</span>
            <span className="notes-sidebar-link-count">{favoriteCount}</span>
          </button>
          <button
            type="button"
            className={`notes-sidebar-link${activeFilter === "tasks" ? " is-active" : ""}`}
            onClick={() => handleFilterSelect("tasks")}
          >
            <FactCheckOutlinedIcon />
            <span className="notes-sidebar-link-label">Tasks</span>
            <span className="notes-sidebar-link-count">{checklistCount}</span>
          </button>
          <button
            type="button"
            className={`notes-sidebar-link${activeFilter === "notes-only" ? " is-active" : ""}`}
            onClick={() => handleFilterSelect("notes-only")}
          >
            <NotesOutlinedIcon />
            <span className="notes-sidebar-link-label">Notes Only</span>
            <span className="notes-sidebar-link-count">{notes.length - checklistCount}</span>
          </button>
        </div>

        <div className="notes-sidebar-folders-section">
          <p className="notes-sidebar-group-label">Folders</p>
          {folders.length === 0 ? (
            <p className="notes-sidebar-folders-empty">
              Add a tag to a note to create your first folder.
            </p>
          ) : foldersAsGrid ? (
            <div className="notes-folder-grid">
              {folders.map((folder) =>
                renamingFolder === folder.name ? (
                  <form
                    key={folder.name}
                    className="notes-folder-tile notes-folder-tile-rename"
                    onSubmit={(event) => {
                      event.preventDefault();
                      commitFolderRename(folder.name);
                    }}
                  >
                    <div className="notes-folder-rename-name-row">
                      <FolderOutlinedIcon aria-hidden="true" />
                      <input
                        autoFocus
                        className="notes-folder-rename-input"
                        value={folderRenameDraft}
                        onChange={(event) => setFolderRenameDraft(event.target.value)}
                        onBlur={() => commitFolderRename(folder.name)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") cancelRenamingFolder();
                        }}
                      />
                    </div>
                    {renderColorSwatchRow(folder.name)}
                  </form>
                ) : (
                  <div className="notes-folder-tile-wrap" key={folder.name}>
                    <button
                      type="button"
                      className={`notes-folder-tile${tagColors[folder.name] ? " has-folder-color" : ""}`}
                      style={tagColors[folder.name] ? { "--folder-accent": tagColors[folder.name] } : undefined}
                      onClick={() => handleFilterSelect(folder.name)}
                    >
                      <FolderOutlinedIcon aria-hidden="true" />
                      <span className="notes-folder-tile-label">{folder.name}</span>
                      <span className="notes-folder-tile-count">
                        {folder.count} note{folder.count === 1 ? "" : "s"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="notes-folder-rename-trigger"
                      aria-label={`Rename ${folder.name} folder`}
                      onClick={() => startRenamingFolder(folder.name)}
                    >
                      <PencilLineIcon />
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="notes-sidebar-folders">
              {folders.map((folder) =>
                renamingFolder === folder.name ? (
                  <form
                    key={folder.name}
                    className="notes-sidebar-link notes-sidebar-link-rename"
                    onSubmit={(event) => {
                      event.preventDefault();
                      commitFolderRename(folder.name);
                    }}
                  >
                    <div className="notes-folder-rename-name-row">
                      <FolderOutlinedIcon />
                      <input
                        autoFocus
                        className="notes-folder-rename-input"
                        value={folderRenameDraft}
                        onChange={(event) => setFolderRenameDraft(event.target.value)}
                        onBlur={() => commitFolderRename(folder.name)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") cancelRenamingFolder();
                        }}
                      />
                    </div>
                    {renderColorSwatchRow(folder.name)}
                  </form>
                ) : (
                  <div className="notes-sidebar-link-wrap" key={folder.name}>
                    <button
                      type="button"
                      className={`notes-sidebar-link${activeFilter === folder.name ? " is-active" : ""}${tagColors[folder.name] ? " has-folder-color" : ""}`}
                      style={tagColors[folder.name] ? { "--folder-accent": tagColors[folder.name] } : undefined}
                      onClick={() => handleFilterSelect(folder.name)}
                    >
                      <FolderOutlinedIcon />
                      <span className="notes-sidebar-link-label">{folder.name}</span>
                      <span className="notes-sidebar-link-count">{folder.count}</span>
                    </button>
                    <button
                      type="button"
                      className="notes-folder-rename-trigger"
                      aria-label={`Rename ${folder.name} folder`}
                      onClick={() => startRenamingFolder(folder.name)}
                    >
                      <PencilLineIcon />
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div className="notes-sidebar-bottom">
        <Header notes={notes} />
      </div>
    </aside>
  );

  const renderListPanel = () => (
    <section className="notes-list-panel">
      <div className="sectioned-div notes-panel-header">
        <div className="section-title">
          <div>
            <p className="notes-panel-kicker">Library</p>
            <h2>{filterLabel(activeFilter)}</h2>
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

      <AddNoteFab onClick={() => setIsAddNoteOpen(true)} />

      <div className="notes-list-tools">
        {isMobileLayout && renderSearchInput()}
        <button
          type="button"
          className={`notes-filter-chip${activeFilter === "tasks" ? " is-active" : ""}`}
          onClick={() =>
            handleFilterSelect(activeFilter === "tasks" ? "all" : "tasks")
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
              tagColors={tagColors}
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
            noteType={selectedNote.noteType}
            isPinned={selectedNote.isPinned}
            isFavorite={selectedNote.isFavorite}
            tags={selectedNote.tags || []}
            tagColors={tagColors}
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
                  className={`notes-mobile-tab${mobileBrowseTab === "folders" ? " is-active" : ""}`}
                  onClick={() => setMobileBrowseTab("folders")}
                >
                  Folders
                </button>
              </div>

              {mobileBrowseTab === "notes" ? renderListPanel() : renderSidebar(true)}
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
