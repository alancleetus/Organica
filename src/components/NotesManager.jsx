import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import RestoreFromTrashOutlinedIcon from "@mui/icons-material/RestoreFromTrashOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import Settings3LineIcon from "remixicon-react/Settings3LineIcon";
import PencilLineIcon from "remixicon-react/PencilLineIcon";
import EyeLineIcon from "remixicon-react/EyeLineIcon";
import EyeOffLineIcon from "remixicon-react/EyeOffLineIcon";
import DeleteBinLineIcon from "remixicon-react/DeleteBinLineIcon";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./Header";
import Note from "./Note";
import AddNoteModal from "./AddNoteModal";
import FocusNotePanel from "./FocusNotePanel";
import AddNoteFab from "./AddNoteFab";
import NoteListItem from "./NoteListItem";
import { fetchNotes } from "../utils/fetchNotes.js";
import { formatDate, loadDateFormat } from "../utils/dateFormat.js";
import {
  ReplaceTagsForNote,
  DeleteNote,
  SoftDeleteNote,
  RestoreNote,
  ArchiveNote,
  CreateNote,
} from "../utils/notesCrud";
import { toast } from "react-toastify";
import {
  PRIMARY_LIBRARY_FILTERS,
  QUICK_LIBRARY_FILTERS,
  UNCATEGORIZED_FILTER_ID,
  UNCATEGORIZED_LABEL,
  loadLibraryOrder,
  loadLibraryLabels,
  loadDisabledLibraryFilters,
  getLibraryLabel,
} from "../utils/bottomBarConfig";
import { loadAvatarSeed } from "../utils/identicon";
import Identicon from "./Identicon";
import { CreateTag, UpdateTag, DeleteTag, FetchTagsByUser } from "../utils/tagsCrud";
import Sorter from "./Sorter";
import { getSearchableText, isChecklistContent } from "../utils/noteContent";

const BOTTOM_BAR_ICONS = {
  all: DescriptionOutlinedIcon,
  pinned: PushpinLineIcon,
  favorites: HeartLineIcon,
  tasks: FactCheckOutlinedIcon,
  "notes-only": NotesOutlinedIcon,
  uncategorized: FolderOffOutlinedIcon,
  calendar: CalendarMonthOutlinedIcon,
  archived: ArchiveOutlinedIcon,
  trash: DeleteOutlineOutlinedIcon,
};

const RESERVED_FILTERS = [
  "all",
  "pinned",
  "favorites",
  "tasks",
  "notes-only",
  "uncategorized",
  "calendar",
  "archived",
  "trash",
];

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

function NotesManager({ palette, setPalette }) {
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
  const [addNoteInitialType, setAddNoteInitialType] = useState("text");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [mobileBrowseTab, setMobileBrowseTab] = useState("notes");
  const [isMobilePickerOpen, setIsMobilePickerOpen] = useState(false);
  const [mobileScreen, setMobileScreen] = useState("browse");
  const [renamingFolder, setRenamingFolder] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);
  const [folderOrder, setFolderOrder] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("folderOrder"));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [folderRenameDraft, setFolderRenameDraft] = useState("");
  const [tagDocs, setTagDocs] = useState([]);
  const [libraryOrder] = useState(() => loadLibraryOrder());
  const [libraryLabels] = useState(() => loadLibraryLabels());
  const [dateFormat] = useState(() => loadDateFormat());
  const [disabledLibraryFilters] = useState(
    () => new Set(loadDisabledLibraryFilters())
  );
  const enabledLibraryOrder = libraryOrder.filter(
    (filterId) => !disabledLibraryFilters.has(filterId)
  );
  const [avatarSeed] = useState(() => loadAvatarSeed(user?.uid));
  const [focusNoteId, setFocusNoteId] = useState(
    () => localStorage.getItem("focusNoteId") || null
  );
  const [isFocusNoteFullScreen, setIsFocusNoteFullScreen] = useState(false);

  useEffect(() => {
    if (focusNoteId) {
      localStorage.setItem("focusNoteId", focusNoteId);
    } else {
      localStorage.removeItem("focusNoteId");
    }
  }, [focusNoteId]);
  const overlayPushedRef = useRef(false);

  // Backs the PWA's home-screen long-press shortcuts (manifest.json),
  // which land here as /main?new=note or /main?new=checklist — opens the
  // create modal straight to that type instead of leaving the shortcut
  // as a no-op. Runs once on mount; the param is stripped right after so
  // refreshing or navigating back doesn't reopen the modal.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get("new");
    if (requestedType === "note" || requestedType === "checklist") {
      setAddNoteInitialType(requestedType === "checklist" ? "checklist" : "text");
      setIsAddNoteOpen(true);
      params.delete("new");
      const nextSearch = params.toString();
      window.history.replaceState(
        null,
        "",
        window.location.pathname + (nextSearch ? `?${nextSearch}` : "")
      );
    }
  }, []);

  useEffect(() => {
    // Matches the CSS mobile-shell breakpoint (900px) in styles.css.
    // Below this, the well-tested single-panel-plus-bottom-nav shell
    // takes over; above it, the 3-column desktop grid has room to work.
    // There used to be a gap between 640px (this threshold) and 900px
    // (where the desktop grid tried to cram sidebar+list+detail into a
    // single scrolling column) that was effectively an unfinished
    // "tablet mode" — this raises the threshold instead of trying to
    // maintain a third, in-between layout.
    const mediaQuery = window.matchMedia("(max-width: 900px)");
    const updateLayout = () => setIsMobileLayout(mediaQuery.matches);

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);

    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  useEffect(() => {
    if (!isMobileLayout) {
      setMobileScreen("browse");
      setMobileBrowseTab("notes");
      overlayPushedRef.current = false;
    }
  }, [isMobileLayout]);

  // On mobile, note detail and the add-note modal are "overlay" screens
  // layered on top of the browse list, not real routes. Without this,
  // the phone's swipe-back gesture (or the OS back button) has no SPA
  // history entry to consume, so it falls through to the browser's own
  // history — leaving the app entirely instead of closing the overlay.
  // Syncing a single synthetic history entry to whichever overlay is
  // open lets that gesture close the overlay instead.
  useEffect(() => {
    if (!isMobileLayout) return;

    const isOverlayOpen =
      isAddNoteOpen || mobileScreen === "detail" || isFocusNoteFullScreen;

    if (isOverlayOpen && !overlayPushedRef.current) {
      overlayPushedRef.current = true;
      window.history.pushState({ notesOverlay: true }, "");
    } else if (!isOverlayOpen && overlayPushedRef.current) {
      overlayPushedRef.current = false;
      if (window.history.state?.notesOverlay) {
        window.history.back();
      }
    }
  }, [isAddNoteOpen, mobileScreen, isFocusNoteFullScreen, isMobileLayout]);

  useEffect(() => {
    if (!isMobileLayout) return;

    const handlePopState = () => {
      overlayPushedRef.current = false;
      setIsAddNoteOpen(false);
      setMobileScreen("browse");
      setMobileBrowseTab("notes");
      setIsFocusNoteFullScreen(false);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isMobileLayout]);

  // Desktop has no swipe-back gesture to close the fullscreen focus note
  // with, so Escape is its equivalent there — mobile already gets a close
  // path for free via the history popstate handler above.
  useEffect(() => {
    if (!isFocusNoteFullScreen) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsFocusNoteFullScreen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocusNoteFullScreen]);

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

  // tagName -> { id, tagColor } for folders that have been color-coded
  // via the tagsCrud.jsx sidecar collection (notes only store tag
  // *names*, so this is a separate lookup, not part of the note itself).
  const tagColorDocsByName = useMemo(() => {
    const map = new Map();
    tagDocs.forEach((doc) => {
      map.set(doc.tagName, doc);
    });
    return map;
  }, [tagDocs]);

  // Hidden folders (e.g. a personal tracker) are marked via the same
  // tagsCrud.jsx doc used for color, so the flag syncs across devices
  // instead of living per-browser. They still show up in the sidebar
  // (and stay navigable/deletable) even once emptied out — a regular
  // folder just disappears once its last note is untagged.
  const hiddenFolderNames = useMemo(() => {
    const set = new Set();
    tagDocs.forEach((doc) => {
      if (doc.tagHidden) set.add(doc.tagName);
    });
    return set;
  }, [tagDocs]);

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
    hiddenFolderNames.forEach((name) => {
      if (!counts.has(name)) counts.set(name, 0);
    });

    const list = Array.from(counts.entries()).map(([name, count]) => ({
      name,
      count,
      isHidden: hiddenFolderNames.has(name),
    }));

    // Folders in the saved custom order come first, in that order; any
    // folder not in it (new, or never manually reordered) is appended
    // alphabetically after, so newly-created folders still show up
    // predictably instead of vanishing from the sort entirely.
    const orderIndex = new Map(folderOrder.map((name, index) => [name, index]));
    return list.sort((a, b) => {
      const aIndex = orderIndex.has(a.name) ? orderIndex.get(a.name) : Infinity;
      const bIndex = orderIndex.has(b.name) ? orderIndex.get(b.name) : Infinity;
      if (aIndex !== bIndex) return aIndex - bIndex;
      return a.name.localeCompare(b.name);
    });
  }, [notes, hiddenFolderNames, folderOrder]);

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

  const visibleNotes = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return sortedNotes.filter((note) => {
      // Trashed notes are only ever visible from the Trash filter itself —
      // every other view (including Archived) hard-excludes them, the
      // same way Archived already hard-excludes everything else.
      if (activeFilter === "trash") {
        if (!note.isDeleted) return false;
      } else {
        if (note.isDeleted) return false;

        if (activeFilter === "archived") {
          if (!note.isArchived) return false;
        } else if (activeFilter === "calendar") {
          if (note.isArchived) return false;
          if (!note.dueDateTime) return false;
        } else {
          if (note.isArchived) return false;

          const matchesFilter =
            activeFilter === "all" ||
            (activeFilter === "pinned" && note.isPinned) ||
            (activeFilter === "favorites" && note.isFavorite) ||
            (activeFilter === "tasks" && isChecklistContent(note.content)) ||
            (activeFilter === "notes-only" && !isChecklistContent(note.content)) ||
            (activeFilter === "uncategorized" && (note.tags || []).length === 0) ||
            (!RESERVED_FILTERS.includes(activeFilter) &&
              (note.tags || []).includes(activeFilter));

          if (!matchesFilter) return false;

          // A note tagged into a hidden folder (e.g. a personal tracker)
          // only shows up while browsing that folder directly, or while
          // actively searching — passive browsing (All Notes, Pinned,
          // other folders...) is what it stays out of, not search.
          const noteTags = note.tags || [];
          const hasHiddenTag = noteTags.some((tag) => hiddenFolderNames.has(tag));
          const viewingThatHiddenFolder =
            hiddenFolderNames.has(activeFilter) && noteTags.includes(activeFilter);
          if (hasHiddenTag && !viewingThatHiddenFolder && !normalizedSearch) return false;
        }
      }

      if (!normalizedSearch) return true;

      const title = note.title?.toLowerCase() || "";
      const content = getSearchableText(note.content);
      return (
        title.includes(normalizedSearch) || content.includes(normalizedSearch)
      );
    });
  }, [sortedNotes, activeFilter, searchTerm, hiddenFolderNames]);

  // Buckets calendar-view notes into Overdue / Today / This Week / This
  // Month / Later — a rolling window from "now", not a literal Mon-Sun
  // week or a fixed 5-week grid, since the ask was date-range grouping
  // rather than a full month-grid calendar widget.
  const calendarGroups = useMemo(() => {
    if (activeFilter !== "calendar") return null;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const groups = {
      overdue: { label: "Overdue", notes: [] },
      today: { label: "Today", notes: [] },
      thisWeek: { label: "This Week", notes: [] },
      thisMonth: { label: "This Month", notes: [] },
      later: { label: "Later", notes: [] },
    };

    const withDueDates = visibleNotes
      .filter((note) => note.dueDateTime)
      .sort((a, b) => new Date(a.dueDateTime) - new Date(b.dueDateTime));

    withDueDates.forEach((note) => {
      const due = new Date(note.dueDateTime);
      if (due < todayStart) groups.overdue.notes.push(note);
      else if (due < todayEnd) groups.today.notes.push(note);
      else if (due < weekEnd) groups.thisWeek.notes.push(note);
      else if (due < monthEnd) groups.thisMonth.notes.push(note);
      else groups.later.notes.push(note);
    });

    return Object.values(groups).filter((group) => group.notes.length > 0);
  }, [visibleNotes, activeFilter]);

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

  useEffect(() => {
    document.title = selectedNote?.title?.trim()
      ? `${selectedNote.title.trim()} — Organica`
      : "Organica";

    return () => {
      document.title = "Organica";
    };
  }, [selectedNote?.title]);

  const isSelectedNoteReadOnly =
    !!selectedNote &&
    (selectedNote.isArchived ||
      selectedNote.isDeleted ||
      (selectedNote.tags || []).some((tag) => hiddenFolderNames.has(tag)));
  const activeNotes = notes.filter((note) => !note.isArchived && !note.isDeleted);
  const pinnedCount = activeNotes.filter((note) => note.isPinned).length;
  const favoriteCount = activeNotes.filter((note) => note.isFavorite).length;
  const checklistCount = activeNotes.filter((note) =>
    isChecklistContent(note.content)
  ).length;
  const archivedCount = notes.filter((note) => note.isArchived && !note.isDeleted).length;
  const trashCount = notes.filter((note) => note.isDeleted).length;
  const calendarCount = activeNotes.filter((note) => note.dueDateTime).length;
  const uncategorizedCount = activeNotes.filter(
    (note) => (note.tags || []).length === 0
  ).length;
  const libraryCounts = {
    all: activeNotes.length,
    pinned: pinnedCount,
    favorites: favoriteCount,
    tasks: checklistCount,
    "notes-only": activeNotes.length - checklistCount,
    uncategorized: uncategorizedCount,
    calendar: calendarCount,
    archived: archivedCount,
    trash: trashCount,
  };
  const hasScopedView = activeFilter !== "all" || searchTerm.trim() !== "";

  const handleSelectNote = (noteId) => {
    setSelectedNoteId(noteId);
    if (isMobileLayout) {
      setMobileScreen("detail");
    }
  };

  const focusNote = notes.find((note) => note.id === focusNoteId) || null;
  const isFocusNoteReadOnly =
    !!focusNote &&
    (focusNote.isArchived ||
      focusNote.isDeleted ||
      (focusNote.tags || []).some((tag) => hiddenFolderNames.has(tag)));

  const handleToggleFocusNote = (noteId) => {
    setFocusNoteId((prev) => (prev === noteId ? null : noteId));
  };

  // Deleting moves a note to the Trash rather than removing it outright —
  // the 5-second "Undo" toast is just a fast path back; the note also
  // stays reachable and restorable from the Trash filter itself for the
  // full retention window (see TRASH_RETENTION_MS in fetchNotes.js).
  const handleDeleteNote = (note) => {
    if (!note) return;

    SoftDeleteNote(note.id, setNotes);
    if (selectedNoteId === note.id) {
      setSelectedNoteId(null);
      if (isMobileLayout && mobileScreen === "detail") {
        window.history.back();
      }
    }
    if (focusNoteId === note.id) {
      setIsFocusNoteFullScreen(false);
      setFocusNoteId(null);
    }

    toast(
      ({ closeToast }) => (
        <div className="undo-toast">
          <span>Note moved to Trash</span>
          <button
            type="button"
            className="undo-toast-button"
            onClick={() => {
              RestoreNote(note.id, setNotes);
              closeToast();
            }}
          >
            Undo
          </button>
        </div>
      ),
      { autoClose: 5000, closeButton: false }
    );
  };

  const handleRestoreNote = (note) => {
    if (!note) return;
    RestoreNote(note.id, setNotes);
  };

  // Unlike handleDeleteNote, this one is not reversible — it's only
  // reachable from within the Trash view itself, on a note the user has
  // already moved there deliberately once.
  const handlePermanentlyDeleteNote = (note) => {
    if (!note) return;
    if (selectedNoteId === note.id) setSelectedNoteId(null);
    DeleteNote(note.id, setNotes);
  };

  const handleArchiveNote = (note) => {
    if (!note) return;

    const nextArchived = !note.isArchived;
    ArchiveNote(note.id, nextArchived, setNotes);

    if (selectedNoteId === note.id && nextArchived) {
      setSelectedNoteId(null);
      if (isMobileLayout && mobileScreen === "detail") {
        window.history.back();
      }
    }
  };

  const handleDuplicateNote = async (note) => {
    if (!note || !user) return;

    const createdNote = await CreateNote({
      user,
      title: note.title,
      content: note.content,
      noteType: note.noteType,
      tags: note.tags || [],
      setNotes,
    });

    if (createdNote) {
      handleSelectNote(createdNote.id);
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

  const reorderFolders = (draggedName, targetName) => {
    if (draggedName === targetName) return;

    const current = folders.map((folder) => folder.name);
    const from = current.indexOf(draggedName);
    const to = current.indexOf(targetName);
    if (from === -1 || to === -1) return;

    const next = [...current];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    setFolderOrder(next);
    localStorage.setItem("folderOrder", JSON.stringify(next));
  };

  // One drop target serves two drag sources: a note card (add it to this
  // folder) or another folder row (reorder it before this one) — the two
  // use different dataTransfer types so this can tell them apart.
  const handleFolderDrop = (event, folderName) => {
    event.preventDefault();
    setDragOverFolder(null);

    const draggedFolder = event.dataTransfer.getData("application/x-organica-folder-name");
    if (draggedFolder) {
      reorderFolders(draggedFolder, folderName);
      return;
    }

    const noteId = event.dataTransfer.getData("application/x-organica-note-id");
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const currentTags = note.tags || [];
    if (currentTags.includes(folderName)) return;

    ReplaceTagsForNote(note.id, [...currentTags, folderName], setNotes);
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

  // Mobile folder tiles rename via long-press instead of a visible pencil
  // button — the button's solid background never blended with a folder's
  // own accent color. A 500ms hold opens rename; releasing sooner (or
  // dragging past a small threshold, e.g. a scroll) falls through to a
  // normal tap/select instead.
  const folderLongPressRef = useRef({ timer: null, fired: false, startX: 0, startY: 0 });

  const clearFolderLongPress = () => {
    clearTimeout(folderLongPressRef.current.timer);
    folderLongPressRef.current.timer = null;
  };

  const handleFolderPressStart = (folderName, event) => {
    folderLongPressRef.current.fired = false;
    folderLongPressRef.current.startX = event.clientX;
    folderLongPressRef.current.startY = event.clientY;
    clearFolderLongPress();
    folderLongPressRef.current.timer = setTimeout(() => {
      folderLongPressRef.current.fired = true;
      startRenamingFolder(folderName);
    }, 500);
  };

  const handleFolderPressMove = (event) => {
    if (!folderLongPressRef.current.timer) return;
    const dx = Math.abs(event.clientX - folderLongPressRef.current.startX);
    const dy = Math.abs(event.clientY - folderLongPressRef.current.startY);
    if (dx > 10 || dy > 10) clearFolderLongPress();
  };

  const handleFolderClick = (folderName) => {
    if (folderLongPressRef.current.fired) {
      folderLongPressRef.current.fired = false;
      return;
    }
    handleFilterSelect(folderName);
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

    // Carries the folder's color and/or hidden flag over to the new name —
    // both live on this one doc, so a single rename covers whichever of
    // them (if any) is set, instead of tracking hidden state separately.
    const existingTagDoc = tagColorDocsByName.get(oldName);
    if (existingTagDoc) {
      UpdateTag({ id: existingTagDoc.id, tagName: nextName }).then((updated) => {
        if (!updated) {
          alert("Couldn't rename this folder's saved settings. Please try again.");
          return;
        }
        setTagDocs((prev) =>
          prev.map((doc) =>
            doc.id === existingTagDoc.id ? { ...doc, tagName: nextName } : doc
          )
        );
      });
    }

    if (activeFilter === oldName) {
      setActiveFilter(nextName);
    }
  };

  // Create-or-update the tagsCrud.jsx doc for a folder name with the given
  // fields (tagColor and/or tagHidden). The /tags security rule checks the
  // *existing* doc's userId, which can't be evaluated for a doc that no
  // longer exists — Firestore then reports that as "permission-denied"
  // rather than "not found," indistinguishable from a real permission
  // error. So a cached doc id going stale (the doc was deleted, or this
  // tab's tagDocs just drifted from another tab/device) looks identical to
  // a genuine failure. Rather than surface that ambiguity immediately, a
  // failed update re-confirms against a fresh list fetch (a `list` query,
  // unaffected by one missing doc) and either retries against the doc's
  // current id or creates a fresh one before actually giving up.
  const upsertFolderTag = async (folderName, fields) => {
    const existing = tagColorDocsByName.get(folderName);

    if (existing) {
      const updated = await UpdateTag({ id: existing.id, ...fields });
      if (updated) {
        setTagDocs((prev) =>
          prev.map((doc) => (doc.id === existing.id ? { ...doc, ...fields } : doc))
        );
        return true;
      }

      const freshTags = (await FetchTagsByUser(user.uid)) || [];
      setTagDocs(freshTags);
      const stillExists = freshTags.find((doc) => doc.tagName === folderName);

      if (stillExists) {
        const retried = await UpdateTag({ id: stillExists.id, ...fields });
        if (!retried) return false;
        setTagDocs((prev) =>
          prev.map((doc) => (doc.id === stillExists.id ? { ...doc, ...fields } : doc))
        );
        return true;
      }

      const created = await CreateTag({ userId: user.uid, tagName: folderName, ...fields });
      if (!created) return false;
      setTagDocs((prev) => [...prev, created]);
      return true;
    }

    const created = await CreateTag({ userId: user.uid, tagName: folderName, ...fields });
    if (!created) return false;
    setTagDocs((prev) => [...prev, created]);
    return true;
  };

  // Assign (or clear, colorId === null) a folder's color.
  const handleFolderColorChange = async (folderName, colorId) => {
    const existing = tagColorDocsByName.get(folderName);

    if (existing && !colorId) {
      const result = await DeleteTag(existing.id);
      if (!result) {
        alert("Couldn't update this folder's color. Please try again.");
        return;
      }
      setTagDocs((prev) => prev.filter((doc) => doc.id !== existing.id));
      return;
    }

    if (!existing && !colorId) return;

    const ok = await upsertFolderTag(folderName, { tagColor: colorId });
    if (!ok) alert("Couldn't update this folder's color. Please try again.");
  };

  // Assign (or clear) a folder's hidden flag — synced through the account
  // via the same tag doc used for color, not per-device localStorage.
  const handleFolderHiddenChange = async (folderName, hidden) => {
    const existing = tagColorDocsByName.get(folderName);
    if (!existing && !hidden) return;

    const ok = await upsertFolderTag(folderName, { tagHidden: hidden });
    if (!ok) alert("Couldn't update this folder. Please try again.");
  };

  // Folders are derived from notes-in-use, so this only ever really
  // "does" anything for a hidden folder that's been fully emptied out
  // (a regular folder already vanished from the list at that point) —
  // otherwise it blocks with a message rather than silently no-op-ing.
  const handleDeleteFolder = (folderName) => {
    const folder = folders.find((f) => f.name === folderName);
    if (folder && folder.count > 0) {
      alert(`Remove all notes from "${folderName}" before deleting it.`);
      return;
    }

    const existing = tagColorDocsByName.get(folderName);
    if (existing) {
      DeleteTag(existing.id).then((result) => {
        if (!result) {
          alert("Couldn't delete this folder. Please try again.");
          return;
        }
        setTagDocs((prev) => prev.filter((doc) => doc.id !== existing.id));
      });
    }

    if (activeFilter === folderName) {
      setActiveFilter("all");
    }
  };

  // A smart view over notes with no folder, pinned at the top of the
  // Folders list — it isn't a real folder (nothing to rename, recolor,
  // drag, or delete), so it gets its own minimal row rather than
  // reusing the full folder row/tile markup.
  const renderUncategorizedRow = (grid) => (
    <button
      type="button"
      className={`${grid ? "notes-folder-tile" : "notes-sidebar-link"}${activeFilter === UNCATEGORIZED_FILTER_ID ? " is-active" : ""}`}
      onClick={() => handleFilterSelect(UNCATEGORIZED_FILTER_ID)}
    >
      <FolderOffOutlinedIcon aria-hidden="true" />
      <span className={grid ? "notes-folder-tile-label" : "notes-sidebar-link-label"}>
        {UNCATEGORIZED_LABEL}
      </span>
      <span className={grid ? "notes-folder-tile-count" : "notes-sidebar-link-count"}>
        {grid ? `${uncategorizedCount} note${uncategorizedCount === 1 ? "" : "s"}` : uncategorizedCount}
      </span>
    </button>
  );

  const renderColorSwatchRow = (folderName) => {
    const currentColorId = tagColorDocsByName.get(folderName)?.tagColor || null;
    const isHidden = hiddenFolderNames.has(folderName);
    const isEmpty = folders.find((folder) => folder.name === folderName)?.count === 0;

    return (
      <>
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
        <div className="folder-extra-actions-row">
          <button
            type="button"
            className={`folder-extra-action${isHidden ? " is-active" : ""}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => handleFolderHiddenChange(folderName, !isHidden)}
          >
            {isHidden ? <EyeOffLineIcon /> : <EyeLineIcon />}
            <span>{isHidden ? "Hidden from All Notes" : "Hide from All Notes"}</span>
          </button>
          {isEmpty && (
            <button
              type="button"
              className="folder-extra-action folder-extra-action-delete"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleDeleteFolder(folderName)}
            >
              <DeleteBinLineIcon />
              <span>Delete folder</span>
            </button>
          )}
        </div>
      </>
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
      {searchTerm && (
        <button
          type="button"
          className="notes-search-clear"
          aria-label="Clear search"
          onClick={() => {
            setSearchTerm("");
            searchInputRef.current?.focus();
          }}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );

  const renderSidebar = (foldersAsGrid = false) => (
    <aside className="notes-sidebar">
      <div className="notes-sidebar-top">
        <div className="notes-sidebar-profile">
          <span className="notes-avatar">
            <Identicon seed={avatarSeed} size={20} />
          </span>
          <span className="notes-sidebar-profile-name">
            {user?.displayName || user?.email || "My workspace"}
          </span>
        </div>

        {!foldersAsGrid && renderSearchInput()}

        <div className="notes-sidebar-section">
          <p className="notes-sidebar-group-label">Library</p>
          {enabledLibraryOrder
            .filter((filterId) => PRIMARY_LIBRARY_FILTERS.includes(filterId))
            .map((filterId) => {
              const Icon = BOTTOM_BAR_ICONS[filterId];
              if (!Icon) return null;

              return (
                <button
                  type="button"
                  key={filterId}
                  className={`notes-sidebar-link${activeFilter === filterId ? " is-active" : ""}`}
                  onClick={() => handleFilterSelect(filterId)}
                >
                  <Icon />
                  <span className="notes-sidebar-link-label">
                    {getLibraryLabel(filterId, libraryLabels)}
                  </span>
                  <span className="notes-sidebar-link-count">
                    {libraryCounts[filterId]}
                  </span>
                </button>
              );
            })}

          {enabledLibraryOrder.some((filterId) => QUICK_LIBRARY_FILTERS.includes(filterId)) && (
            <div className="notes-sidebar-quick-row">
              {enabledLibraryOrder
                .filter((filterId) => QUICK_LIBRARY_FILTERS.includes(filterId))
                .map((filterId) => {
                  const Icon = BOTTOM_BAR_ICONS[filterId];
                  if (!Icon) return null;

                  return (
                    <button
                      type="button"
                      key={filterId}
                      className={`notes-sidebar-quick-button${activeFilter === filterId ? " is-active" : ""}`}
                      onClick={() => handleFilterSelect(filterId)}
                      aria-label={getLibraryLabel(filterId, libraryLabels)}
                      title={getLibraryLabel(filterId, libraryLabels)}
                    >
                      <Icon />
                      {libraryCounts[filterId] > 0 && (
                        <span className="notes-sidebar-quick-count">
                          {libraryCounts[filterId]}
                        </span>
                      )}
                    </button>
                  );
                })}
            </div>
          )}
        </div>

        <div className="notes-sidebar-folders-section">
          <p className="notes-sidebar-group-label">Folders</p>
          {foldersAsGrid ? (
            <div className="notes-folder-grid">
              {renderUncategorizedRow(true)}
              {folders.map((folder) =>
                renamingFolder === folder.name ? (
                  <form
                    key={folder.name}
                    className={`notes-folder-tile notes-folder-tile-rename${tagColors[folder.name] ? " has-folder-color" : ""}`}
                    style={tagColors[folder.name] ? { "--folder-accent": tagColors[folder.name] } : undefined}
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
                  <button
                    type="button"
                    key={folder.name}
                    className={`notes-folder-tile${tagColors[folder.name] ? " has-folder-color" : ""}${dragOverFolder === folder.name ? " is-drag-over" : ""}`}
                    style={tagColors[folder.name] ? { "--folder-accent": tagColors[folder.name] } : undefined}
                    aria-label={`${folder.name} folder — press and hold to rename`}
                    onClick={() => handleFolderClick(folder.name)}
                    onPointerDown={(event) => handleFolderPressStart(folder.name, event)}
                    onPointerMove={handleFolderPressMove}
                    onPointerUp={clearFolderLongPress}
                    onPointerLeave={clearFolderLongPress}
                    onPointerCancel={clearFolderLongPress}
                    onContextMenu={(event) => event.preventDefault()}
                    draggable
                    onDragStart={(event) => {
                      clearFolderLongPress();
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData(
                        "application/x-organica-folder-name",
                        folder.name
                      );
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverFolder(folder.name);
                    }}
                    onDragLeave={() =>
                      setDragOverFolder((prev) => (prev === folder.name ? null : prev))
                    }
                    onDrop={(event) => handleFolderDrop(event, folder.name)}
                  >
                    {folder.isHidden ? (
                      <EyeOffLineIcon aria-hidden="true" />
                    ) : (
                      <FolderOutlinedIcon aria-hidden="true" />
                    )}
                    <span className="notes-folder-tile-label">{folder.name}</span>
                    <span className="notes-folder-tile-count">
                      {folder.count} note{folder.count === 1 ? "" : "s"}
                    </span>
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="notes-sidebar-folders">
              {renderUncategorizedRow(false)}
              {folders.map((folder) =>
                renamingFolder === folder.name ? (
                  <form
                    key={folder.name}
                    className={`notes-sidebar-link notes-sidebar-link-rename${tagColors[folder.name] ? " has-folder-color" : ""}`}
                    style={tagColors[folder.name] ? { "--folder-accent": tagColors[folder.name] } : undefined}
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
                      className={`notes-sidebar-link${activeFilter === folder.name ? " is-active" : ""}${tagColors[folder.name] ? " has-folder-color" : ""}${dragOverFolder === folder.name ? " is-drag-over" : ""}`}
                      style={tagColors[folder.name] ? { "--folder-accent": tagColors[folder.name] } : undefined}
                      onClick={() => handleFilterSelect(folder.name)}
                      draggable
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        event.dataTransfer.setData(
                          "application/x-organica-folder-name",
                          folder.name
                        );
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDragOverFolder(folder.name);
                      }}
                      onDragLeave={() =>
                        setDragOverFolder((prev) => (prev === folder.name ? null : prev))
                      }
                      onDrop={(event) => handleFolderDrop(event, folder.name)}
                    >
                      {folder.isHidden ? <EyeOffLineIcon /> : <FolderOutlinedIcon />}
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
        <Header notes={notes} palette={palette} setPalette={setPalette} />
      </div>
    </aside>
  );

  const renderListPanel = () => (
    <section className="notes-list-panel">
      <div className="sectioned-div notes-panel-header">
        <div className="section-title">
          {isMobileLayout ? (
            <div className="notes-panel-picker">
              <button
                type="button"
                className="notes-panel-picker-trigger"
                onClick={() => setIsMobilePickerOpen((prev) => !prev)}
                aria-expanded={isMobilePickerOpen}
              >
                <h2>{getLibraryLabel(activeFilter, libraryLabels)}</h2>
                <ArrowDropDownIcon />
              </button>

              {isMobilePickerOpen && (
                <>
                  <button
                    type="button"
                    className="notes-panel-picker-backdrop"
                    aria-label="Close"
                    onClick={() => setIsMobilePickerOpen(false)}
                  />
                  <div className="notes-panel-picker-menu">
                    <p className="notes-sidebar-group-label">Library</p>
                    {enabledLibraryOrder.map((filterId) => (
                      <button
                        type="button"
                        key={filterId}
                        className={`notes-panel-picker-item${activeFilter === filterId ? " is-active" : ""}`}
                        onClick={() => {
                          handleFilterSelect(filterId);
                          setIsMobilePickerOpen(false);
                        }}
                      >
                        <span>{getLibraryLabel(filterId, libraryLabels)}</span>
                        <span className="notes-panel-picker-count">
                          {libraryCounts[filterId]}
                        </span>
                      </button>
                    ))}

                    {folders.length > 0 && (
                      <>
                        <p className="notes-sidebar-group-label">Folders</p>
                        {folders.map((folder) => (
                          <button
                            type="button"
                            key={folder.name}
                            className={`notes-panel-picker-item${activeFilter === folder.name ? " is-active" : ""}`}
                            onClick={() => {
                              handleFilterSelect(folder.name);
                              setIsMobilePickerOpen(false);
                            }}
                          >
                            <span>{folder.name}</span>
                            <span className="notes-panel-picker-count">{folder.count}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <h2>{getLibraryLabel(activeFilter, libraryLabels)}</h2>
          )}
          <p className="section-badge">{visibleNotes.length}</p>
        </div>
        {activeFilter !== "calendar" && (
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
        )}
      </div>

      <AddNoteFab onClick={() => setIsAddNoteOpen(true)} />

      {isMobileLayout && (
        <div className="notes-list-tools">{renderSearchInput()}</div>
      )}

      <div className="notes-list-scroll">
        {!visibleNotes.length ? (
          <div className="notes-list-empty">
            <p className="notes-detail-label">
              {activeFilter === "trash"
                ? "Trash is empty"
                : activeFilter === "calendar"
                  ? "Nothing scheduled"
                  : "No matches"}
            </p>
            <h3>
              {activeFilter === "trash"
                ? "Deleted notes show up here."
                : activeFilter === "calendar"
                  ? "No notes have a due date yet."
                  : hasScopedView
                    ? "Your current view is hiding notes."
                    : "Nothing fits this view right now."}
            </h3>
            <p>
              {activeFilter === "trash"
                ? "Anything you delete stays here for 30 days before it's gone for good."
                : activeFilter === "calendar"
                  ? "Open a note and set a due date to see it here."
                  : hasScopedView
                    ? "Clear search and filters to show every note again."
                    : "Try a different filter, clear search, or create a new note."}
            </p>
            {hasScopedView && activeFilter !== "calendar" && activeFilter !== "trash" && (
              <button
                type="button"
                className="notes-list-reset"
                onClick={resetListView}
              >
                Show all notes
              </button>
            )}
          </div>
        ) : activeFilter === "trash" ? (
          visibleNotes.map((note) => (
            <div className="trash-list-item" key={note.id}>
              <div className="trash-list-item-info">
                <h3 className="trash-list-item-title">
                  {note.title?.trim() || "Untitled note"}
                </h3>
                <p className="trash-list-item-meta">
                  Deleted {formatDate(note.deletedDate, dateFormat)}
                </p>
              </div>
              <div className="trash-list-item-actions">
                <button
                  type="button"
                  className="trash-list-item-action"
                  aria-label="Restore note"
                  onClick={() => handleRestoreNote(note)}
                >
                  <RestoreFromTrashOutlinedIcon />
                </button>
                <button
                  type="button"
                  className="trash-list-item-action trash-list-item-action-delete"
                  aria-label="Delete forever"
                  onClick={() => {
                    const label = note.title?.trim() || "Untitled note";
                    if (window.confirm(`Permanently delete "${label}"? This can't be undone.`)) {
                      handlePermanentlyDeleteNote(note);
                    }
                  }}
                >
                  <DeleteForeverOutlinedIcon />
                </button>
              </div>
            </div>
          ))
        ) : activeFilter === "calendar" ? (
          calendarGroups.map((group) => (
            <div className="calendar-group" key={group.label}>
              <p className="calendar-group-label">{group.label}</p>
              {group.notes.map((note) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  isSelected={note.id === selectedNoteId}
                  onSelect={handleSelectNote}
                  setNotes={setNotes}
                  tagColors={tagColors}
                  isMobileLayout={isMobileLayout}
                />
              ))}
            </div>
          ))
        ) : (
          visibleNotes.map((note) => (
            <NoteListItem
              key={note.id}
              note={note}
              isSelected={note.id === selectedNoteId}
              onSelect={handleSelectNote}
              setNotes={setNotes}
              tagColors={tagColors}
              isMobileLayout={isMobileLayout}
            />
          ))
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
                {getLibraryLabel(activeFilter, libraryLabels)} /{" "}
                {selectedNote.title?.trim() || "Untitled note"}
              </p>
            </div>
            <div className="notes-detail-meta-actions">
              {mobile && (
                <button
                  type="button"
                  className="notes-mobile-back"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeftLineIcon />
                  <span>All Notes</span>
                </button>
              )}
              <div className="notes-detail-meta-pill">
                <span>Last updated</span>
                <p className="notes-detail-date">
                  {formatDate(
                    selectedNote.modifiedDate || selectedNote.creationDate,
                    dateFormat
                  )}
                </p>
              </div>
            </div>
          </div>

          <Note
            key={selectedNote.id}
            id={selectedNote.id}
            title={selectedNote.title}
            createdDate={selectedNote.creationDate}
            updatedDate={selectedNote.modifiedDate}
            dateFormat={dateFormat}
            content={selectedNote.content}
            noteType={selectedNote.noteType}
            isPinned={selectedNote.isPinned}
            isFavorite={selectedNote.isFavorite}
            isArchived={selectedNote.isArchived}
            isReadOnly={isSelectedNoteReadOnly}
            dueDateTime={selectedNote.dueDateTime}
            reminderDateTime={selectedNote.reminderDateTime}
            recurrenceRule={selectedNote.recurrenceRule}
            tags={selectedNote.tags || []}
            tagColors={tagColors}
            existingFolders={folders.map((folder) => folder.name)}
            setNotes={setNotes}
            onDelete={() => handleDeleteNote(selectedNote)}
            onArchive={() => handleArchiveNote(selectedNote)}
            onDuplicate={() => handleDuplicateNote(selectedNote)}
            isFocusNote={selectedNote.id === focusNoteId}
            onToggleFocus={() => handleToggleFocusNote(selectedNote.id)}
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

  const renderMobileBottomTabs = () => (
    <div className="notes-mobile-nav">
      <button
        type="button"
        className="notes-mobile-add-fab"
        aria-label="Add note"
        onClick={() => setIsAddNoteOpen(true)}
      >
        <AddIcon />
      </button>

      <nav className="notes-mobile-bottom-tabs">
        <button
          type="button"
          className={`notes-mobile-bottom-tab${mobileBrowseTab === "folders" ? " is-active" : ""}`}
          onClick={() => setMobileBrowseTab("folders")}
        >
          <HomeOutlinedIcon />
          <span>Home</span>
        </button>
        <button
          type="button"
          className={`notes-mobile-bottom-tab${
            mobileBrowseTab === "notes" && activeFilter === "notes-only" ? " is-active" : ""
          }`}
          onClick={() => handleFilterSelect("notes-only")}
        >
          <NotesOutlinedIcon />
          <span>Notes</span>
        </button>
        <button
          type="button"
          className={`notes-mobile-bottom-tab${
            mobileBrowseTab === "notes" && activeFilter === "tasks" ? " is-active" : ""
          }`}
          onClick={() => handleFilterSelect("tasks")}
        >
          <FactCheckOutlinedIcon />
          <span>{getLibraryLabel("tasks", libraryLabels)}</span>
        </button>
        <Link to="/settings" className="notes-mobile-bottom-tab">
          <Settings3LineIcon />
          <span>Settings</span>
        </Link>
      </nav>
    </div>
  );

  return (
    <div className="page-body">
      <AddNoteModal
        open={isAddNoteOpen}
        initialType={addNoteInitialType}
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
      {!isFocusNoteFullScreen && (
        <FocusNotePanel
          note={focusNote}
          onOpen={() => focusNote && setIsFocusNoteFullScreen(true)}
          onUnpin={() => setFocusNoteId(null)}
          setNotes={setNotes}
        />
      )}
      {isFocusNoteFullScreen && focusNote && (
        <div className="focus-note-fullscreen">
          <div className="focus-note-fullscreen-header">
            <button
              type="button"
              className="focus-note-fullscreen-close"
              onClick={() => setIsFocusNoteFullScreen(false)}
            >
              <ArrowLeftLineIcon />
              <span>Close</span>
            </button>
          </div>
          <div className="notes-detail-panel focus-note-fullscreen-body">
            <Note
              key={focusNote.id}
              id={focusNote.id}
              title={focusNote.title}
              createdDate={focusNote.creationDate}
              updatedDate={focusNote.modifiedDate}
              dateFormat={dateFormat}
              content={focusNote.content}
              noteType={focusNote.noteType}
              isPinned={focusNote.isPinned}
              isFavorite={focusNote.isFavorite}
              isArchived={focusNote.isArchived}
              isReadOnly={isFocusNoteReadOnly}
              dueDateTime={focusNote.dueDateTime}
              reminderDateTime={focusNote.reminderDateTime}
              recurrenceRule={focusNote.recurrenceRule}
              tags={focusNote.tags || []}
              tagColors={tagColors}
              existingFolders={folders.map((folder) => folder.name)}
              setNotes={setNotes}
              onDelete={() => {
                setIsFocusNoteFullScreen(false);
                handleDeleteNote(focusNote);
              }}
              onArchive={() => handleArchiveNote(focusNote)}
              onDuplicate={() => handleDuplicateNote(focusNote)}
              isFocusNote
              onToggleFocus={() => {
                setIsFocusNoteFullScreen(false);
                handleToggleFocusNote(focusNote.id);
              }}
            />
          </div>
        </div>
      )}
      {isMobileLayout ? (
        <div className="notes-mobile-shell">
          {mobileScreen === "browse" ? (
            <>
              {mobileBrowseTab === "notes" ? renderListPanel() : renderSidebar(true)}
              {renderMobileBottomTabs()}
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
