import AddIcon from "@mui/icons-material/Add";

function AddNoteFab({ onClick }) {
  return (
    <button
      type="button"
      aria-label="add"
      onClick={onClick}
      id="create-note-fab"
      data-testid="add-note-fab"
    >
      <span className="create-note-fab-icon">
        <AddIcon />
      </span>
      <span>Add note</span>
    </button>
  );
}

export default AddNoteFab;
