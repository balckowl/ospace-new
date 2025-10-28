import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useState,
} from "react";
import type {
  BrowserWindowType,
  FolderWindowType,
  HelpWindowType,
  MemoWindowType,
} from "../types";

interface Props {
  window:
    | BrowserWindowType
    | FolderWindowType
    | HelpWindowType
    | MemoWindowType;
  onBringToFront: () => void;
  children: ReactNode;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
}

export const WindowWrapper = ({
  window,
  onBringToFront,
  children,
  onPositionChange,
  onSizeChange,
}: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const handlePointerDown = (e: ReactPointerEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).classList.contains("window-header")
    ) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - window.position.x,
        y: e.clientY - window.position.y,
      });
      onBringToFront();
    }
  };

  const handleResizePointerDown = (e: ReactPointerEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: window.size.width,
      height: window.size.height,
    });
    onBringToFront();
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        onPositionChange({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      } else if (isResizing) {
        const newWidth = Math.max(
          300,
          resizeStart.width + (e.clientX - resizeStart.x),
        );
        const newHeight = Math.max(
          200,
          resizeStart.height + (e.clientY - resizeStart.y),
        );
        onSizeChange({
          width: newWidth,
          height: newHeight,
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener("pointermove", handlePointerMove);
      document.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    };
  }, [
    isDragging,
    isResizing,
    dragStart,
    resizeStart,
    onPositionChange,
    onSizeChange,
  ]);

  return (
    <div
      className="fixed overflow-hidden rounded-2xl shadow-2xl"
      style={{
        left: window.position.x,
        top: window.position.y,
        width: window.size.width,
        height: window.size.height,
        zIndex: window.zIndex,
        cursor: isDragging ? "grabbing" : "default",
      }}
      onPointerDown={handlePointerDown}
    >
      {children}
      <div
        role="presentation"
        aria-hidden="true"
        className="absolute right-1 bottom-1 h-4 w-4 cursor-se-resize"
        onPointerDown={handleResizePointerDown}
      >
        <div className="absolute right-2 bottom-2 h-2 w-2 rounded-br-sm border-white border-r-2 border-b-2" />
      </div>
    </div>
  );
};
