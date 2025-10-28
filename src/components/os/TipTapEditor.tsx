"use client";

import { type Editor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";

interface TiptapEditorProps {
  editor: Editor | null;
}

export default function TiptapEditor({ editor }: TiptapEditorProps) {
  useEffect(() => {
    if (editor?.isEditable) {
      editor.commands.focus("end");
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <EditorContent
        editor={editor}
        className="mb-[6px] h-full flex-1 pb-[6px]"
      />
    </div>
  );
}
