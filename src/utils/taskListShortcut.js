import { Extension } from "@tiptap/core";

const TaskListShortcut = Extension.create({
  name: "taskListShortcut",

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-7": () => this.editor.commands.toggleTaskList(),
    };
  },
});

export default TaskListShortcut;
