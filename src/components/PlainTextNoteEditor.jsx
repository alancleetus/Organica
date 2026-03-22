import CheckboxMultipleLineIcon from "remixicon-react/CheckboxMultipleLineIcon";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import CheckboxCircleFillIcon from "remixicon-react/CheckboxCircleFillIcon";
import { useMemo, useRef, useState } from "react";

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

function getCurrentLine(value, selectionStart = 0) {
  const text = value || "";
  const startOfLine = text.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const endOfLineIndex = text.indexOf("\n", selectionStart);
  const endOfLine = endOfLineIndex === -1 ? text.length : endOfLineIndex;
  return text.slice(startOfLine, endOfLine);
}

function parseChecklistItems(value = "") {
  return value.split("\n").flatMap((line, index) => {
    const taskMatch = line.match(/^\[( |x)\]\s*(.*)$/i);
    if (!taskMatch) return [];

    return [
      {
        index,
        checked: taskMatch[1].toLowerCase() === "x",
        text: taskMatch[2] || "",
      },
    ];
  });
}

function parseDisplayLines(value = "") {
  return value.split("\n").flatMap((line, index) => {
    const taskMatch = line.match(/^\[( |x)\]\s*(.*)$/i);
    if (taskMatch) {
      return [
        {
          kind: "task",
          index,
          checked: taskMatch[1].toLowerCase() === "x",
          text: taskMatch[2] || "",
        },
      ];
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      return [
        {
          kind: "bullet",
          index,
          text: bulletMatch[1] || "",
        },
      ];
    }

    if (!line.trim()) {
      return [
        {
          kind: "spacer",
          index,
          text: "",
        },
      ];
    }

    return [
      {
        kind: "text",
        index,
        text: line,
      },
    ];
  });
}

function toggleChecklistItem(value = "", lineIndex) {
  const lines = value.split("\n");
  lines[lineIndex] = lines[lineIndex].replace(
    /^\[( |x)\]/i,
    (match, state) => `[${state.toLowerCase() === "x" ? " " : "x"}]`
  );
  return lines.join("\n");
}

function PlainTextNoteEditor({
  value,
  onChange,
  onBlur,
  placeholder,
  editorTestId,
  autoFocus = false,
  className = "",
  showChecklistPanel = false,
}) {
  const textareaRef = useRef(null);
  const [selectionStart, setSelectionStart] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  const checklistItems = useMemo(() => parseChecklistItems(value), [value]);
  const displayLines = useMemo(() => parseDisplayLines(value), [value]);
  const currentLine = getCurrentLine(value, selectionStart);
  const isChecklistActive =
    /^\[( |x)\]\s?/i.test(currentLine) || checklistItems.length > 0;

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
          className={`plain-note-toolbar-button${isChecklistActive ? " is-active" : ""}`}
          data-testid="toggle-task-list"
          aria-label="Toggle checklist line"
          onClick={handleToggleChecklist}
        >
          <CheckboxMultipleLineIcon />
        </button>
      </div>

      {showChecklistPanel && displayLines.length > 0 && !isFocused && (
        <div className="plain-note-read-panel" data-testid="note-read-panel">
          {displayLines.map((item) => {
            if (item.kind === "task") {
              return (
                <button
                  key={`${editorTestId}-task-${item.index}`}
                  type="button"
                  className={`plain-note-checklist-item${item.checked ? " is-checked" : ""}`}
                  data-testid="note-checklist-item"
                  onClick={() => onChange(toggleChecklistItem(value, item.index))}
                >
                  <span className="plain-note-checklist-icon" aria-hidden="true">
                    {item.checked ? <CheckboxCircleFillIcon /> : <CheckboxBlankCircleLineIcon />}
                  </span>
                  <span className="plain-note-checklist-text">
                    {item.text || "Untitled task"}
                  </span>
                </button>
              );
            }

            if (item.kind === "bullet") {
              return (
                <div
                  key={`${editorTestId}-bullet-${item.index}`}
                  className="plain-note-read-line plain-note-read-line--bullet"
                >
                  <span className="plain-note-read-marker" aria-hidden="true">
                    •
                  </span>
                  <span>{item.text}</span>
                </div>
              );
            }

            if (item.kind === "spacer") {
              return (
                <div
                  key={`${editorTestId}-spacer-${item.index}`}
                  className="plain-note-read-line plain-note-read-line--spacer"
                />
              );
            }

            return (
              <div
                key={`${editorTestId}-text-${item.index}`}
                className="plain-note-read-line plain-note-read-line--text"
              >
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="plain-note-textarea"
        data-testid={editorTestId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        onFocus={() => setIsFocused(true)}
        onSelect={(event) => setSelectionStart(event.currentTarget.selectionStart)}
        onClick={(event) => setSelectionStart(event.currentTarget.selectionStart)}
        onKeyUp={(event) => setSelectionStart(event.currentTarget.selectionStart)}
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
