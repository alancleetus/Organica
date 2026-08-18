import { Link } from "react-router-dom";
import ArrowLeftLineIcon from "remixicon-react/ArrowLeftLineIcon";
import CheckLineIcon from "remixicon-react/CheckLineIcon";

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
];

function Settings({ palette, setPalette }) {
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
      </div>
    </div>
  );
}

export default Settings;
