import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import PushpinFillIcon from "remixicon-react/PushpinFillIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import HeartFillIcon from "remixicon-react/HeartFillIcon";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import CheckboxCircleFillIcon from "remixicon-react/CheckboxCircleFillIcon";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import { PinNote, UpdateNote } from "../utils/notesCrud";
import { getPreviewItems } from "../utils/noteContent";

const VISIBLE_TAG_COUNT = 2;

function NoteListItem({ note, isSelected, onSelect, setNotes, tagColors = {} }) {
  const previewItems = getPreviewItems(note.content)
    .filter((item) => !(item.kind === "task" && item.checked))
    .slice(0, 2);
  const tags = note.tags || [];
  const visibleTags = tags.slice(0, VISIBLE_TAG_COUNT);
  const hiddenTagCount = tags.length - visibleTags.length;

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
      draggable
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("application/x-organica-note-id", note.id);
        event.dataTransfer.setData("text/plain", note.id);
      }}
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

      {previewItems.length ? (
        <div className="note-list-item-preview">
          {previewItems.map((item, index) => (
            <div
              key={`${note.id}-preview-${index}`}
              className={`note-list-item-preview-line note-list-item-preview-line--${item.kind}`}
            >
              {item.kind === "task" && (
                <span className="note-list-item-preview-marker" aria-hidden="true">
                  {item.checked ? <CheckboxCircleFillIcon /> : <CheckboxBlankCircleLineIcon />}
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

      {tags.length > 0 && (
        <div className="tag-chip-row">
          {visibleTags.map((tag) => (
            <span
              className={`tag-chip${tagColors[tag] ? " has-folder-color" : ""}`}
              key={tag}
              style={tagColors[tag] ? { "--folder-accent": tagColors[tag] } : undefined}
            >
              <FolderOutlinedIcon aria-hidden="true" />
              <span className="tag-chip-label">{tag}</span>
            </span>
          ))}
          {hiddenTagCount > 0 && (
            <span className="tag-chip-more">+{hiddenTagCount} more</span>
          )}
        </div>
      )}
    </article>
  );
}

export default NoteListItem;
