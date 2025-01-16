"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect } from "react";

interface RichTextEditorProps {
  onSubmit: (content: string) => void;
  disabled?: boolean;
}

export default function RichTextEditor({
  onSubmit,
  disabled,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert focus:outline-none max-w-none min-h-[100px] px-4 py-2",
      },
    },
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSubmit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editor]);

  const handleSubmit = useCallback(() => {
    if (!editor || disabled) return;

    const content = editor.getHTML();
    if (!content.trim()) return;

    onSubmit(content);
    editor.commands.clearContent();
  }, [editor, onSubmit, disabled]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-900">
      <EditorContent editor={editor} />
      <div className="flex justify-end px-4 py-2 border-t">
        <button
          onClick={handleSubmit}
          disabled={disabled}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
