import { X } from "lucide-react";
import type { FontOptionType } from "@/server/schemas/desktop.schema";
import type { HelpWindowType } from "../types";
import WindowHeader from "./WindowHeader";
import { WindowWrapper } from "./WindowWrapper";

export function HelpWindow({
  window,
  onClose,
  onBringToFront,
  onPositionChange,
  onSizeChange,
  getFontStyle,
  currentFont,
}: {
  window: HelpWindowType;
  onClose: () => void;
  onBringToFront: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  getFontStyle: (newFont: FontOptionType) => void;
  currentFont: FontOptionType;
}) {
  return (
    <WindowWrapper
      window={window}
      onBringToFront={onBringToFront}
      onSizeChange={onSizeChange}
      onPositionChange={onPositionChange}
    >
      <WindowHeader
        title="Introductions"
        getFontStyle={getFontStyle}
        currentFont={currentFont}
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

      <div className="h-[calc(100%-40px)] flex-1 overflow-y-auto bg-white/90 px-1.5 pb-1.5">
        <div className="h-full rounded-xl bg-white">
          <h2 className="mb-4 pt-4 pl-2 font-extrabold text-2xl tracking-tight">
            Instructions
          </h2>
          <ol className="list-decimal space-y-6 pl-7 text-base text-gray-800">
            <li>
              <span className="font-semibold text-blue-700">Notepad</span>{" "}
              allows you to write notes in{" "}
              <span className="rounded bg-gray-200 px-2 py-0.5 font-mono text-blue-800 text-sm">
                Markdown
              </span>{" "}
              format.
              <br />
              <span className="mt-1 block text-gray-500 text-xs italic">
                Example: Try leaving your self-introduction or study notes.
              </span>
            </li>
            <li>
              You can convert your{" "}
              <span className="font-semibold text-blue-700">
                favorite websites
              </span>{" "}
              into apps and open them in your OS.
              <br />
              <span className="mt-1 block text-gray-500 text-xs italic">
                Example: Register frequently used services or reference sites.
              </span>
            </li>
            <li>
              By using{" "}
              <span className="font-semibold text-blue-700">folders</span>, you
              can organize the apps you have created.
              <br />
              <span className="mt-1 block text-gray-500 text-xs italic">
                Example: Group your apps by theme for better organization.
              </span>
            </li>
          </ol>
        </div>
      </div>
    </WindowWrapper>
  );
}
