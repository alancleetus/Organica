import { useState } from "react";
import SortByAlphaOutlinedIcon from "@mui/icons-material/SortByAlphaOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import UpdateOutlinedIcon from "@mui/icons-material/UpdateOutlined";
import AlarmOutlinedIcon from "@mui/icons-material/AlarmOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ArrowUpwardOutlinedIcon from "@mui/icons-material/ArrowUpwardOutlined";
import ArrowDownwardOutlinedIcon from "@mui/icons-material/ArrowDownwardOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

const SORT_ICONS = {
  title: SortByAlphaOutlinedIcon,
  creationDT: EventOutlinedIcon,
  modifiedDT: UpdateOutlinedIcon,
  dueDT: AlarmOutlinedIcon,
  reminderDT: NotificationsOutlinedIcon,
};

function Sorter({
  sortingOptions,
  currentSorting,
  onSortingChange,
  isAscending,
  toggleSortDirection,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentOption = sortingOptions.find((option) => option.value === currentSorting);
  const CurrentIcon = SORT_ICONS[currentSorting];

  return (
    <div className="sorter">
      <button
        type="button"
        className="sorter-trigger"
        data-testid="sorter-select"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={`Sort by ${currentOption?.label || ""}`}
      >
        {CurrentIcon && <CurrentIcon />}
        <span>{currentOption?.label}</span>
        <ArrowDropDownIcon className="sorter-trigger-caret" />
      </button>

      <button
        type="button"
        className="sorter-direction"
        data-testid="sort-direction-toggle"
        aria-label={isAscending ? "Sort ascending" : "Sort descending"}
        onClick={toggleSortDirection}
      >
        {isAscending ? <ArrowUpwardOutlinedIcon /> : <ArrowDownwardOutlinedIcon />}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            className="sorter-backdrop"
            aria-label="Close"
            onClick={() => setIsOpen(false)}
          />
          <div className="sorter-menu">
            {sortingOptions.map((option) => {
              const Icon = SORT_ICONS[option.value];
              return (
                <button
                  type="button"
                  key={option.value}
                  className={`sorter-menu-item${option.value === currentSorting ? " is-active" : ""}`}
                  onClick={() => {
                    onSortingChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  {Icon && <Icon />}
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Sorter;
