import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import CheckboxCircleFillIcon from "remixicon-react/CheckboxCircleFillIcon";
import DragMove2LineIcon from "remixicon-react/DragMove2LineIcon";
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

function ChecklistRow({
  item,
  autoFocus,
  registerRef,
  onToggle,
  onTextChange,
  onBlur,
  onKeyDown,
  onRemove,
  onPaste,
  readOnly,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  isDragOver,
}) {
  return (
    <div
      className={`checklist-editor-row${item.checked ? " is-checked" : ""}${
        isDragOver ? " is-drag-over" : ""
      }`}
      data-testid="note-checklist-item"
      onDragOver={readOnly ? undefined : (event) => onDragOver(event, item.id)}
      onDrop={readOnly ? undefined : (event) => onDrop(event, item.id)}
    >
      {!readOnly && (
        <span
          className="checklist-editor-drag-handle"
          draggable
          aria-label="Reorder item"
          onDragStart={(event) => onDragStart(event, item.id)}
          onDragEnd={onDragEnd}
        >
          <DragMove2LineIcon />
        </span>
      )}
      <button
        type="button"
        className="plain-note-checklist-toggle"
        aria-label={item.checked ? "Mark task incomplete" : "Mark task complete"}
        onClick={() => onToggle(item.id)}
        disabled={readOnly}
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
        onPaste={readOnly ? undefined : (event) => onPaste(event, item.id)}
        readOnly={readOnly}
      />
      {!readOnly && (
        <button
          type="button"
          className="checklist-editor-remove"
          aria-label="Remove item"
          tabIndex={-1}
          onClick={() => onRemove(item.id)}
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

function ChecklistEditor({
  value,
  onChange,
  onImmediateSave,
  onBlur,
  editorTestId,
  autoFocus = false,
  className = "",
  readOnly = false,
}) {
  const [items, setItems] = useState(() => itemsFromContent(value));
  const [draft, setDraft] = useState("");
  const [dragOverId, setDragOverId] = useState(null);
  const lastSerializedRef = useRef(checklistItemsToContent(items));
  const draftInputRef = useRef(null);
  const itemRefs = useRef(new Map());
  const pendingFocusIdRef = useRef(null);
  const draggedIdRef = useRef(null);

  useEffect(() => {
    const incoming = value || "";
    if (incoming === lastSerializedRef.current) return;
    const nextItems = itemsFromContent(incoming);
    setItems(nextItems);
    lastSerializedRef.current = checklistItemsToContent(nextItems);
  }, [value]);

  useEffect(() => {
    if (!pendingFocusIdRef.current) return;
    itemRefs.current.get(pendingFocusIdRef.current)?.node.focus();
    pendingFocusIdRef.current = null;
  });

  // Toggling and reordering are discrete, deliberate actions with no
  // text field involved — so there's no blur event to flush a pending
  // save the way typing gets one, and no reason to make either wait out
  // the debounce meant for "still typing." Both save immediately instead.
  const commit = (nextItems, { immediate = false } = {}) => {
    setItems(nextItems);
    const serialized = checklistItemsToContent(nextItems);
    lastSerializedRef.current = serialized;
    onChange(serialized);
    if (immediate) onImmediateSave?.(serialized);
  };

  // React's onBeforeInput prop is a synthetic reconstruction, not a
  // passthrough of the native `beforeinput` event: it only fires when it
  // can derive inserted "chars", which is null for inputType
  // "insertLineBreak" (a line break has no chars) — so it never delivers
  // the Enter-via-mobile-IME case at all. A real `addEventListener`
  // straight on the input is the only reliable way to see it. The
  // callback ref already re-runs on every render (a fresh inline
  // function each time counts as "a different ref" to React), so
  // detaching the old listener and attaching a fresh one here — closed
  // over this render's up-to-date handler — piggybacks on that instead
  // of needing a separate effect.
  const registerRef = (id, node) => {
    const existing = itemRefs.current.get(id);
    if (existing) existing.node.removeEventListener("beforeinput", existing.handler);

    if (node) {
      const handler = (event) => handleItemBeforeInput(event, id);
      node.addEventListener("beforeinput", handler);
      itemRefs.current.set(id, { node, handler });
    } else {
      itemRefs.current.delete(id);
    }
  };

  const handleToggle = (id) => {
    commit(
      items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
      { immediate: true }
    );
  };

  const handleTextChange = (id, text) => {
    commit(items.map((item) => (item.id === id ? { ...item, text } : item)));
  };

  const handleRemove = (id) => {
    commit(
      items.filter((item) => item.id !== id),
      { immediate: true }
    );
  };

  const insertItemAfter = (id) => {
    const insertAt = items.findIndex((item) => item.id === id) + 1;
    const newItem = { id: nextId(), text: "", checked: false };
    pendingFocusIdRef.current = newItem.id;
    commit([...items.slice(0, insertAt), newItem, ...items.slice(insertAt)]);
  };

  const handleItemKeyDown = (event, id) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    insertItemAfter(id);
  };

  // Mobile IMEs (Gboard and others) often don't report Enter through
  // keydown at all — it arrives mid-composition as keyCode 229 / key
  // "Unidentified", so handleItemKeyDown above never fires and Enter
  // would otherwise just insert a line break inside the single-line
  // field. The native beforeinput event still reports it reliably as
  // inputType "insertLineBreak" and, unlike input, is cancelable —
  // catching it here (via registerRef's addEventListener, see below) is
  // what makes Enter start a new item on mobile too.
  const handleItemBeforeInput = (event, id) => {
    if (event.inputType !== "insertLineBreak") return;
    event.preventDefault();
    insertItemAfter(id);
  };

  const addDraftItem = () => {
    const text = draft.trim();
    if (!text) return;
    commit([...items, { id: nextId(), text, checked: false }]);
    setDraft("");
  };

  // A single-line <input> silently collapses a multi-line paste (e.g. a
  // list copied from somewhere else) into one run-on item — pulling the
  // clipboard text out ourselves and splitting it on newlines turns that
  // paste into one item per line instead, matching how a checklist
  // actually reads a pasted list. Single-line pastes fall through to the
  // input's own default handling.
  const handlePaste = (event, id) => {
    const text = event.clipboardData?.getData("text");
    if (!text) return;

    const lines = text
      .split(/\r\n|\r|\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length < 2) return;

    event.preventDefault();
    const [firstLine, ...restLines] = lines;
    const restItems = restLines.map((line) => ({ id: nextId(), text: line, checked: false }));

    if (id === null) {
      commit([...items, { id: nextId(), text: firstLine, checked: false }, ...restItems], {
        immediate: true,
      });
      setDraft("");
      return;
    }

    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return;

    const nextItems = [
      ...items.slice(0, index),
      { ...items[index], text: firstLine },
      ...restItems,
      ...items.slice(index + 1),
    ];
    pendingFocusIdRef.current = restItems.length
      ? restItems[restItems.length - 1].id
      : id;
    commit(nextItems, { immediate: true });
  };

  const handleDragStart = (event, id) => {
    draggedIdRef.current = id;
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (event, id) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (id !== draggedIdRef.current) setDragOverId(id);
  };

  const handleDrop = (event, targetId) => {
    event.preventDefault();
    setDragOverId(null);

    const sourceId = draggedIdRef.current;
    draggedIdRef.current = null;
    if (!sourceId || sourceId === targetId) return;

    const sourceIndex = items.findIndex((item) => item.id === sourceId);
    const targetIndex = items.findIndex((item) => item.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    commit(next, { immediate: true });
  };

  const handleDragEnd = () => {
    draggedIdRef.current = null;
    setDragOverId(null);
  };

  const activeItems = items.filter((item) => !item.checked);
  const completedItems = items.filter((item) => item.checked);

  const dragHandlers = {
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
    onDragEnd: handleDragEnd,
  };

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
            onPaste={handlePaste}
            readOnly={readOnly}
            isDragOver={dragOverId === item.id}
            {...dragHandlers}
          />
        ))}

        {!readOnly && (
          <form
            className="checklist-editor-add-row"
            onSubmit={(event) => {
              event.preventDefault();
              addDraftItem();
              draftInputRef.current?.focus();
            }}
          >
            <span className="checklist-editor-drag-handle-spacer" aria-hidden="true" />
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
              onPaste={(event) => handlePaste(event, null)}
            />
          </form>
        )}

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
                  onPaste={handlePaste}
                  readOnly={readOnly}
                  isDragOver={dragOverId === item.id}
                  {...dragHandlers}
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
