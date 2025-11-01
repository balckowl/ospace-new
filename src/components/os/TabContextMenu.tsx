"use client";

import { Download, PenTool, Trash2 } from "lucide-react";
import { forwardRef } from "react";
import { useLanguage, useTranslation } from "@/i18n/client";
import { cn } from "@/lib/utils";

type TabContextMenuProps = {
  visible: boolean;
  position: { x: number; y: number } | null;
  onDelete: () => void;
  onDownload: () => void;
  onEdit: () => void;
  showDelete?: boolean;
};

export const TabContextMenu = forwardRef<HTMLDivElement, TabContextMenuProps>(
  function TabContextMenu(
    { visible, position, onDelete, onDownload, onEdit, showDelete = true },
    ref,
  ) {
    const { language } = useLanguage();
    const { t } = useTranslation(language);
    if (!visible || !position) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "fixed z-2147483647 w-[150px] rounded-xl  bg-white/90 p-1 shadow-sm backdrop-blur-2xl",
        )}
        style={{
          top: position.y,
          left: position.x,
          transform: "translate(-100%, 0)",
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-gray-800 text-sm transition-colors hover:bg-gray-800/10"
        >
          <PenTool size={17} />
          {t("common.edit")}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onDownload();
          }}
          className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-gray-800 text-sm transition-colors hover:bg-gray-800/10"
        >
          <Download size={17} />
          {t("common.download")}
        </button>
        {showDelete && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-red-600 text-sm transition-colors hover:bg-red-600/10"
          >
            <Trash2 size={17} />
            {t("common.delete")}
          </button>
        )}
      </div>
    );
  },
);
