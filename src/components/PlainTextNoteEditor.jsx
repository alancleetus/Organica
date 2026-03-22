import CheckboxMultipleLineIcon from "remixicon-react/CheckboxMultipleLineIcon";
import CheckboxMultipleFillIcon from "remixicon-react/CheckboxMultipleFillIcon";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import CheckboxCircleFillIcon from "remixicon-react/CheckboxCircleFillIcon";
import { useMemo, useRef, useState } from "react";

function toggleChecklistPrefix(value, selectionStart, selectionEnd) {
  const text = value || "";
  const normalizedSelectionEnd =
    selectionEnd > selectionStart && text[selectionEnd - 1] === "\n"
      ? selectionEnd - 1
      : selectionEnd;
  const startOfLine =
    text.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const endOfLineIndex = text.indexOf("\n", normalizedSelectionEnd);
  const endOfLine = endOfLineIndex === -1 ? text.length : endOfLineIndex;
  const selectedBlock = text.slice(startOfLine, endOfLine);
  const lines = selectedBlock.split("\n");
  const nonEmptyLines = lines.filter((line) => line.trim() !== "");
  const shouldRemoveChecklist =
    nonEmptyLines.length > 0 &&
    nonEmptyLines.every((line) => /^\[( |x)\]\s?/i.test(line));

  const nextLines = lines.map((line) => {
    if (line.trim() === "") return line;

    if (shouldRemoveChecklist) {
      return line.replace(/^\[( |x)\]\s?/i, "");
    }

    if (/^\[( |x)\]\s?/i.test(line)) {
      return line;
    }

    return `[ ] ${line}`;
  });

  const nextBlock = nextLines.join("\n");
  const nextValue = `${text.slice(0, startOfLine)}${nextBlock}${text.slice(endOfLine)}`;
  const cursorOffset = nextBlock.length - selectedBlock.length;

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

function renderDisplayLine({
  item,
  editorTestId,
  value,
  onChange,
  onEditStart,
}) {
  if (item.kind === "task") {
    return (
      <div
        key={`${editorTestId}-task-${item.index}`}
        className={`plain-note-checklist-item${item.checked ? " is-checked" : ""}`}
        data-testid="note-checklist-item"
      >
        <button
          type="button"
          className="plain-note-checklist-toggle"
          data-testid="note-checklist-toggle"
          aria-label={item.checked ? "Mark task incomplete" : "Mark task complete"}
          onClick={(event) => {
            event.stopPropagation();
            onChange(toggleChecklistItem(value, item.index));
          }}
        >
          <span className="plain-note-checklist-icon" aria-hidden="true">
            {item.checked ? <CheckboxCircleFillIcon /> : <CheckboxBlankCircleLineIcon />}
          </span>
        </button>
        <button
          type="button"
          className="plain-note-checklist-text-button"
          onClick={(event) => {
            event.stopPropagation();
            onEditStart();
          }}
        >
          <span className="plain-note-checklist-text">
            {item.text || "Untitled task"}
          </span>
        </button>
      </div>
    );
  }

  if (item.kind === "bullet") {
    return (
      <div
        key={`${editorTestId}-bullet-${item.index}`}
        className="plain-note-read-line plain-note-read-line--bullet"
      >
        <span className="plain-note-read-marker" aria-hidden="true">
          -
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
      onMouseDown={(event) => {
        if (event.detail > 1) {
          event.preventDefault();
          onEditStart();
        }
      }}
    >
      <span>{item.text}</span>
    </div>
  );
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
  const activeDisplayLines = useMemo(
    () => displayLines.filter((item) => item.kind !== "task" || !item.checked),
    [displayLines]
  );
  const completedDisplayLines = useMemo(
    () => displayLines.filter((item) => item.kind === "task" && item.checked),
    [displayLines]
  );
  const currentLine = getCurrentLine(value, selectionStart);
  const isChecklistActive =
    /^\[( |x)\]\s?/i.test(currentLine) || checklistItems.length > 0;

  const focusEditor = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.focus();
    const cursorPosition = textarea.value.length;
    textarea.setSelectionRange(cursorPosition, cursorPosition);
    setSelectionStart(cursorPosition);
  };

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
    <div
      className={`plain-note-editor ${
        showChecklistPanel && displayLines.length > 0 && !isFocused
          ? "is-read-mode "
          : ""
      }${className}`.trim()}
    >
      <div className="plain-note-toolbar">
        <button
          type="button"
          className={`plain-note-toolbar-button${isChecklistActive ? " is-active" : ""}`}
          data-testid="toggle-task-list"
          aria-label="Toggle checklist line"
          onClick={handleToggleChecklist}
        >
          {isChecklistActive ? <CheckboxMultipleFillIcon /> : <CheckboxMultipleLineIcon />}
        </button>
      </div>

      {showChecklistPanel && displayLines.length > 0 && !isFocused && (
        <div
          className="plain-note-read-panel"
          data-testid="note-read-panel"
          role="button"
          tabIndex={0}
          onClick={focusEditor}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              focusEditor();
            }
          }}
        >
          {activeDisplayLines.map((item) =>
            renderDisplayLine({
              item,
              editorTestId,
              value,
              onChange,
              onEditStart: focusEditor,
            })
          )}

          {completedDisplayLines.length > 0 && (
            <div className="plain-note-completed-section" data-testid="note-completed-section">
              <p className="plain-note-completed-label">
                Completed ({completedDisplayLines.length})
              </p>
              <div className="plain-note-completed-list">
                {completedDisplayLines.map((item) =>
                  renderDisplayLine({
                    item,
                    editorTestId,
                    value,
                    onChange,
                    onEditStart: focusEditor,
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <textarea
        ref={textareaRef}
        className={`plain-note-textarea${
          showChecklistPanel && displayLines.length > 0 && !isFocused
            ? " is-hidden"
            : ""
        }`}
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
