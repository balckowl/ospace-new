import type * as React from "react";
import type { Dispatch, SetStateAction } from "react";
import { useMemo, useRef, useState } from "react";
import type { AppIcon, GridPosition } from "../types";

type UseDesktopDragAndDropOptions = {
  isEdit: boolean;
  apps: AppIcon[];
  appsById: Map<string, AppIcon>;
  appPositions: Map<string, GridPosition>;
  folderContents: Map<string, string[]>;
  getAppAtPosition: (row: number, col: number) => AppIcon | null;
  findNextEmptyPosition: () => GridPosition | null;
  wouldCreateFolderCycle: (
    folderMap: Map<string, string[]>,
    sourceFolderId: string,
    targetFolderId: string,
  ) => boolean;
  setAppPositions: Dispatch<SetStateAction<Map<string, GridPosition>>>;
  setFolderContents: Dispatch<SetStateAction<Map<string, string[]>>>;
  closeFolderWindow: (folderId: string) => void;
};

type UseDesktopDragAndDropResult = {
  draggedApp: string | null;
  draggedAppData: AppIcon | null;
  draggedOver: GridPosition | null;
  draggedOverFolder: string | null;
  canDropIntoFolderWindow: boolean;
  handleDragStart: (event: React.DragEvent, appId: string) => void;
  handleFolderItemDragStart: (
    event: React.DragEvent,
    appId: string,
    folderId: string,
  ) => void;
  handleDragEnd: () => void;
  handleDragOver: (event: React.DragEvent, row: number, col: number) => void;
  handleDragLeave: () => void;
  handleDrop: (
    event: React.DragEvent,
    targetRow: number,
    targetCol: number,
  ) => void;
  handleDropIntoFolderWindow: (targetFolderId: string) => void;
  handleFolderItemReorderDrop: (folderId: string, dropIndex: number) => void;
  handleDropIntoNestedFolder: (
    targetFolderId: string,
    parentFolderId: string,
  ) => void;
};

export function useDesktopDragAndDrop(
  options: UseDesktopDragAndDropOptions,
): UseDesktopDragAndDropResult {
  const {
    isEdit,
    apps,
    appsById,
    appPositions,
    folderContents,
    getAppAtPosition,
    findNextEmptyPosition,
    wouldCreateFolderCycle,
    setAppPositions,
    setFolderContents,
    closeFolderWindow,
  } = options;

  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<GridPosition | null>(null);
  const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(
    null,
  );

  const dragSourceRef = useRef<GridPosition | null>(null);
  const draggedFromFolderRef = useRef(false);
  const dragSourceFolderRef = useRef<string | null>(null);

  const setDragPreview = (
    event: React.DragEvent,
    sourceElement: HTMLElement | null,
  ) => {
    if (!sourceElement || !event.dataTransfer) return;
    const rect = sourceElement.getBoundingClientRect();
    const preview = sourceElement.cloneNode(true) as HTMLElement;
    preview.style.position = "fixed";
    preview.style.top = "-1000px";
    preview.style.left = "-1000px";
    preview.style.width = `${rect.width}px`;
    preview.style.height = `${rect.height}px`;
    preview.style.pointerEvents = "none";
    preview.style.margin = "0";
    preview.style.transform = "none";
    document.body.appendChild(preview);
    const nativeEvent = event.nativeEvent as DragEvent;
    const offsetX = nativeEvent.clientX - rect.left;
    const offsetY = nativeEvent.clientY - rect.top;
    event.dataTransfer.setDragImage(preview, offsetX, offsetY);
    requestAnimationFrame(() => {
      if (preview.parentNode) {
        preview.parentNode.removeChild(preview);
      }
    });
  };

  const handleDragStart = (event: React.DragEvent, appId: string) => {
    if (!isEdit) return;
    setDraggedApp(appId);
    const position = appPositions.get(appId);
    if (position) {
      dragSourceRef.current = position;
    }
    draggedFromFolderRef.current = false;
    dragSourceFolderRef.current = null;
    setDragPreview(event, event.currentTarget as HTMLElement);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleFolderItemDragStart = (
    event: React.DragEvent,
    appId: string,
    folderId: string,
  ) => {
    if (!isEdit) return;
    setDraggedApp(appId);
    dragSourceRef.current = null;
    draggedFromFolderRef.current = true;
    dragSourceFolderRef.current = folderId;
    setDragPreview(event, event.currentTarget as HTMLElement);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedApp(null);
    setDraggedOver(null);
    setDraggedOverFolder(null);
    dragSourceRef.current = null;
    draggedFromFolderRef.current = false;
    dragSourceFolderRef.current = null;
  };

  const resetDragTracking = () => {
    setDraggedOver(null);
    setDraggedOverFolder(null);
    dragSourceRef.current = null;
    draggedFromFolderRef.current = false;
    dragSourceFolderRef.current = null;
  };

  const handleDragOver = (event: React.DragEvent, row: number, col: number) => {
    event.preventDefault();
    setDraggedOver({ row, col });

    const targetApp = getAppAtPosition(row, col);
    if (targetApp && targetApp.type === "folder") {
      setDraggedOverFolder(targetApp.id);
    } else {
      setDraggedOverFolder(null);
    }

    event.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
    setDraggedOverFolder(null);
  };

  const handleDrop = (
    event: React.DragEvent,
    targetRow: number,
    targetCol: number,
  ) => {
    if (!isEdit) return;
    event.preventDefault();

    if (!draggedApp) return;
    const isFromFolder = draggedFromFolderRef.current;
    if (!dragSourceRef.current && !isFromFolder) return;

    const newPositions = new Map(appPositions);
    const targetApp = getAppAtPosition(targetRow, targetCol);
    const draggedAppData = apps.find((app) => app.id === draggedApp);

    const removeAppFromSourceFolder = (map: Map<string, string[]>) => {
      if (!draggedApp) return map;
      const sourceFolderId = dragSourceFolderRef.current;
      if (!sourceFolderId) return map;
      const contents = map.get(sourceFolderId);
      if (!contents) return map;
      map.set(
        sourceFolderId,
        contents.filter((id) => id !== draggedApp),
      );
      return map;
    };

    if (targetApp && targetApp.type === "folder") {
      if (draggedAppData?.type === "stamp") {
        const originPosition = dragSourceRef.current;
        if (!originPosition) {
          setDraggedOver(null);
          setDraggedOverFolder(null);
          return;
        }
        newPositions.set(draggedApp, {
          row: targetRow,
          col: targetCol,
        });
        newPositions.set(targetApp.id, originPosition);
        setAppPositions(newPositions);
      } else {
        if (
          draggedAppData?.type === "folder" &&
          wouldCreateFolderCycle(folderContents, draggedApp, targetApp.id)
        ) {
          setDraggedOver(null);
          setDraggedOverFolder(null);
          return;
        }
        const newFolderContents = removeAppFromSourceFolder(
          new Map(folderContents),
        );
        const currentContents = newFolderContents.get(targetApp.id) || [];
        if (!currentContents.includes(draggedApp)) {
          newFolderContents.set(targetApp.id, [...currentContents, draggedApp]);
        }
        setFolderContents(newFolderContents);
        newPositions.delete(draggedApp);
        setAppPositions(newPositions);
        if (draggedAppData?.type === "folder") {
          closeFolderWindow(draggedApp);
        }
      }
    } else if (targetApp) {
      if (isFromFolder) {
        const emptyPosition = findNextEmptyPosition();
        if (!emptyPosition) {
          setDraggedOver(null);
          setDraggedOverFolder(null);
          dragSourceFolderRef.current = null;
          draggedFromFolderRef.current = false;
          return;
        }
        newPositions.set(draggedApp, {
          row: targetRow,
          col: targetCol,
        });
        newPositions.set(targetApp.id, emptyPosition);
        setAppPositions(newPositions);
        const updatedFolderContents = removeAppFromSourceFolder(
          new Map(folderContents),
        );
        setFolderContents(updatedFolderContents);
      } else {
        const originPosition = dragSourceRef.current;
        if (!originPosition) {
          setDraggedOver(null);
          setDraggedOverFolder(null);
          return;
        }
        newPositions.set(draggedApp, {
          row: targetRow,
          col: targetCol,
        });
        newPositions.set(targetApp.id, originPosition);
        setAppPositions(newPositions);
      }
    } else {
      newPositions.set(draggedApp, {
        row: targetRow,
        col: targetCol,
      });
      setAppPositions(newPositions);
      if (isFromFolder && dragSourceFolderRef.current) {
        const updatedFolderContents = removeAppFromSourceFolder(
          new Map(folderContents),
        );
        setFolderContents(updatedFolderContents);
      }
    }

    setDraggedOver(null);
    setDraggedOverFolder(null);
    dragSourceFolderRef.current = null;
    draggedFromFolderRef.current = false;
  };

  const handleDropIntoFolderWindow = (targetFolderId: string) => {
    if (!isEdit) return;
    if (!draggedApp) {
      resetDragTracking();
      return;
    }

    const draggedAppData = apps.find((app) => app.id === draggedApp);
    if (!draggedAppData || draggedAppData.type === "stamp") {
      resetDragTracking();
      return;
    }
    if (draggedApp === targetFolderId) {
      resetDragTracking();
      return;
    }
    if (
      draggedAppData.type === "folder" &&
      wouldCreateFolderCycle(folderContents, draggedApp, targetFolderId)
    ) {
      resetDragTracking();
      return;
    }

    setFolderContents((prev) => {
      const newContents = new Map(prev);
      const sourceFolderId = dragSourceFolderRef.current;
      if (sourceFolderId) {
        const contents = newContents.get(sourceFolderId);
        if (contents) {
          newContents.set(
            sourceFolderId,
            contents.filter((appId) => appId !== draggedApp),
          );
        }
      } else {
        for (const [folderId, contents] of Array.from(newContents.entries())) {
          if (contents.includes(draggedApp)) {
            newContents.set(
              folderId,
              contents.filter((appId) => appId !== draggedApp),
            );
          }
        }
      }

      const currentContents = newContents.get(targetFolderId) || [];
      if (!currentContents.includes(draggedApp)) {
        newContents.set(targetFolderId, [...currentContents, draggedApp]);
      }

      return newContents;
    });

    setAppPositions((prev) => {
      const newPositions = new Map(prev);
      newPositions.delete(draggedApp);
      return newPositions;
    });

    if (draggedAppData.type === "folder") {
      closeFolderWindow(draggedApp);
    }

    resetDragTracking();
  };

  const handleFolderItemReorderDrop = (folderId: string, dropIndex: number) => {
    if (!isEdit) return;
    if (!draggedApp) {
      resetDragTracking();
      return;
    }

    const draggedAppData = appsById.get(draggedApp);
    if (!draggedAppData || draggedAppData.type === "stamp") {
      resetDragTracking();
      return;
    }
    if (draggedApp === folderId) {
      resetDragTracking();
      return;
    }
    if (
      draggedAppData.type === "folder" &&
      wouldCreateFolderCycle(folderContents, draggedApp, folderId)
    ) {
      resetDragTracking();
      return;
    }

    const sourceFolderId = dragSourceFolderRef.current;

    setFolderContents((prev) => {
      const next = new Map(prev);
      if (sourceFolderId) {
        const sourceContents = [...(next.get(sourceFolderId) ?? [])];
        const idx = sourceContents.indexOf(draggedApp);
        if (idx !== -1) {
          sourceContents.splice(idx, 1);
          next.set(sourceFolderId, sourceContents);
        }
      } else {
        for (const [fid, contents] of Array.from(next.entries())) {
          if (fid === folderId) continue;
          if (contents.includes(draggedApp)) {
            next.set(
              fid,
              contents.filter((id) => id !== draggedApp),
            );
          }
        }
      }

      const targetContents = [...(next.get(folderId) ?? [])];
      const existingIndex = targetContents.indexOf(draggedApp);
      if (existingIndex !== -1) {
        targetContents.splice(existingIndex, 1);
      }

      const insertIndex = Math.max(
        0,
        Math.min(dropIndex, targetContents.length),
      );

      targetContents.splice(insertIndex, 0, draggedApp);
      next.set(folderId, targetContents);

      return next;
    });

    setAppPositions((prev) => {
      if (!prev.has(draggedApp)) return prev;
      const newPositions = new Map(prev);
      newPositions.delete(draggedApp);
      return newPositions;
    });

    if (draggedAppData.type === "folder") {
      closeFolderWindow(draggedApp);
    }

    resetDragTracking();
  };

  const handleDropIntoNestedFolder = (
    targetFolderId: string,
    _parentFolderId: string,
  ) => {
    if (!isEdit) return;
    if (!draggedApp) {
      resetDragTracking();
      return;
    }

    const draggedAppData = appsById.get(draggedApp);
    if (!draggedAppData || draggedAppData.type === "stamp") {
      resetDragTracking();
      return;
    }
    if (draggedApp === targetFolderId) {
      resetDragTracking();
      return;
    }
    if (
      draggedAppData.type === "folder" &&
      wouldCreateFolderCycle(folderContents, draggedApp, targetFolderId)
    ) {
      resetDragTracking();
      return;
    }

    const sourceFolderId = dragSourceFolderRef.current;

    setFolderContents((prev) => {
      const next = new Map(prev);

      if (sourceFolderId) {
        const sourceContents = [...(next.get(sourceFolderId) ?? [])];
        const idx = sourceContents.indexOf(draggedApp);
        if (idx !== -1) {
          sourceContents.splice(idx, 1);
          next.set(sourceFolderId, sourceContents);
        }
      } else {
        for (const [fid, contents] of Array.from(next.entries())) {
          if (contents.includes(draggedApp)) {
            next.set(
              fid,
              contents.filter((id) => id !== draggedApp),
            );
          }
        }
      }

      const targetContents = [...(next.get(targetFolderId) ?? [])];
      if (!targetContents.includes(draggedApp)) {
        targetContents.push(draggedApp);
        next.set(targetFolderId, targetContents);
      }

      return next;
    });

    setAppPositions((prev) => {
      if (!prev.has(draggedApp)) return prev;
      const newPositions = new Map(prev);
      newPositions.delete(draggedApp);
      return newPositions;
    });

    if (draggedAppData.type === "folder") {
      closeFolderWindow(draggedApp);
    }

    resetDragTracking();
  };

  const draggedAppData = useMemo(() => {
    if (!draggedApp) return null;
    return appsById.get(draggedApp) ?? null;
  }, [draggedApp, appsById]);

  const canDropIntoFolderWindow = Boolean(
    isEdit && draggedAppData && draggedAppData.type !== "stamp",
  );

  return {
    draggedApp,
    draggedAppData,
    draggedOver,
    draggedOverFolder,
    canDropIntoFolderWindow,
    handleDragStart,
    handleFolderItemDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDropIntoFolderWindow,
    handleFolderItemReorderDrop,
    handleDropIntoNestedFolder,
  };
}
