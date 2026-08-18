import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import CheckLineIcon from "remixicon-react/CheckLineIcon";
import ShuffleLineIcon from "remixicon-react/ShuffleLineIcon";
import ArrowUpSLineIcon from "remixicon-react/ArrowUpSLineIcon";
import ArrowDownSLineIcon from "remixicon-react/ArrowDownSLineIcon";
import PushpinLineIcon from "remixicon-react/PushpinLineIcon";
import HeartLineIcon from "remixicon-react/HeartLineIcon";
import CheckboxBlankCircleLineIcon from "remixicon-react/CheckboxBlankCircleLineIcon";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import { auth } from "./Firebase";
import { useAuth } from "./auth/AuthProvider";
import Identicon from "./Identicon";
import { generateAvatarSeed, loadAvatarSeed, saveAvatarSeed } from "../utils/identicon";
import {
  LIBRARY_FILTERS,
  loadLibraryOrder,
  saveLibraryOrder,
} from "../utils/bottomBarConfig";

// Swatch previews shown on each card. The actual theme is applied via the
// matching `[data-palette="<id>"]` block in styles.css — these are just
// enough hex values to render a small preview, kept in sync by hand since
// there are only a handful of palettes.
export const PALETTES = [
  {
    id: "monochrome-light",
    label: "Monochrome",
    mode: "Light",
    swatches: ["#F0F0F2", "#FFFFFF", "#16161A"],
  },
  {
    id: "monochrome-dark",
    label: "Monochrome",
    mode: "Dark",
    swatches: ["#0E0E10", "#1B1B1F", "#F1F1F3"],
  },
  {
    id: "slate-light",
    label: "Slate",
    mode: "Light",
    swatches: ["#F0F0F2", "#FFFFFF", "#3B5D7A"],
  },
  {
    id: "slate-dark",
    label: "Slate",
    mode: "Dark",
    swatches: ["#0E0E10", "#1B1B1F", "#8FB4D9"],
  },
  {
    id: "dracula",
    label: "Dracula",
    mode: "Dark",
    swatches: ["#282A36", "#343746", "#BD93F9"],
  },
  {
    id: "nord",
    label: "Nord",
    mode: "Dark",
    swatches: ["#2E3440", "#3B4252", "#88C0D0"],
  },
  {
    id: "solarized-light",
    label: "Solarized",
    mode: "Light",
    swatches: ["#EEE8D5", "#FDF6E3", "#268BD2"],
  },
  {
    id: "solarized-dark",
    label: "Solarized",
    mode: "Dark",
    swatches: ["#002B36", "#073642", "#268BD2"],
  },
  {
    id: "gruvbox-light",
    label: "Gruvbox",
    mode: "Light",
    swatches: ["#FBF1C7", "#F9F5D7", "#AF3A03"],
  },
  {
    id: "gruvbox-dark",
    label: "Gruvbox",
    mode: "Dark",
    swatches: ["#282828", "#32302F", "#FE8019"],
  },
  {
    id: "catppuccin-latte",
    label: "Catppuccin",
    mode: "Light",
    swatches: ["#E6E9EF", "#EFF1F5", "#8839EF"],
  },
  {
    id: "catppuccin-mocha",
    label: "Catppuccin",
    mode: "Dark",
    swatches: ["#181825", "#1E1E2E", "#CBA6F7"],
  },
];

export function getPaletteToggleTarget(paletteId) {
  const current = PALETTES.find((option) => option.id === paletteId);
  if (!current) return "slate-light";

  const sibling = PALETTES.find(
    (option) => option.label === current.label && option.mode !== current.mode
  );
  if (sibling) return sibling.id;

  return current.mode === "Dark" ? "monochrome-light" : "monochrome-dark";
}

export const FONT_SCHEMES = [
  { id: "gilroy", label: "Gilroy (default)", family: null },
  {
    id: "system",
    label: "System Sans",
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  {
    id: "serif",
    label: "Serif",
    family: 'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
  },
  {
    id: "mono",
    label: "Mono",
    family: '"SF Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  },
  {
    id: "rounded",
    label: "Rounded",
    family: 'ui-rounded, "SF Pro Rounded", "Segoe UI", Roboto, sans-serif',
  },
  {
    id: "condensed",
    label: "Condensed",
    family: '"Arial Narrow", "Roboto Condensed", "Helvetica Neue", Arial, sans-serif',
  },
];

const LIBRARY_ICONS = {
  all: DescriptionOutlinedIcon,
  pinned: PushpinLineIcon,
  favorites: HeartLineIcon,
  tasks: FactCheckOutlinedIcon,
  "notes-only": NotesOutlinedIcon,
  archived: ArchiveOutlinedIcon,
};

function Settings({ palette, setPalette, fontScheme, setFontScheme }) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(() => loadAvatarSeed(user?.uid));
  const [libraryOrder, setLibraryOrder] = useState(() => loadLibraryOrder());

  useEffect(() => {
    if (user) setDisplayName(user.displayName || "");
  }, [user]);

  const handleShuffleAvatar = () => {
    const nextSeed = generateAvatarSeed();
    saveAvatarSeed(nextSeed);
    setAvatarSeed(nextSeed);
  };

  const handleSaveName = async (event) => {
    event.preventDefault();
    if (!auth.currentUser) return;

    setIsSavingName(true);
    setNameSaved(false);

    try {
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setNameSaved(true);
    } catch (error) {
      console.error("Error updating display name:", error);
    } finally {
      setIsSavingName(false);
    }
  };

  const moveLibraryItem = (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= libraryOrder.length) return;

    const next = [...libraryOrder];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    setLibraryOrder(next);
    saveLibraryOrder(next);
  };

  return (
    <div className="page-body">
      <div className="settings-page">
        <div className="settings-header">
          <Link to="/main" className="notes-mobile-back">
            <ArrowLeftLineIcon />
            <span>Back to notes</span>
          </Link>
          <div>
            <p className="notes-detail-label">Preferences</p>
            <h1>Settings</h1>
          </div>
        </div>

        <section className="settings-section settings-preview-section">
          <h2>Preview</h2>
          <p className="settings-section-hint">
            A live look at your current theme and typeface — changes below apply here
            immediately.
          </p>

          <div className="settings-preview">
            <div className="settings-preview-sidebar">
              <div className="notes-sidebar-profile">
                <span className="notes-avatar">
                  <Identicon seed={avatarSeed} size={18} />
                </span>
                <span className="notes-sidebar-profile-name">
                  {displayName || user?.email || "You"}
                </span>
              </div>
              <button type="button" className="notes-sidebar-link is-active">
                <DescriptionOutlinedIcon />
                <span className="notes-sidebar-link-label">All Notes</span>
                <span className="notes-sidebar-link-count">4</span>
              </button>
              <button type="button" className="notes-sidebar-link">
                <PushpinLineIcon />
                <span className="notes-sidebar-link-label">Pinned</span>
                <span className="notes-sidebar-link-count">1</span>
              </button>
            </div>

            <article className="note-list-item is-selected settings-preview-card">
              <div className="note-list-item-top">
                <p className="note-list-item-date">Today</p>
              </div>
              <h3 className="note-list-item-title">Trip packing list</h3>
              <div className="note-list-item-preview">
                <div className="note-list-item-preview-line note-list-item-preview-line--task">
                  <span className="note-list-item-preview-marker">
                    <CheckboxBlankCircleLineIcon />
                  </span>
                  <span>Passport &amp; tickets</span>
                </div>
              </div>
              <div className="tag-chip-row">
                <span className="tag-chip">
                  <FolderOutlinedIcon aria-hidden="true" />
                  <span className="tag-chip-label">Travel</span>
                </span>
              </div>
            </article>
          </div>
        </section>

        <section className="settings-section">
          <h2>Profile</h2>
          <p className="settings-section-hint">
            Your display name and avatar, shown in the sidebar.
          </p>

          <div className="settings-profile-row">
            <span className="settings-avatar-preview">
              <Identicon seed={avatarSeed} size={26} />
            </span>
            <button
              type="button"
              className="settings-shuffle-button"
              onClick={handleShuffleAvatar}
            >
              <ShuffleLineIcon />
              <span>New icon</span>
            </button>

            <form className="settings-name-form" onSubmit={handleSaveName}>
              <input
                type="text"
                className="settings-name-input"
                placeholder={user?.email || "Your name"}
                value={displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setNameSaved(false);
                }}
              />
              <button type="submit" className="settings-name-save" disabled={isSavingName}>
                {isSavingName ? "Saving..." : nameSaved ? "Saved" : "Save"}
              </button>
            </form>
          </div>
        </section>

        <section className="settings-section">
          <h2>Color scheme</h2>
          <p className="settings-section-hint">
            Pick a palette — it applies everywhere, including the login screen.
          </p>

          <div className="settings-palette-grid">
            {PALETTES.map((option) => {
              const isActive = palette === option.id;
              return (
                <button
                  type="button"
                  key={option.id}
                  className={`settings-palette-card${isActive ? " is-active" : ""}`}
                  onClick={() => setPalette(option.id)}
                  aria-pressed={isActive}
                >
                  <span className="settings-palette-swatches">
                    {option.swatches.map((color, index) => (
                      <span
                        key={index}
                        className="settings-palette-swatch"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                  <span className="settings-palette-name">
                    {option.label}
                    <span className="settings-palette-mode">{option.mode}</span>
                  </span>
                  {isActive && (
                    <span className="settings-palette-check" aria-hidden="true">
                      <CheckLineIcon />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="settings-section">
          <h2>Typeface</h2>
          <p className="settings-section-hint">
            Gilroy is the default look; these swap in a system font stack across the
            whole app instead.
          </p>

          <div className="settings-font-grid">
            {FONT_SCHEMES.map((option) => {
              const isActive = fontScheme === option.id;
              return (
                <button
                  type="button"
                  key={option.id}
                  className={`settings-font-card${isActive ? " is-active" : ""}`}
                  onClick={() => setFontScheme(option.id)}
                  aria-pressed={isActive}
                >
                  <span
                    className="settings-font-sample"
                    style={option.family ? { fontFamily: option.family } : undefined}
                  >
                    Aa
                  </span>
                  <span className="settings-font-name">{option.label}</span>
                  {isActive && (
                    <span className="settings-font-check" aria-hidden="true">
                      <CheckLineIcon />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="settings-section">
          <h2>Library order</h2>
          <p className="settings-section-hint">
            Reorder your library views. The first three also become the mobile bottom
            bar, alongside Folders.
          </p>

          <div className="settings-reorder-list">
            {libraryOrder.map((filterId, index) => {
              const Icon = LIBRARY_ICONS[filterId];
              const label = LIBRARY_FILTERS.find((filter) => filter.id === filterId)?.label;

              return (
                <div className="settings-reorder-row" key={filterId}>
                  {Icon && <Icon />}
                  <span className="settings-reorder-label">{label}</span>
                  {index < 3 && <span className="settings-reorder-badge">Bottom bar</span>}
                  <div className="settings-reorder-controls">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveLibraryItem(index, -1)}
                      aria-label={`Move ${label} up`}
                    >
                      <ArrowUpSLineIcon />
                    </button>
                    <button
                      type="button"
                      disabled={index === libraryOrder.length - 1}
                      onClick={() => moveLibraryItem(index, 1)}
                      aria-label={`Move ${label} down`}
                    >
                      <ArrowDownSLineIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
