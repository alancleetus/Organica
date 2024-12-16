import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";

// define your extension array
const extensions = [
  StarterKit,
  TaskList.configure({
    HTMLAttributes: {
      class: "checkbox-wrapper-11",
    },
    itemTypeName: "taskItem",
  }),
  TaskItem,
];

const content = `<p></p>`;

const Tiptap = () => {
  const editor = useEditor({ extensions, content });
  return <EditorContent editor={editor} />;
};

export default Tiptap;
