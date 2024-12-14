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

      {isAscending ? (
        <KeyboardArrowUpIcon onClick={toggleSortDirection} />
      ) : (
        <KeyboardArrowDownIcon onClick={toggleSortDirection} />
      )}
    </div>
  );
}

export default Sorter;
