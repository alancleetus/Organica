// Text size is kept as two independent preferences — one for mobile-width
// screens, one for desktop — instead of a single value shared everywhere.
// A size that reads fine on a laptop can be too small on a phone, so
// picking one in Settings only affects the screen size you're currently on.
const MOBILE_KEY = "fontSizeMobile";
const DESKTOP_KEY = "fontSizeDesktop";
const LEGACY_KEY = "fontSize";

export function loadFontSize(isMobile) {
  const saved = localStorage.getItem(isMobile ? MOBILE_KEY : DESKTOP_KEY);
  if (saved) return saved;

  // Migrates a size chosen before mobile/desktop were tracked separately —
  // desktop keeps it, mobile starts fresh at the default instead of
  // inheriting a "small" that was only ever tuned for a bigger screen.
  if (!isMobile) {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) return legacy;
  }

  return "medium";
}

export function saveFontSize(value, isMobile) {
  localStorage.setItem(isMobile ? MOBILE_KEY : DESKTOP_KEY, value);
}
