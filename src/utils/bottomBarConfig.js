// A single ordered list drives both the sidebar's "Library" section and
// the mobile bottom nav: the sidebar shows every filter in this order,
// and the bottom nav's 3 filter slots are simply the first 3 — so
// reordering the list in Settings reorders both places at once, and
// there's only ever one order to reason about.
// "Uncategorized" is deliberately not in this list — it's rendered as a
// pinned pseudo-folder at the top of the Folders section instead (a
// smart view over notes with no folder, so it belongs with folders, not
// with the Library filters).
export const LIBRARY_FILTERS = [
  { id: "all", label: "All" },
  { id: "pinned", label: "Pinned" },
  { id: "tasks", label: "Lists" },
  { id: "favorites", label: "Favorites" },
  { id: "notes-only", label: "Notes" },
  { id: "archived", label: "Archived" },
];

// The sidebar's Library group splits these into full rows (the "real"
// views worth their own line) vs. a single compact icon-only row
// (glanceable extras that don't each need a whole row of space).
export const PRIMARY_LIBRARY_FILTERS = ["all", "notes-only", "tasks"];
export const QUICK_LIBRARY_FILTERS = ["pinned", "favorites", "archived"];

export const UNCATEGORIZED_FILTER_ID = "uncategorized";
export const UNCATEGORIZED_LABEL = "Uncategorized";

export const DEFAULT_LIBRARY_ORDER = LIBRARY_FILTERS.map((filter) => filter.id);
export const BOTTOM_BAR_SLOTS = 3;
const STORAGE_KEY = "libraryOrder";
const LABELS_STORAGE_KEY = "libraryLabels";

// User-renamed labels, keyed by filter id. Falls back to each filter's
// default label wherever a custom one hasn't been set — this is the one
// place both the sidebar and the list-panel heading read a library
// filter's display name from, so a rename in Settings shows up
// everywhere instead of drifting out of sync with a second hardcoded copy.
export function loadLibraryLabels() {
  try {
    const saved = JSON.parse(localStorage.getItem(LABELS_STORAGE_KEY));
    if (saved && typeof saved === "object") return saved;
  } catch {
    // malformed storage — fall through to the default
  }
  return {};
}

export function saveLibraryLabels(labels) {
  localStorage.setItem(LABELS_STORAGE_KEY, JSON.stringify(labels));
}

export function getLibraryLabel(filterId, customLabels = {}) {
  if (customLabels[filterId]?.trim()) return customLabels[filterId];
  if (filterId === UNCATEGORIZED_FILTER_ID) return UNCATEGORIZED_LABEL;
  return LIBRARY_FILTERS.find((filter) => filter.id === filterId)?.label || filterId;
}

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

const DISABLED_STORAGE_KEY = "libraryDisabled";

// Filters the user has turned off entirely (e.g. "I don't use
// Favorites") — hidden from both the sidebar's Library section and the
// mobile bottom bar, distinct from just reordering them.
export function loadDisabledLibraryFilters() {
  try {
    const saved = JSON.parse(localStorage.getItem(DISABLED_STORAGE_KEY));
    if (Array.isArray(saved)) {
      const validIds = new Set(LIBRARY_FILTERS.map((filter) => filter.id));
      return saved.filter((id) => validIds.has(id));
    }
  } catch {
    // malformed storage — fall through to the default
  }
  return [];
}

export function saveDisabledLibraryFilters(disabled) {
  localStorage.setItem(DISABLED_STORAGE_KEY, JSON.stringify(disabled));
}
