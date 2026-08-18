// A single ordered list drives both the sidebar's "Library" section and
// the mobile bottom nav: the sidebar shows every filter in this order,
// and the bottom nav's 3 filter slots are simply the first 3 — so
// reordering the list in Settings reorders both places at once, and
// there's only ever one order to reason about.
export const LIBRARY_FILTERS = [
  { id: "all", label: "Notes" },
  { id: "pinned", label: "Pinned" },
  { id: "tasks", label: "Tasks" },
  { id: "favorites", label: "Favorites" },
  { id: "notes-only", label: "Notes Only" },
  { id: "archived", label: "Archived" },
];

export const DEFAULT_LIBRARY_ORDER = LIBRARY_FILTERS.map((filter) => filter.id);
export const BOTTOM_BAR_SLOTS = 3;
const STORAGE_KEY = "libraryOrder";

export function loadLibraryOrder() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) {
      const validIds = new Set(LIBRARY_FILTERS.map((filter) => filter.id));
      const valid = saved.filter((id) => validIds.has(id));
      // Any filter missing from a stale saved list (e.g. "Archived" added
      // in a later version) is appended rather than dropped, so it stays
      // reachable instead of silently disappearing from the sidebar.
      const missing = DEFAULT_LIBRARY_ORDER.filter((id) => !valid.includes(id));
      if (valid.length) return [...valid, ...missing];
    }
  } catch {
    // malformed storage — fall through to the default
  }
  return DEFAULT_LIBRARY_ORDER;
}

export function saveLibraryOrder(order) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}
