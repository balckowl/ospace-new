import { Placeholder } from "@tiptap/extensions";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { X } from "lucide-react";
import type { FontOptionType } from "@/server/schemas/desktop.schema";
import TiptapEditor from "../TipTapEditor";
import type { MemoWindowType } from "../types";
import WindowHeader from "./WindowHeader";
import { WindowWrapper } from "./WindowWrapper";

export function MemoWindow({
  window,
  onClose,
  onContentChange,
  onBringToFront,
  onPositionChange,
  onSizeChange,
  isEditable = false,
  getFontStyle,
  currentFont,
}: {
  window: MemoWindowType;
  onClose: () => void;
  onContentChange: (content: string) => void;
  onBringToFront: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  isEditable: boolean;
  getFontStyle: (newFont: FontOptionType) => void;
  currentFont: FontOptionType;
}) {
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something ...",
      }),
    ],
    content: window.content,
    editable: isEditable,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-li:marker:text-black prose-p:m-0 prose-headings:m-0 prose-ul:m-0 prose-ol:m-0 prose-blockquote:m-0 prose-hr:m-0 prose-pre:m-0 min-h-full p-5 focus:outline-none text-left cursor-text",
      },
    },
    onCreate: ({ editor }) => {
      if (isEditable) {
        editor.commands.focus("end");
      }
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.getHTML();
      onContentChange(markdown);
    },
  });

  const handleContentAreaMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) {
      return;
    }
    e.stopPropagation();
    onBringToFront();
    if (!isEditable) {
      return;
    }
    editor?.chain().focus("end").run();
  };

  return (
    <WindowWrapper
      window={window}
      onBringToFront={onBringToFront}
      onSizeChange={onSizeChange}
      onPositionChange={onPositionChange}
    >
      <WindowHeader
        getFontStyle={getFontStyle}
        currentFont={currentFont}
        title={window.title}
        accentColor={window.color}
      >
        <button
          onMouseDown={(e) => e.stopPropagation()}
          onClick={onClose}
          className="relative flex h-6 w-8 items-center justify-center rounded-lg font-bold text-black transition-all duration-200 hover:bg-gray-300/60"
          type="button"
          title="Close"
          aria-label="Close"
        >
          <X size={17} strokeWidth={2.5} />
        </button>
      </WindowHeader>
      <div className="flex h-[calc(100%-40px)] flex-1 flex-col overflow-y-auto px-1.5 pb-1.5 bg-white/90 backdrop-blur-lg">
        <div
          className="flex h-full flex-1 flex-col overflow-y-auto rounded-xl bg-white/90 backdrop-blur-sm"
          onMouseDown={handleContentAreaMouseDown}
        >
          <TiptapEditor editor={editor} />
        </div>
      </div>
    </WindowWrapper>
  );
}
