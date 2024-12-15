import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { EditorProvider, useCurrentEditor, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import BoldIcon from "remixicon-react/BoldIcon";
import ItalicIcon from "remixicon-react/ItalicIcon";
import StrikethroughIcon from "remixicon-react/StrikethroughIcon";

import H1Icon from "remixicon-react/H1Icon";
import H2Icon from "remixicon-react/H2Icon";
import H3Icon from "remixicon-react/H3Icon";
import H4Icon from "remixicon-react/H4Icon";
import H5Icon from "remixicon-react/H5Icon";
import H6Icon from "remixicon-react/H6Icon";

import ListUnorderedIcon from "remixicon-react/ListUnorderedIcon";
import ListOrderedIcon from "remixicon-react/ListOrderedIcon";

import SeparatorIcon from "remixicon-react/SeparatorIcon";

import ArrowGoBackLineIcon from "remixicon-react/ArrowGoBackLineIcon";
import ArrowGoForwardLineIcon from "remixicon-react/ArrowGoForwardLineIcon";

function TipTapEditor({ setEditorContent, initialContent = null }) {
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
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "is-active" : ""}
          >
            <BoldIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "is-active" : ""}
          >
            <ItalicIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "is-active" : ""}
          >
            <StrikethroughIcon />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={
              editor.isActive("heading", { level: 1 }) ? "is-active" : ""
            }
          >
            <H1Icon />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={
              editor.isActive("heading", { level: 2 }) ? "is-active" : ""
            }
          >
            <H2Icon />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={
              editor.isActive("heading", { level: 3 }) ? "is-active" : ""
            }
          >
            <H3Icon />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 4 }).run()
            }
            className={
              editor.isActive("heading", { level: 4 }) ? "is-active" : ""
            }
          >
            <H4Icon />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 5 }).run()
            }
            className={
              editor.isActive("heading", { level: 5 }) ? "is-active" : ""
            }
          >
            <H5Icon />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 6 }).run()
            }
            className={
              editor.isActive("heading", { level: 6 }) ? "is-active" : ""
            }
          >
            <H6Icon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "is-active" : ""}
          >
            <ListUnorderedIcon />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "is-active" : ""}
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
    TextStyle.configure({ types: [ListItem.name] }),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
  ];

  const content = initialContent || `<p></p>`;

  return (
    <EditorProvider
      slotBefore={<MenuBar />}
      extensions={extensions}
      content={content}
    ></EditorProvider>
  );
}

export default TipTapEditor;
