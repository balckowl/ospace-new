import { FolderIcon, Globe, Sparkle, X } from "lucide-react";
import Image from "next/image";
import type { CSSProperties, DragEvent } from "react";
import { useState } from "react";
import type { FontOption } from "@/db/schema";
import type { AppIcon, FolderWindowType } from "../types";
import WindowHeader from "./WindowHeader";
import { WindowWrapper } from "./WindowWrapper";

const FOLDER_GRID_COLS = 4;
const MIN_VISIBLE_ROWS = 3;

const getAppColorStyles = (
  color: string | undefined,
): {
  className: string;
  style: CSSProperties | undefined;
} => {
  if (!color) {
    return { className: "", style: undefined };
  }

  if (color.startsWith("bg-")) {
    return { className: color, style: undefined };
  }

  return {
    className: "",
    style: { background: color },
  };
};

export function FolderWindow({
  window,
  folderContents,
  apps,
  allFolderContents,
  desktopBackground,
  brightness,
  isEditable,
  canDropExternal,
  currentFont,
  onExternalDrop,
  onClose,
  onBringToFront,
  onAppClick,
  onAppContextMenu,
  onEmptyAreaContextMenu,
  onAppDragStart,
  onAppDragEnd,
  onAppDrop,
  onDropIntoFolder,
  onPositionChange,
  onSizeChange,
  failedFavicons,
  onFaviconError,
  getFontStyle,
}: {
  window: FolderWindowType;
  folderContents: string[];
  apps: AppIcon[];
  allFolderContents: Map<string, string[]>;
  currentFont: FontOption;
  desktopBackground?: string;
  brightness: number;
  isEditable: boolean;
  canDropExternal: boolean;
  onExternalDrop: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onBringToFront: () => void;
  onRemoveApp: (appId: string) => void;
  onAppClick: (app: AppIcon) => void;
  onAppContextMenu: (
    e: React.MouseEvent,
    app: AppIcon,
    folderId: string,
  ) => void;
  onEmptyAreaContextMenu: (e: React.MouseEvent, folderId: string) => void;
  onAppDragStart: (e: React.DragEvent, appId: string, folderId: string) => void;
  onAppDragEnd: () => void;
  onAppDrop: (folderId: string, dropIndex: number) => void;
  onDropIntoFolder: (targetFolderId: string, parentFolderId: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  failedFavicons: Record<string, string | null>;
  onFaviconError: (appId: string, favicon?: string) => void;
  getFontStyle: (newFont: FontOption) => void;
}) {
  const [isExternalDragOver, setIsExternalDragOver] = useState(false);

  const renderAppIcon = (app: AppIcon) => {
    if (app.type === "website" && app.favicon) {
      const failedSrc = failedFavicons[app.id] ?? null;
      const currentSrc = app.favicon ?? null;

      if (failedSrc !== currentSrc) {
        return (
          <div className="relative flex items-center justify-center">
            <Image
              key={`${app.id}-${app.favicon}`}
              src={app.favicon}
              alt={app.name}
              width={30}
              height={30}
              className="pointer-events-none relative z-10 rounded-sm"
              onError={() => onFaviconError(app.id, app.favicon)}
            />
          </div>
        );
      }

      return (
        <Sparkle
          size={30}
          fill="black"
          color="color"
          strokeWidth={0.8}
          className="relative z-10"
        />
      );
    }
    return (
      <app.icon size={30} className="relative z-10 text-black drop-shadow-sm" />
    );
  };

  const folderApps = folderContents
    .map((appId) => apps.find((app) => app.id === appId))
    .filter(Boolean) as AppIcon[];

  const getFolderAppCount = (folderId: string) =>
    allFolderContents.get(folderId)?.length ?? 0;

  const totalCells = Math.max(
    folderApps.length,
    FOLDER_GRID_COLS * MIN_VISIBLE_ROWS,
  );
  const totalRows = Math.ceil(totalCells / FOLDER_GRID_COLS);

  const resolveBackgroundStyle = () => {
    const backgroundValue =
      desktopBackground ?? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

    if (backgroundValue.startsWith("http")) {
      return {
        backgroundImage: `url(${backgroundValue})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      } as const;
    }

    return {
      background: backgroundValue,
    } as const;
  };

  const handleExternalDragEnter = (e: DragEvent<HTMLDivElement>) => {
    if (!isEditable || !canDropExternal) return;
    e.preventDefault();
    setIsExternalDragOver(true);
  };

  const handleExternalDragOver = (e: DragEvent<HTMLDivElement>) => {
    if (!isEditable || !canDropExternal) return;
    e.preventDefault();
  };

  const handleExternalDragLeave = (e: DragEvent<HTMLDivElement>) => {
    if (!isEditable || !canDropExternal) return;
    const related = e.relatedTarget as Node | null;
    if (related && (e.currentTarget as Node).contains(related)) return;
    setIsExternalDragOver(false);
  };

  const handleExternalDropInternal = (e: DragEvent<HTMLDivElement>) => {
    if (!isEditable || !canDropExternal) return;
    e.preventDefault();
    setIsExternalDragOver(false);
    onExternalDrop();
  };

  return (
    <WindowWrapper
      window={window}
      onBringToFront={onBringToFront}
      onSizeChange={onSizeChange}
      onPositionChange={onPositionChange}
    >
      <WindowHeader
        currentFont={currentFont}
        title={window.title}
        getFontStyle={getFontStyle}
        accentColor={window.color}
      >
        {/* クローズ */}
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

      {/* Folder Content */}
      <div className="h-[calc(100%-40px)] flex-1 overflow-auto bg-white/90 px-1.5 pb-1.5 backdrop-blur-lg">
        <div
          className={`relative h-full rounded-xl py-4 transition ${
            isExternalDragOver ? "ring-2 ring-white/70" : ""
          }`}
          style={resolveBackgroundStyle()}
          onDragEnter={handleExternalDragEnter}
          onDragOver={handleExternalDragOver}
          onDragLeave={handleExternalDragLeave}
          onDrop={handleExternalDropInternal}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-xl"
            style={{ backgroundColor: `rgba(0, 0, 0, ${brightness})` }}
            aria-hidden="true"
          />
          {folderApps.length === 0 ? (
            <div
              className="flex h-full items-center justify-center text-center"
              onContextMenu={(e) => onEmptyAreaContextMenu(e, window.id)}
            >
              <div>
                <FolderIcon size={48} className="mx-auto mb-4 text-white" />
                <p className="text-white">This folder is empty.</p>
                {isEditable && (
                  <p className="text-sm text-white">
                    Drag apps here to organize them.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div
              className="grid gap-0"
              onContextMenu={(e) => {
                if (e.target === e.currentTarget) {
                  onEmptyAreaContextMenu(e, window.id);
                }
              }}
              style={{
                gridTemplateColumns: `repeat(${FOLDER_GRID_COLS}, minmax(0, 1fr))`,
                gridAutoRows: "minmax(110px, 1fr)",
              }}
            >
              {Array.from({ length: totalRows * FOLDER_GRID_COLS }).map(
                (_, index) => {
                  const app = folderApps[index];
                  const cellKey = app
                    ? `folder-cell-${app.id}`
                    : `folder-cell-empty-${index}`;

                  return (
                    <div
                      key={cellKey}
                      className="group relative flex flex-col items-center justify-center"
                      onDragOver={(e) => {
                        if (!isEditable || !canDropExternal) return;
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        if (!isEditable || !canDropExternal) return;
                        e.preventDefault();
                        e.stopPropagation();
                        onAppDrop(window.id, index);
                      }}
                      onContextMenu={(e) => {
                        if (app) {
                          onAppContextMenu(e, app, window.id);
                        } else {
                          onEmptyAreaContextMenu(e, window.id);
                        }
                      }}
                    >
                      {app && (
                        <div
                          className="group flex cursor-pointer flex-col items-center"
                          draggable={isEditable}
                          onDragStart={(e) =>
                            onAppDragStart(e, app.id, window.id)
                          }
                          onDragEnd={onAppDragEnd}
                          onClick={() => onAppClick(app)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onAppClick(app);
                            }
                          }}
                        >
                          <div className="relative mb-1.5">
                            {(() => {
                              const { className, style } = getAppColorStyles(
                                app.color,
                              );
                              return (
                                <div
                                  className={`relative flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg ${className}`}
                                  style={style}
                                  onDragOver={(e) => {
                                    if (
                                      !isEditable ||
                                      !canDropExternal ||
                                      app.type !== "folder"
                                    )
                                      return;
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onDrop={(e) => {
                                    if (
                                      !isEditable ||
                                      !canDropExternal ||
                                      app.type !== "folder"
                                    )
                                      return;
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onDropIntoFolder(app.id, window.id);
                                  }}
                                >
                                  {renderAppIcon(app)}
                                  {app.type === "website" && app.favicon && (
                                    <Globe
                                      size={30}
                                      className="hidden text-black drop-shadow-sm"
                                    />
                                  )}
                                  {app.type === "folder" &&
                                    getFolderAppCount(app.id) > 0 && (
                                      <div className="-top-1.5 -right-1.5 absolute z-10 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-bold text-white text-xs">
                                        {getFolderAppCount(app.id)}
                                      </div>
                                    )}
                                  <div className="-z-10 absolute inset-0 rounded-2xl bg-white/80" />
                                </div>
                              );
                            })()}
                          </div>
                          <div
                            className={`${getFontStyle(currentFont)} mt-1 w-full px-2 text-center font-medium text-white text-xs`}
                          >
                            {app.name}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          )}
        </div>
      </div>
    </WindowWrapper>
  );
}
