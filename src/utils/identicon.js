function hashSeed(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateAvatarSeed() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const STORAGE_KEY = "avatarSeed";

export function loadAvatarSeed(fallback) {
  return localStorage.getItem(STORAGE_KEY) || fallback || "organica";
}

export function saveAvatarSeed(seed) {
  localStorage.setItem(STORAGE_KEY, seed);
}

// A GitHub-identicon-style 5x5 grid, mirrored left-right so the result
// always reads as a single symmetric glyph regardless of the seed.
export function getIdenticonCells(seed) {
  const hash = hashSeed(seed || "organica");
  const cells = [];
  let bit = 0;

  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 5; row++) {
      const filled = ((hash >> bit) & 1) === 1;
      bit = (bit + 1) % 30;

      if (filled) {
        cells.push({ col, row });
        if (col < 2) cells.push({ col: 4 - col, row });
      }
    }
  }

  return cells;
}
