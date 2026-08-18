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
import FolderOffOutlinedIcon from "@mui/icons-material/FolderOffOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import Download2LineIcon from "remixicon-react/Download2LineIcon";
import LogoutBoxRLineIcon from "remixicon-react/LogoutBoxRLineIcon";
import { auth } from "./Firebase";
import { useAuth } from "./auth/AuthProvider";
import { handleLogout } from "./auth/Logout";
import Identicon from "./Identicon";
import { fetchNotes } from "../utils/fetchNotes.js";
import { generateAvatarSeed, loadAvatarSeed, saveAvatarSeed } from "../utils/identicon";
import { DATE_FORMATS, loadDateFormat, saveDateFormat } from "../utils/dateFormat";
import {
  LIBRARY_FILTERS,
  loadLibraryOrder,
  saveLibraryOrder,
  loadLibraryLabels,
  saveLibraryLabels,
  loadDisabledLibraryFilters,
  saveDisabledLibraryFilters,
  getLibraryLabel,
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
  uncategorized: FolderOffOutlinedIcon,
  archived: ArchiveOutlinedIcon,
};

const FONT_SIZES = [
  { id: "small", label: "Small" },
  { id: "medium", label: "Medium" },
  { id: "large", label: "Large" },
];

const TEXT_WEIGHTS = [
  { id: "light", label: "Thin", family: "Gilroy-Light" },
  { id: "regular", label: "Normal", family: "Gilroy-Regular" },
  { id: "medium", label: "Medium", family: "Gilroy-Medium" },
  { id: "bold", label: "Bold", family: "Gilroy-Bold" },
];

function Settings({
  palette,
  setPalette,
  fontScheme,
  setFontScheme,
  textWeight,
  setTextWeight,
  fontSizeDesktop,
  setFontSizeDesktop,
  fontSizeMobile,
  setFontSizeMobile,
  isMobileViewport,
}) {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState(() => loadAvatarSeed(user?.uid));
  const [libraryOrder, setLibraryOrder] = useState(() => loadLibraryOrder());
  const [libraryLabels, setLibraryLabels] = useState(() => loadLibraryLabels());
  const [disabledFilters, setDisabledFilters] = useState(
    () => new Set(loadDisabledLibraryFilters())
  );
  const [isExporting, setIsExporting] = useState(false);
  const [dateFormat, setDateFormat] = useState(() => loadDateFormat());

  const handleDateFormatChange = (formatId) => {
    setDateFormat(formatId);
    saveDateFormat(formatId);
  };

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

  const handleLibraryLabelChange = (filterId, label) => {
    setLibraryLabels((prev) => {
      const next = { ...prev, [filterId]: label };
      saveLibraryLabels(next);
      return next;
    });
  };

  const handleToggleLibraryFilter = (filterId) => {
    setDisabledFilters((prev) => {
      const next = new Set(prev);
      if (next.has(filterId)) {
        next.delete(filterId);
      } else {
        next.add(filterId);
      }
      saveDisabledLibraryFilters(Array.from(next));
      return next;
    });
  };

  // Settings is a separate route from NotesManager, which is where the
  // notes array normally lives, so this fetches its own copy on demand
  // rather than needing that state lifted up just for an export button
  // used every so often.
  const handleExport = async () => {
    if (!user) return;

    setIsExporting(true);

    try {
      const notes = await fetchNotes(user);
      const notesBlob = new Blob([JSON.stringify(notes, null, 2)], {
        type: "application/json",
      });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(notesBlob);
      link.download = "notes_backup.json";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error exporting notes:", error);
      alert("Couldn't export your notes. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSignOut = () => {
    handleLogout();
    window.location.href = "/login";
  };

  return (
    <div className="page-body">
      <div className="settings-page">
        <div className="settings-header">
          <Link to="/main" className="settings-back-link" aria-label="Back to notes">
            <ArrowLeftLineIcon />
          </Link>
          <div>
            <p className="notes-detail-label">Preferences</p>
            <h1>Settings</h1>
          </div>
        </div>

        <h2 className="settings-group-heading">General</h2>

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
          <h2>Library order</h2>
          <p className="settings-section-hint">
            Reorder and rename your library views. The first three also become the
            mobile bottom bar, alongside Folders.
          </p>

          <div className="settings-reorder-list">
            {(() => {
              let enabledSeen = 0;
              return libraryOrder.map((filterId, index) => {
                const Icon = LIBRARY_ICONS[filterId];
                const defaultLabel = LIBRARY_FILTERS.find(
                  (filter) => filter.id === filterId
                )?.label;
                // Falls back to the default only when never touched
                // (undefined) — once the field holds "" mid-edit, this
                // keeps showing that empty string instead of snapping back
                // to the default and fighting whatever's being typed.
                const inputValue = libraryLabels[filterId] ?? defaultLabel ?? filterId;
                const isEnabled = !disabledFilters.has(filterId);
                const isBottomBarSlot = isEnabled && enabledSeen < 3;
                if (isEnabled) enabledSeen += 1;

                return (
                  <div
                    className={`settings-reorder-row${isEnabled ? "" : " is-disabled"}`}
                    key={filterId}
                  >
                    <label className="settings-reorder-toggle">
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleLibraryFilter(filterId)}
                        aria-label={`Show ${defaultLabel || filterId} in the library list`}
                      />
                      <span className="settings-reorder-toggle-track" aria-hidden="true" />
                    </label>
                    {Icon && <Icon />}
                    <input
                      type="text"
                      className="settings-reorder-label-input"
                      value={inputValue}
                      onChange={(event) =>
                        handleLibraryLabelChange(filterId, event.target.value)
                      }
                      aria-label={`Rename ${defaultLabel || filterId}`}
                    />
                    {isBottomBarSlot && (
                      <span className="settings-reorder-badge">Bottom bar</span>
                    )}
                    <div className="settings-reorder-controls">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveLibraryItem(index, -1)}
                        aria-label={`Move ${defaultLabel || filterId} up`}
                      >
                        <ArrowUpSLineIcon />
                      </button>
                      <button
                        type="button"
                        disabled={index === libraryOrder.length - 1}
                        onClick={() => moveLibraryItem(index, 1)}
                        aria-label={`Move ${defaultLabel || filterId} down`}
                      >
                        <ArrowDownSLineIcon />
                      </button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </section>

        <section className="settings-section">
          <h2>Data &amp; account</h2>
          <p className="settings-section-hint">
            Back up your notes, or sign out of this device.
          </p>

          <div className="settings-account-row">
            <button
              type="button"
              className="settings-account-button"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download2LineIcon />
              <span>{isExporting ? "Exporting..." : "Export notes"}</span>
            </button>
            <button
              type="button"
              className="settings-account-button settings-account-button-danger"
              onClick={handleSignOut}
            >
              <LogoutBoxRLineIcon />
              <span>Log out</span>
            </button>
          </div>
        </section>

        <section className="settings-section">
          <h2>Date format</h2>
          <p className="settings-section-hint">
            Used wherever a note shows a created or updated date.
          </p>

          <div className="settings-date-format-grid">
            {DATE_FORMATS.map((option) => {
              const isActive = dateFormat === option.id;
              return (
                <button
                  type="button"
                  key={option.id}
                  className={`settings-date-format-card${isActive ? " is-active" : ""}`}
                  onClick={() => handleDateFormatChange(option.id)}
                  aria-pressed={isActive}
                >
                  <span>{option.label}</span>
                  {isActive && (
                    <span className="settings-date-format-check" aria-hidden="true">
                      <CheckLineIcon />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <h2 className="settings-group-heading">Theme</h2>

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
          <h2>Text weight</h2>
          <p className="settings-section-hint">
            How bold note text and other body copy reads — the default can look
            thin on some color schemes.
          </p>

          <div className="settings-font-grid">
            {TEXT_WEIGHTS.map((option) => {
              const isActive = textWeight === option.id;
              return (
                <button
                  type="button"
                  key={option.id}
                  className={`settings-font-card${isActive ? " is-active" : ""}`}
                  onClick={() => setTextWeight(option.id)}
                  aria-pressed={isActive}
                >
                  <span
                    className="settings-font-sample"
                    style={{ fontFamily: option.family }}
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
          <h2>Text size</h2>
          <p className="settings-section-hint">
            Scales all the text in the app. Phone and desktop each keep their
            own size, and both are shown here so you can set either one
            regardless of which you're using right now.
          </p>

          <div className="settings-size-group">
            <p className="settings-size-group-label">
              Desktop
              {!isMobileViewport && <span className="settings-size-group-current">This device</span>}
            </p>
            <div className="settings-size-picker" role="group" aria-label="Desktop text size">
              {FONT_SIZES.map((option) => {
                const isActive = fontSizeDesktop === option.id;
                return (
                  <button
                    type="button"
                    key={option.id}
                    className={`settings-size-button${isActive ? " is-active" : ""}`}
                    onClick={() => setFontSizeDesktop(option.id)}
                    aria-pressed={isActive}
                  >
                    <span
                      className={`settings-size-sample settings-size-sample--${option.id}`}
                    >
                      Aa
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="settings-size-group">
            <p className="settings-size-group-label">
              Phone
              {isMobileViewport && <span className="settings-size-group-current">This device</span>}
            </p>
            <div className="settings-size-picker" role="group" aria-label="Phone text size">
              {FONT_SIZES.map((option) => {
                const isActive = fontSizeMobile === option.id;
                return (
                  <button
                    type="button"
                    key={option.id}
                    className={`settings-size-button${isActive ? " is-active" : ""}`}
                    onClick={() => setFontSizeMobile(option.id)}
                    aria-pressed={isActive}
                  >
                    <span
                      className={`settings-size-sample settings-size-sample--${option.id}`}
                    >
                      Aa
                    </span>
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="settings-section settings-preview-section">
          <h2>Preview</h2>
          <p className="settings-section-hint">
            A live look at your current theme and typeface — changes above apply here
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

      </div>
    </div>
  );
}

export default Settings;
