"use client";

import { Download, PencilLine, Trash2 } from "lucide-react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type TabContextMenuProps = {
  visible: boolean;
  position: { x: number; y: number } | null;
  desktopName: string;
  onDelete: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onClose: () => void;
};

export const TabContextMenu = forwardRef<HTMLDivElement, TabContextMenuProps>(
  function TabContextMenu(
    { visible, position, desktopName, onDelete, onDownload, onEdit, onClose },
    ref,
  ) {
    if (!visible || !position) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-2147483647 min-w-40 rounded-2xl border border-black/10 bg-white/95 p-1 shadow-xl ring-1 ring-black/5 backdrop-blur",
        )}
        style={{
          top: position.y,
          left: position.x,
          transform: "translate(-100%, 0)",
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className="px-3 py-2 text-xs font-medium text-black/60">
          {desktopName}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <PencilLine size={16} />
          Edit Desktop
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDownload();
          }}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-black/70 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <Download size={16} />
          Download Notes
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          <Trash2 size={16} />
          Delete Desktop
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="mt-1 flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-black/60 transition hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    );
  },
);
