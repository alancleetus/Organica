import StarterKit from "@tiptap/starter-kit";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import { EditorProvider, useCurrentEditor } from "@tiptap/react";
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import Placeholder from "@tiptap/extension-placeholder";
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
        <div className="button-group editor-button-group">
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
            className="editor-button "
          >
            <SeparatorIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().chain().focus().undo().run()}
            className="editor-button "
          >
            <ArrowGoBackLineIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().chain().focus().redo().run()}
            className="editor-button "
          >
            <ArrowGoForwardLineIcon />
          </button>
        </div>
      </div>
    );
  };

  const extensions = [
    StarterKit,
    Placeholder.configure({
      placeholder: "Type Something... ",
    }),
    TaskList.configure({
      HTMLAttributes: {
        class: "my-task-list",
      },
      itemTypeName: "taskItem",
    }),
    TaskItem.configure({
      HTMLAttributes: {
        class: "my-task-item",
      },
      itemTypeName: "taskItem",
    }),
    ,
    TextStyle.configure({ types: [ListItem.name] }),
  ];

  const content = initialContent || "";

  return (
    <EditorProvider
      slotAfter={<MenuBar />}
      extensions={extensions}
      content={content}
    />
  );
};

export default TipTapEditor;
