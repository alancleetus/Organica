import PushpinFillIcon from "remixicon-react/PushpinFillIcon";
import HeartFillIcon from "remixicon-react/HeartFillIcon";

function stripHtml(html = "") {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function NoteListItem({ note, isSelected, onSelect }) {
  const previewText = stripHtml(note.content);

  return (
    <button
      type="button"
      className={`note-list-item${isSelected ? " is-selected" : ""}`}
      onClick={() => onSelect(note.id)}
      data-testid={isSelected ? "selected-note-list-item" : "note-list-item"}
    >
      <div className="note-list-item-top">
        <p className="note-list-item-date">
          {new Date(note.modifiedDate || note.creationDate).toLocaleDateString(
            "en-US",
            {
              month: "short",
              day: "numeric",
            }
          )}
        </p>
        <div className="note-list-item-badges">
          {note.isPinned && <PushpinFillIcon />}
          {note.isFavorite && <HeartFillIcon />}
        </div>
      </div>

      <h3 className="note-list-item-title">
        {note.title?.trim() || "Untitled note"}
      </h3>

      <p className="note-list-item-preview">
        {previewText || "No additional content yet."}
      </p>
    </button>
  );
}

export default NoteListItem;
