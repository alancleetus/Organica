import CheckboxMultipleLineIcon from "remixicon-react/CheckboxMultipleLineIcon";
import { useRef } from "react";

function toggleChecklistPrefix(value, selectionStart, selectionEnd) {
  const text = value || "";
  const startOfLine = text.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const endOfLineIndex = text.indexOf("\n", selectionEnd);
  const endOfLine = endOfLineIndex === -1 ? text.length : endOfLineIndex;
  const line = text.slice(startOfLine, endOfLine);

  let nextLine = line;
  if (/^\[( |x)\]\s?/i.test(line)) {
    nextLine = line.replace(/^\[( |x)\]\s?/i, "");
  } else {
    nextLine = `[ ] ${line}`;
  }

  const nextValue = `${text.slice(0, startOfLine)}${nextLine}${text.slice(endOfLine)}`;
  const cursorOffset = nextLine.length - line.length;

  return {
    value: nextValue,
    selectionStart: selectionStart + cursorOffset,
    selectionEnd: selectionEnd + cursorOffset,
  };
}

function getNextLineValue(value, selectionStart) {
  const text = value || "";
  const startOfLine = text.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const endOfLineIndex = text.indexOf("\n", selectionStart);
  const endOfLine = endOfLineIndex === -1 ? text.length : endOfLineIndex;
  const line = text.slice(startOfLine, endOfLine);

  if (/^\[( |x)\]\s?/i.test(line)) {
    return {
      insertText: "\n[ ] ",
      cursorOffset: 5,
    };
  }

  return {
    insertText: "\n",
    cursorOffset: 1,
  };
}

function PlainTextNoteEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  editorTestId,
  autoFocus = false,
  className = "",
}) {
  const textareaRef = useRef(null);

  const handleToggleChecklist = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const nextState = toggleChecklistPrefix(
      value,
      textarea.selectionStart,
      textarea.selectionEnd
    );

    onChange(nextState.value);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        nextState.selectionStart,
        nextState.selectionEnd
      );
    });
  };

  return (
    <div className={`plain-note-editor ${className}`.trim()}>
      <div className="plain-note-toolbar">
        <button
          type="button"
          className="plain-note-toolbar-button"
          data-testid="toggle-task-list"
          aria-label="Toggle checklist line"
          onClick={handleToggleChecklist}
        >
          <CheckboxMultipleLineIcon />
        </button>
      </div>

      <textarea
        ref={textareaRef}
        className="plain-note-textarea"
        data-testid={editorTestId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onKeyDown={(event) => {
          if (event.key !== "Enter") return;

          const textarea = textareaRef.current;
          if (!textarea) return;

          const nextLine = getNextLineValue(value, textarea.selectionStart);
          if (nextLine.insertText === "\n") return;

          event.preventDefault();

          const nextValue = `${value.slice(0, textarea.selectionStart)}${nextLine.insertText}${value.slice(textarea.selectionEnd)}`;
          const nextCursor = textarea.selectionStart + nextLine.cursorOffset;

          onChange(nextValue);

          requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(nextCursor, nextCursor);
          });
        }}
      />
    </div>
  );
}

export default PlainTextNoteEditor;
