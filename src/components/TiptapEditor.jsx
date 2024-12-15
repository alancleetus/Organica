import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";

import ListUnorderedIcon from "remixicon-react/ListUnorderedIcon";
import ListOrderedIcon from "remixicon-react/ListOrderedIcon";
import CheckboxMultipleLineIcon from "remixicon-react/CheckboxMultipleLineIcon";

import SeparatorIcon from "remixicon-react/SeparatorIcon";

import ArrowGoBackLineIcon from "remixicon-react/ArrowGoBackLineIcon";
import ArrowGoForwardLineIcon from "remixicon-react/ArrowGoForwardLineIcon";
const TipTapEditor = ({ setEditorContent, initialContent = null }) => {
  const MenuBar = () => {
    const { editor } = useCurrentEditor();
    if (!editor) {
      return null;
    }

    setEditorContent(editor.getHTML());

    return (
      <div className="control-group">
        <div className="button-group">
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={
              editor.isActive("taskList")
                ? "is-active editor-button"
                : "editor-button"
            }
          >
            <CheckboxMultipleLineIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={
              editor.isActive("bulletList")
                ? "is-active editor-button"
                : "editor-button"
            }
          >
            <ListUnorderedIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={
              editor.isActive("orderedList")
                ? "is-active editor-button"
                : "editor-button"
            }
          >
            <ListOrderedIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
          >
            <SeparatorIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
          >
            <ArrowGoBackLineIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
          >
            <ArrowGoForwardLineIcon />
          </button>
        </div>
      </div>
    );
  };

  const extensions = [
    StarterKit,
    TaskList.configure({
      HTMLAttributes: {
        class: "my-custom-class",
      },
      itemTypeName: "taskItem",
    }),
    TaskItem,
    TextStyle.configure({ types: [ListItem.name] }),
  ];

  const content = initialContent || `<p></p>`;

  return (
    <EditorProvider
      slotBefore={<MenuBar />}
      extensions={extensions}
      content={content}
    />
  );
};

export default TipTapEditor;
