import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import PushpinFillIcon from "remixicon-react/PushpinFillIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import HeartFillIcon from "remixicon-react/HeartFillIcon";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import CheckboxCircleFillIcon from "remixicon-react/CheckboxCircleFillIcon";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import CalendarEventLineIcon from "remixicon-react/CalendarEventLineIcon";
import { PinNote, UpdateNote } from "../utils/notesCrud";
import { getPreviewItems } from "../utils/noteContent";

const VISIBLE_TAG_COUNT = 2;

function formatDueBadge(dueDateTime) {
  const due = new Date(dueDateTime);
  if (Number.isNaN(due.getTime())) return null;
  return due.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function NoteListItem({ note, isSelected, onSelect, setNotes, tagColors = {}, isMobileLayout = false }) {
  const allPreviewItems = getPreviewItems(note.content).filter(
    (item) => !(item.kind === "task" && item.checked)
  );
  const previewItems = allPreviewItems.slice(0, 2);
  const hiddenPreviewCount = allPreviewItems.length - previewItems.length;
  const isChecklist = allPreviewItems.some((item) => item.kind === "task");
  const tags = note.tags || [];
  const visibleTags = tags.slice(0, VISIBLE_TAG_COUNT);
  const hiddenTagCount = tags.length - visibleTags.length;
  const dueBadgeLabel = note.dueDateTime ? formatDueBadge(note.dueDateTime) : null;
  const isOverdue = note.dueDateTime ? new Date(note.dueDateTime).getTime() < Date.now() : false;

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
      // Drag-to-folder is a desktop-only affordance (mobile has no drop
      // target reachable while browsing the note list). The HTML
      // draggable attribute is mouse-only by spec, but some mobile
      // WebKit builds still treat it as a hint that suppresses native
      // touch-scroll gestures on the element — so it's left off entirely
      // on mobile rather than risk that for a feature that can't be used
      // there anyway.
      {...(!isMobileLayout && {
        draggable: true,
        onDragStart: (event) => {
          event.dataTransfer.effectAllowed = "copy";
          event.dataTransfer.setData("application/x-organica-note-id", note.id);
          event.dataTransfer.setData("text/plain", note.id);
        },
      })}
    >
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

      {dueBadgeLabel && (
        <div className={`note-due-badge${isOverdue ? " is-overdue" : ""}`}>
          <CalendarEventLineIcon aria-hidden="true" />
          <span>{dueBadgeLabel}</span>
        </div>
      )}

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
          {hiddenPreviewCount > 0 &&
            (isChecklist ? (
              <div className="note-list-item-preview-more">+{hiddenPreviewCount} more</div>
            ) : (
              <div className="note-list-item-preview-more">&hellip;</div>
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
