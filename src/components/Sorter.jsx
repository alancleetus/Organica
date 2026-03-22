import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

function Sorter({
  sortingOptions,
  currentSorting,
  onSortingChange,
  isAscending,
  toggleSortDirection,
}) {
  return (
    <div className="sorter">
      <select
        id="sorter-select"
        data-testid="sorter-select"
        value={currentSorting}
        onChange={(e) => onSortingChange(e.target.value)}
      >
        {sortingOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {/* <UnfoldMoreIcon onClick={toggleSortDirection} /> */}

      <button
        type="button"
        data-testid="sort-direction-toggle"
        aria-label={isAscending ? "Sort ascending" : "Sort descending"}
        onClick={toggleSortDirection}
      >
        {isAscending ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </button>
    </div>
  );
}

export default Sorter;
