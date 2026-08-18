import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import CheckboxCircleFillIcon from "remixicon-react/CheckboxCircleFillIcon";
import { UpdateNote } from "../utils/notesCrud";
import { getPreviewItems, resolveNoteType, toggleChecklistLine } from "../utils/noteContent";

// A pinned note that stays on screen across every other screen/filter in
// the app — for the "one list I keep referencing and don't want to have
// to re-find" case (a grocery list, say). Checklist items can be ticked
// off right here; anything else about the note is edited by opening it.
function FocusNotePanel({ note, onOpen, onUnpin, setNotes }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!note) return null;

  const noteType = resolveNoteType(note);
  const items = getPreviewItems(note.content);

  const handleToggle = (lineIndex) => {
    const nextContent = toggleChecklistLine(note.content, lineIndex);
    UpdateNote({ id: note.id, newContent: nextContent, setNotes });
  };

  return (
    <div className={`focus-note-panel${isCollapsed ? " is-collapsed" : ""}`}>
      <div className="focus-note-header">
        <span className="focus-note-title">{note.title?.trim() || "Untitled note"}</span>
        <div className="focus-note-header-actions">
          <button
            type="button"
            className="focus-note-header-button"
            aria-label={isCollapsed ? "Expand focus note" : "Collapse focus note"}
            onClick={() => setIsCollapsed((prev) => !prev)}
          >
            {isCollapsed ? "+" : "−"}
          </button>
          <button
            type="button"
            className="focus-note-header-button"
            aria-label="Open focus note"
            onClick={onOpen}
          >
            <OpenInFullIcon />
          </button>
          <button
            type="button"
            className="focus-note-header-button"
            aria-label="Unpin focus note"
            onClick={onUnpin}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="focus-note-body">
          {items.length === 0 && <p className="focus-note-empty">Nothing here yet.</p>}
          {items.map((item, index) =>
            item.kind === "task" && noteType === "checklist" ? (
              <button
                type="button"
                key={index}
                className={`focus-note-task${item.checked ? " is-checked" : ""}`}
                onClick={() => handleToggle(index)}
              >
                <span className="focus-note-task-icon" aria-hidden="true">
                  {item.checked ? <CheckboxCircleFillIcon /> : <CheckboxBlankCircleLineIcon />}
                </span>
                <span>{item.text}</span>
              </button>
            ) : (
              <p className="focus-note-line" key={index}>
                {item.text}
              </p>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default FocusNotePanel;
