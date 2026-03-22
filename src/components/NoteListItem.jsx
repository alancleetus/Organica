import PushpinFillIcon from "remixicon-react/PushpinFillIcon";
import HeartFillIcon from "remixicon-react/HeartFillIcon";
import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import { PinNote, UpdateNote } from "../utils/notesCrud";

function stripHtml(html = "") {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function NoteListItem({ note, isSelected, onSelect, setNotes }) {
  const previewText = stripHtml(note.content);
  const noteLabel = note.isPinned
    ? "Pinned"
    : note.isFavorite
      ? "Favorite"
      : previewText.includes("[]") || previewText.includes("[x]")
        ? "Checklist"
        : "Note";

  const handleSelect = () => onSelect(note.id);

  return (
    <article
      className={`note-list-item${isSelected ? " is-selected" : ""}`}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleSelect();
        }
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      data-testid={isSelected ? "selected-note-list-item" : "note-list-item"}
    >
      <div className="note-list-item-top">
        <div className="note-list-item-meta">
          <p className="note-list-item-date">
            {new Date(note.modifiedDate || note.creationDate).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
              }
            )}
          </p>
          <span className="note-list-item-label">{noteLabel}</span>
        </div>
        <div className="note-list-item-badges">
          {note.isPinned && <PushpinFillIcon />}
          {note.isFavorite && <HeartFillIcon />}
        </div>
      </div>

      <div className="note-list-item-actions">
        <button
          type="button"
          className={`note-list-item-action${note.isPinned ? " is-active" : ""}`}
          aria-label={note.isPinned ? "Unpin note" : "Pin note"}
          onClick={(event) => {
            event.stopPropagation();
            PinNote(note.id, !note.isPinned, setNotes);
          }}
        >
          {note.isPinned ? <PushpinFillIcon /> : <PushpinLineIcon />}
        </button>
        <button
          type="button"
          className={`note-list-item-action${note.isFavorite ? " is-active" : ""}`}
          aria-label={note.isFavorite ? "Unfavorite note" : "Favorite note"}
          onClick={(event) => {
            event.stopPropagation();
            UpdateNote({
              id: note.id,
              isFavorite: !note.isFavorite,
              setNotes,
            });
          }}
        >
          {note.isFavorite ? <HeartFillIcon /> : <HeartLineIcon />}
        </button>
      </div>

      <h3 className="note-list-item-title">
        {note.title?.trim() || "Untitled note"}
      </h3>

      <p className="note-list-item-preview">
        {previewText || "No additional content yet."}
      </p>
    </article>
  );
}

export default NoteListItem;
