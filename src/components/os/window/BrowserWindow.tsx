import {
  ArrowDownRight,
  Check,
  Link,
  RefreshCcw,
  SquareArrowOutUpRight,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { FontOptionType } from "@/server/schemas/desktop.schema";
import type { BrowserWindowType } from "../types";
import WindowHeader from "./WindowHeader";
import { WindowWrapper } from "./WindowWrapper";

const MIN_WIDTH = 400;
const MIN_HEIGHT = 300;
const SNAP_PADDING = 24;

type BrowserWindowProps = {
  window: BrowserWindowType;
  onClose: () => void;
  onBringToFront: () => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  getFontStyle: (newFont: FontOptionType) => void;
  currentFont: FontOptionType;
};

export function BrowserWindow({
  window,
  onClose,
  onBringToFront,
  onPositionChange,
  onSizeChange,
  getFontStyle,
  currentFont,
}: BrowserWindowProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const copyResetTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [frameKey, setFrameKey] = useState(0);

  const handleRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFrameKey((k) => k + 1);
  };

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const textToCopy = window.url ?? "";
    let success = false;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
        success = true;
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        const selection = document.getSelection();
        const selectedRange = selection?.rangeCount
          ? selection.getRangeAt(0)
          : null;
        textarea.select();
        success = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (selectedRange) {
          selection?.removeAllRanges();
          selection?.addRange(selectedRange);
        }
      }
    } catch {
      success = false;
    }

    if (success) {
      setCopiedUrl(true);
      if (copyResetTimeout.current) {
        clearTimeout(copyResetTimeout.current);
      }
      copyResetTimeout.current = setTimeout(() => {
        setCopiedUrl(false);
        copyResetTimeout.current = null;
      }, 2000);
    }
  };

  useEffect(() => {
    return () => {
      if (copyResetTimeout.current) {
        clearTimeout(copyResetTimeout.current);
      }
    };
  }, []);

  const handleSnapToCorner = (e: React.MouseEvent) => {
    e.stopPropagation();

    const viewport =
      typeof globalThis !== "undefined" &&
      typeof (globalThis as unknown as Window).innerWidth === "number"
        ? (globalThis as unknown as Window)
        : undefined;

    const nextWidth = MIN_WIDTH;
    const nextHeight = MIN_HEIGHT;
    const viewportWidth = viewport?.innerWidth ?? nextWidth;
    const viewportHeight = viewport?.innerHeight ?? nextHeight;

    const nextX = Math.max(
      SNAP_PADDING,
      viewportWidth - nextWidth - SNAP_PADDING,
    );
    const nextY = Math.max(
      SNAP_PADDING,
      viewportHeight - nextHeight - SNAP_PADDING,
    );

    onBringToFront();
    onSizeChange({ width: nextWidth, height: nextHeight });
    onPositionChange({ x: nextX, y: nextY });
  };

  return (
    <WindowWrapper
      window={window}
      onBringToFront={onBringToFront}
      onSizeChange={onSizeChange}
      onPositionChange={onPositionChange}
    >
      <WindowHeader
        title={window.title}
        currentFont={currentFont}
        getFontStyle={getFontStyle}
        accentColor={window.color}
      >
        <div className="flex items-center gap-1">
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleCopyUrl}
            className="relative flex h-6 w-8 items-center justify-center rounded-sm text-black transition-all duration-200 hover:bg-gray-300/60"
            type="button"
            title={copiedUrl ? "Copied" : "Copy URL"}
            aria-label={copiedUrl ? "Copied" : "Copy URL"}
          >
            <span
              className={`absolute transition-all duration-200 ${copiedUrl ? "scale-0 opacity-0" : "scale-100 opacity-100"}`}
            >
              <Link size={15} strokeWidth={2.5} />
            </span>
            <span
              className={`absolute transition-all duration-200 ${copiedUrl ? "scale-100 opacity-100" : "scale-0 opacity-0"}`}
            >
              <Check size={15} strokeWidth={2.5} />
            </span>
          </button>

          <a
            onMouseDown={(e) => e.stopPropagation()}
            className={`relative flex h-6 w-8 items-center justify-center rounded-sm text-black transition-all duration-200 ${window.url ? "hover:bg-gray-300/60" : "cursor-not-allowed opacity-50"}`}
            title="Open in new tab"
            aria-label="Open in new tab"
            href={window.url ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!window.url}
            onClick={(e) => {
              if (!window.url) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            <SquareArrowOutUpRight size={15} strokeWidth={2.5} />
          </a>

          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleRefresh}
            className="relative flex h-6 w-8 items-center justify-center rounded-sm text-black transition-all duration-200 hover:bg-gray-300/60"
            type="button"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCcw size={15} strokeWidth={2.5} />
          </button>

          <button
            onMouseDown={(event) => event.stopPropagation()}
            onClick={handleSnapToCorner}
            className="relative flex h-6 w-8 items-center justify-center rounded-sm text-black transition-all duration-200 hover:bg-gray-300/60"
            type="button"
            title="Snap to bottom right"
            aria-label="Snap to bottom right"
          >
            <ArrowDownRight size={15} strokeWidth={2.5} />
          </button>

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
        </div>
      </WindowHeader>

      <div
        className="relative h-[calc(100%-40px)] flex-1 px-1.5 pb-1.5 backdrop-blur-lg"
        style={{ background: window.color }}
      >
        <iframe
          key={frameKey}
          src={window.url}
          className="h-full w-full rounded-xl bg-white/90"
          title={window.title}
        />
      </div>

      <div
        className={`pointer-events-none absolute right-10 bottom-0 z-100 flex items-end shadow-xl transition-all duration-500 ease-out ${copiedUrl ? "translate-y-[30%] opacity-100" : "translate-y-[120%] opacity-0"}`}
      >
        <div className="relative flex flex-col items-center">
          <div className="-left-12 -rotate-10 relative bottom-3 mb-2 hidden rounded-2xl bg-white/90 px-4 py-2 font-semibold text-black text-sm shadow-lg xl:block">
            copyied url
            <span
              className="-translate-x-1/2 absolute top-full left-1/2 h-3 w-4 bg-white/90 [clip-path:polygon(0_0,100%_0,50%_100%)]"
              aria-hidden="true"
            />
          </div>
          <Image
            width={30}
            height={30}
            src="/lp/astro.avif"
            alt="Astro mascot"
            className={`h-44 w-auto drop-shadow-2xl transition-transform duration-500 ${copiedUrl ? "-translate-y-1" : "translate-y-10"}`}
            draggable={false}
          />
        </div>
      </div>
    </WindowWrapper>
  );
}
