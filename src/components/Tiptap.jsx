import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// define your extension array
const extensions = [StarterKit];

const content = "<p>You note content...</p>";

const Tiptap = () => {
  const editor = useEditor({ extensions, content });
  return <EditorContent editor={editor} />;
};

export default Tiptap;
