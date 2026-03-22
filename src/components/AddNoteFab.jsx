import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function AddNoteFab({ onClick }) {
  return (
    <div>
      <Fab
        color="primary"
        aria-label="add"
        onClick={onClick}
        id="create-note-fab"
        data-testid="add-note-fab"
      >
        <AddIcon />
      </Fab>
    </div>
  );
}

export default AddNoteFab;
