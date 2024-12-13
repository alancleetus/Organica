export function formatTimestampToDate(timestamp) {
  const date = new Date(timestamp);

  // Options for formatting
  const options = {
    weekday: "short", // Abbreviated weekday (e.g., Thu)
    day: "2-digit", // Two-digit day
    month: "2-digit", // Two-digit month
    year: "numeric", // Four-digit year
    hour: "2-digit", // Two-digit hour
    minute: "2-digit", // Two-digit minute
    hour12: true, // 12-hour format with am/pm
  };

  return new Intl.DateTimeFormat("en-US", options).format(date);
}
