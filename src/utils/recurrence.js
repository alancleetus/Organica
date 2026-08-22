export const RECURRENCE_OPTIONS = [
  { value: "", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
];

function advance(date, rule) {
  const next = new Date(date);
  if (rule === "daily") next.setDate(next.getDate() + 1);
  else if (rule === "weekly") next.setDate(next.getDate() + 7);
  else if (rule === "monthly") next.setMonth(next.getMonth() + 1);
  return next;
}

// Matches the value shape a <input type="datetime-local"> produces
// ("YYYY-MM-DDTHH:mm") so a rolled-forward due date round-trips through
// the same field without a timezone conversion.
function toDateTimeLocalValue(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Rolls a recurring note's due date forward past `now` — looping rather
// than adding a single interval, so a daily task left untouched for two
// weeks lands on today's occurrence, not one that's still in the past.
export function getNextOccurrence(dueDateTime, rule, now = Date.now()) {
  let next = new Date(dueDateTime);
  if (Number.isNaN(next.getTime())) return dueDateTime;

  let guard = 0;
  while (next.getTime() <= now && guard < 10000) {
    next = advance(next, rule);
    guard += 1;
  }

  return toDateTimeLocalValue(next);
}
