import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

function Sorter({
  sortingOptions,
  currentSorting,
  onSortingChange,
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
      <UnfoldMoreIcon onClick={toggleSortDirection} />
    </div>
  );
}

export default Sorter;
