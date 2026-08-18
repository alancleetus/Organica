const STORAGE_KEY = "dateFormat";

export const DATE_FORMATS = [
  {
    id: "medium",
    label: "Aug 17, 2026",
    format: (date) =>
      date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
  },
  {
    id: "short",
    label: "Aug 17",
    format: (date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  },
  {
    id: "numeric",
    label: "08/17/2026",
    format: (date) =>
      date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
  },
  {
    id: "iso",
    label: "2026-08-17",
    format: (date) => date.toISOString().slice(0, 10),
  },
];

export function loadDateFormat() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return DATE_FORMATS.some((option) => option.id === saved) ? saved : "medium";
}

export function saveDateFormat(formatId) {
  localStorage.setItem(STORAGE_KEY, formatId);
}

export function formatDate(timestamp, formatId) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "";

  const option = DATE_FORMATS.find((entry) => entry.id === formatId) || DATE_FORMATS[0];
  return option.format(date);
}
