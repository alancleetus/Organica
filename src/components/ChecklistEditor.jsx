import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import CheckboxCircleFillIcon from "remixicon-react/CheckboxCircleFillIcon";
import { useEffect, useRef, useState } from "react";
import { checklistContentToItems, checklistItemsToContent } from "../utils/noteContent";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `checklist-item-${idCounter}`;
}

function itemsFromContent(content) {
  return checklistContentToItems(content).map((item) => ({ ...item, id: nextId() }));
}

function ChecklistRow({ item, autoFocus, registerRef, onToggle, onTextChange, onBlur, onKeyDown, onRemove }) {
  return (
    <div className={`checklist-editor-row${item.checked ? " is-checked" : ""}`} data-testid="note-checklist-item">
      <button
        type="button"
        className="plain-note-checklist-toggle"
        aria-label={item.checked ? "Mark task incomplete" : "Mark task complete"}
        onClick={() => onToggle(item.id)}
      >
        <span className="plain-note-checklist-icon" aria-hidden="true">
          {item.checked ? <CheckboxCircleFillIcon /> : <CheckboxBlankCircleLineIcon />}
        </span>
      </button>
      <input
        ref={(node) => registerRef(item.id, node)}
        type="text"
        className="checklist-editor-input"
        value={item.text}
        placeholder="List item"
        autoFocus={autoFocus}
        onChange={(event) => onTextChange(item.id, event.target.value)}
        onBlur={onBlur}
        onKeyDown={(event) => onKeyDown(event, item.id)}
      />
      <button
        type="button"
        className="checklist-editor-remove"
        aria-label="Remove item"
        tabIndex={-1}
        onClick={() => onRemove(item.id)}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

function ChecklistEditor({ value, onChange, onBlur, editorTestId, autoFocus = false, className = "" }) {
  const [items, setItems] = useState(() => itemsFromContent(value));
  const [draft, setDraft] = useState("");
  const lastSerializedRef = useRef(checklistItemsToContent(items));
  const draftInputRef = useRef(null);
  const itemRefs = useRef(new Map());
  const pendingFocusIdRef = useRef(null);

  useEffect(() => {
    const incoming = value || "";
    if (incoming === lastSerializedRef.current) return;
    const nextItems = itemsFromContent(incoming);
    setItems(nextItems);
    lastSerializedRef.current = checklistItemsToContent(nextItems);
  }, [value]);

  useEffect(() => {
    if (!pendingFocusIdRef.current) return;
    itemRefs.current.get(pendingFocusIdRef.current)?.focus();
    pendingFocusIdRef.current = null;
  });

  const commit = (nextItems) => {
    setItems(nextItems);
    const serialized = checklistItemsToContent(nextItems);
    lastSerializedRef.current = serialized;
    onChange(serialized);
  };

  const registerRef = (id, node) => {
    if (node) itemRefs.current.set(id, node);
    else itemRefs.current.delete(id);
  };

  const handleToggle = (id) => {
    commit(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const handleTextChange = (id, text) => {
    commit(items.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const handleRemove = (id) => {
    commit(items.filter((item) => item.id !== id));
  };

  const handleItemKeyDown = (event, id) => {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const insertAt = items.findIndex((item) => item.id === id) + 1;
    const newItem = { id: nextId(), text: "", checked: false };
    pendingFocusIdRef.current = newItem.id;
    commit([...items.slice(0, insertAt), newItem, ...items.slice(insertAt)]);
  };

  const addDraftItem = () => {
    const text = draft.trim();
    if (!text) return;
    commit([...items, { id: nextId(), text, checked: false }]);
    setDraft("");
  };

  const activeItems = items.filter((item) => !item.checked);
  const completedItems = items.filter((item) => item.checked);

  return (
    <div className={`checklist-editor ${className}`.trim()} data-testid={editorTestId}>
      <div className="checklist-editor-items">
        {activeItems.map((item, index) => (
          <ChecklistRow
            key={item.id}
            item={item}
            autoFocus={autoFocus && index === 0}
            registerRef={registerRef}
            onToggle={handleToggle}
            onTextChange={handleTextChange}
            onBlur={onBlur}
            onKeyDown={handleItemKeyDown}
            onRemove={handleRemove}
          />
        ))}

        <form
          className="checklist-editor-add-row"
          onSubmit={(event) => {
            event.preventDefault();
            addDraftItem();
            draftInputRef.current?.focus();
          }}
        >
          <span className="checklist-editor-add-icon" aria-hidden="true">
            <AddIcon />
          </span>
          <input
            ref={draftInputRef}
            type="text"
            className="checklist-editor-input checklist-editor-add-input"
            value={draft}
            placeholder="Add item"
            autoFocus={autoFocus && activeItems.length === 0}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => {
              addDraftItem();
              onBlur?.();
            }}
          />
        </form>

        {completedItems.length > 0 && (
          <div className="plain-note-completed-section" data-testid="note-completed-section">
            <p className="plain-note-completed-label">Completed ({completedItems.length})</p>
            <div className="plain-note-completed-list">
              {completedItems.map((item) => (
                <ChecklistRow
                  key={item.id}
                  item={item}
                  autoFocus={false}
                  registerRef={registerRef}
                  onToggle={handleToggle}
                  onTextChange={handleTextChange}
                  onBlur={onBlur}
                  onKeyDown={handleItemKeyDown}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChecklistEditor;
