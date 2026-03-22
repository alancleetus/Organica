import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import { PinNote, UpdateNote } from "../utils/notesCrud";
import { getPreviewItems, isChecklistContent } from "../utils/noteContent";

function NoteListItem({ note, isSelected, onSelect, setNotes }) {
  const previewItems = getPreviewItems(note.content).slice(0, 4);
  const previewText = previewItems.map((item) => item.text).join(" ");
  const noteLabel = note.isPinned
    ? "Pinned"
    : note.isFavorite
      ? "Favorite"
      : isChecklistContent(note.content) || previewText.includes("[ ]") || previewText.includes("[x]")
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
          <PushpinLineIcon />
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
          <HeartLineIcon />
        </button>
      </div>

      <h3 className="note-list-item-title">
        {note.title?.trim() || "Untitled note"}
      </h3>

      {previewItems.length ? (
        <div className="note-list-item-preview">
          {previewItems.map((item, index) => (
            <div
              key={`${note.id}-preview-${index}`}
              className={`note-list-item-preview-line note-list-item-preview-line--${item.kind}`}
            >
              {item.kind === "task" && (
                <span className="note-list-item-preview-marker" aria-hidden="true">
                  {item.checked ? "[x]" : "[ ]"}
                </span>
              )}
              {item.kind === "bullet" && (
                <span className="note-list-item-preview-marker" aria-hidden="true">
                  -
                </span>
              )}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="note-list-item-preview">No additional content yet.</p>
      )}
    </article>
  );
}

export default NoteListItem;
