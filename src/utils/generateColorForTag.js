export function generateColorForTag(tag) {
  // Hash the string into a number
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert the hash to a color
  const color = `hsl(${hash % 360}, 70%, 80%)`;
  return color;
}
