// Which folders are hidden from the main views. Kept in localStorage
// rather than the Firestore "tags" collection (where folder color
// lives) because that collection's security rules were written before
// this field existed and reject writes that include it — this avoids
// needing a rules change to ship the feature, at the cost of the hidden
// flag being per-device rather than synced.
const HIDDEN_STORAGE_KEY = "hiddenFolders";

export function loadHiddenFolders() {
  try {
    const saved = JSON.parse(localStorage.getItem(HIDDEN_STORAGE_KEY));
    if (Array.isArray(saved)) return saved;
  } catch {
    // malformed storage — fall through to the default
  }
  return [];
}

export function saveHiddenFolders(names) {
  localStorage.setItem(HIDDEN_STORAGE_KEY, JSON.stringify(names));
}
