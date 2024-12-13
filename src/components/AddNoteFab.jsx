import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

function AddNoteFab() {
  const navigate = useNavigate();
  return (
    <div>
      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate(`/note/`)}
        id="create-note-fab"
      >
        <AddIcon />
      </Fab>
    </div>
  );
}

export default AddNoteFab;
