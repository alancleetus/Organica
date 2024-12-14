import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "./Firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./Header";
import Note from "./Note";
import AddNoteFab from "./AddNoteFab";
import { fetchNotes } from "../utils/fetchNotes.js";
import { formatTimestampToDate } from "../utils/formatTimestampToDate.js";
import Sorter from "./Sorter";

function NotesManager({ theme, toggleTheme }) {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [sortingMethod, setSortingMethod] = useState("date");

  /****  Redirect to login if not authenticated ****/
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/login");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  /*****  Fetch notes from Firestore when the component mounts *****/
  useEffect(() => {
    const getNotes = async () => {
      if (user) {
        const fetchedNotes = await fetchNotes(user);
        setNotes(fetchedNotes || []); // Ensure `notes` is always an array
      }
    };

    getNotes();
  }, [user]);

  /*****  Fetch notes when route changes back to /main *****/
  useEffect(() => {
    console.log("fetching notes");
    const getNotes = async () => {
      if (user) {
        const fetchedNotes = await fetchNotes(user);
        setNotes(fetchedNotes || []); // Update notes when navigating back to /main
      }
    };

    getNotes();
  }, [user, navigate]); // Dependency on `navigate` ensures the fetch is triggered on route change

  const handleSortingChange = (newMethod) => {
    setSortingMethod(newMethod);
    sortNotes(sortedNotes);
  };
  const [isAscending, setIsAscending] = useState(true); // Default to ascending
  const sortNotes = (method) => {
    if (!Array.isArray(notes)) return []; // Guard against invalid `notes`

    const sortedNotes = [...notes]; // Make a copy
    switch (method) {
      case "date":
        sortedNotes.sort(
          (a, b) => new Date(a.creationDate) - new Date(b.creationDate)
        );
      case "title":
        sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
      default:
        sortedNotes;
    }

    return isAscending ? sortedNotes : sortedNotes.reverse();
  };
  const toggleSortDirection = () => {
    setIsAscending((prev) => !prev);
  };
  const sortedNotes = sortNotes(sortingMethod);

  return (
    <>
      <AddNoteFab user={user} />
      <Header toggleTheme={toggleTheme} theme={theme} />

      <div className="sectioned-div">
        <div className="section-title">
          <h2>All Notes</h2>
          <p className="section-badge">{sortedNotes.length}</p>
        </div>
        <Sorter
          sortingOptions={[
            { value: "date", label: "Date" },
            { value: "title", label: "Title" },
          ]}
          currentSorting={sortingMethod}
          onSortingChange={handleSortingChange}
          toggleSortDirection={toggleSortDirection}
        />
      </div>

      <div id="notes-grid">
        {sortedNotes.map((note) => (
          <Note
            key={note.id}
            id={note.id}
            title={note.title}
            date={formatTimestampToDate(note.creationDate.seconds)}
            content={note.content}
            isList={note.isList}
            setNotes={setNotes}
          />
        ))}
      </div>
    </>
  );
}

export default NotesManager;
