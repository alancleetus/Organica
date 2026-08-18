function normalizeWhitespace(value = "") {
  return value.replace(/\u00a0/g, " ").replace(/\r\n/g, "\n");
}

function getNodeText(node) {
  return normalizeWhitespace(node?.textContent || "").replace(/\s+/g, " ").trim();
}

function nodeToLines(node) {
  if (!node) return [];

  if (node.nodeType === Node.TEXT_NODE) {
    const text = normalizeWhitespace(node.textContent || "").trim();
    return text ? [text] : [];
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return [];
  }

  const tagName = node.tagName.toLowerCase();

  if (tagName === "br") {
    return [""];
  }

  if (tagName === "ul" && node.getAttribute("data-type") === "taskList") {
    return Array.from(node.querySelectorAll(":scope > li"))
      .map((item) => {
        const text = getNodeText(item);
        if (!text) return "";
        const checked = item.getAttribute("data-checked") === "true";
        return `${checked ? "[x]" : "[ ]"} ${text}`;
      })
      .filter(Boolean);
  }

  if (tagName === "ul" || tagName === "ol") {
    return Array.from(node.querySelectorAll(":scope > li"))
      .map((item) => {
        const text = getNodeText(item);
        return text ? `- ${text}` : "";
      })
      .filter(Boolean);
  }

  if (/^h[1-6]$/.test(tagName) || tagName === "p" || tagName === "blockquote") {
    const text = getNodeText(node);
    return text ? [text] : [];
  }

  const childLines = Array.from(node.childNodes).flatMap(nodeToLines);
  if (childLines.length) return childLines;

  const text = getNodeText(node);
  return text ? [text] : [];
}

export function normalizeNoteContent(content = "") {
  const input = normalizeWhitespace(content || "");
  if (!input.trim()) return "";

  if (!/[<>]/.test(input)) {
    return input;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(input, "text/html");
  const lines = Array.from(document.body.childNodes).flatMap(nodeToLines);

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function getPreviewItems(content = "") {
  return normalizeNoteContent(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const taskMatch = line.match(/^\[(x| )\]\s*(.*)$/i);
      if (taskMatch) {
        return {
          kind: "task",
          checked: taskMatch[1].toLowerCase() === "x",
          text: taskMatch[2].trim(),
        };
      }

      const bulletMatch = line.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        return {
          kind: "bullet",
          text: bulletMatch[1].trim(),
        };
      }

      return {
        kind: "text",
        text: line,
      };
    })
    .filter((item) => item.text);
}

export function isChecklistContent(content = "") {
  return getPreviewItems(content).some((item) => item.kind === "task");
}

export function resolveNoteType(note) {
  if (note?.noteType === "checklist" || note?.noteType === "text") {
    return note.noteType;
  }
  return isChecklistContent(note?.content) ? "checklist" : "text";
}

export function checklistContentToItems(content = "") {
  return normalizeNoteContent(content)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const taskMatch = line.match(/^\[(x| )\]\s*(.*)$/i);
      if (taskMatch) {
        return { checked: taskMatch[1].toLowerCase() === "x", text: taskMatch[2].trim() };
      }

      const bulletMatch = line.match(/^[-*]\s+(.*)$/);
      if (bulletMatch) {
        return { checked: false, text: bulletMatch[1].trim() };
      }

      return { checked: false, text: line };
    });
}

export function checklistItemsToContent(items = []) {
  return items
    .filter((item) => item.text.trim() !== "")
    .map((item) => `${item.checked ? "[x]" : "[ ]"} ${item.text.trim()}`)
    .join("\n");
}

// Checklist-note content is always one `[ ]`/`[x]` line per item (no
// blank lines — checklistItemsToContent strips those), so a line index
// lines up 1:1 with item order. Used by the focus-note panel to flip an
// item's checked state without pulling in the full ChecklistEditor.
export function toggleChecklistLine(content = "", lineIndex) {
  const lines = content.split("\n");
  if (!lines[lineIndex]) return content;

  lines[lineIndex] = lines[lineIndex].replace(
    /^\[( |x)\]/i,
    (match, state) => `[${state.toLowerCase() === "x" ? " " : "x"}]`
  );
  return lines.join("\n");
}

export function getSearchableText(content = "") {
  return normalizeNoteContent(content).toLowerCase();
}

// Applied on save, not on every keystroke, so it never fights with
// typing mid-line. Checklist content is already trimmed per item by
// checklistItemsToContent, so this only matters for plain text notes.
export function trimNoteContent(content = "") {
  return content
    .split("\n")
    .map((line) => line.replace(/[ \t]+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
