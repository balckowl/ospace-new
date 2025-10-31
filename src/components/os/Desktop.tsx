"use client";

import {
  CircleAlert,
  FileText,
  FolderIcon,
  FolderOpen,
  Globe,
  type LucideIcon,
  Megaphone,
  Sparkle,
  StickyNote,
} from "lucide-react";
import {
  Alegreya,
  Allan,
  Comfortaa,
  Inter,
  Lobster,
  Lora,
} from "next/font/google";
import Image from "next/image";
import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Toaster, toast } from "sonner";
import { authedHono } from "@/lib/hono-client";
import { cn } from "@/lib/utils";
import type {
  BackgroundOptionType,
  DesktopStateType,
  FolderAppType,
  FontOptionType,
  MemoAppType,
  WebsiteAppType,
} from "@/server/schemas/desktop.schema";
import type {
  AppIcon,
  AppUrlDialog,
  BrowserWindowType,
  ContextMenuType,
  CurrentUserType,
  EditDialog,
  FolderNameDialog,
  FolderWindowType,
  GridPosition,
  HelpWindowType,
  MemoNameDialog,
  MemoWindowType,
  SelectStampDialog,
} from "../os/types";
import { Button } from "../ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { backgroundOptions } from "./BackgroundImage";
import { ContextMenu } from "./ContextMenu";
import { DraggableMenu } from "./DraggableMenu";
import CreateAppDialog from "./dialog/CreateAppDialog";
import DefaultDialog, { DEFAULT_DIALOG_COLORS } from "./dialog/DefaultDialog";
import EditStampDialog from "./dialog/EditStampDialog";
import StampDialog, { stampOptions } from "./dialog/SelectStampDialog";
import { checkUrlExists } from "./functions/checkUrlExist";
import { lightDegreeLocalStore } from "./functions/lightDegreeLocalStorage";
import { UserIcon } from "./UserIcon";
import { BrowserWindow } from "./window/BrowserWindow";
import { FolderWindow } from "./window/FolderWindow";
import { HelpWindow } from "./window/HelpWindow";
import { MemoWindow } from "./window/MemoWindow";

type DesktopWithoutDates = Omit<DesktopStateType, "createdAt" | "updatedAt">;

type Props = {
  desktopById: DesktopWithoutDates;
  osName: string;
  onDesktopUpdate?: (
    desktopId: string,
    patch: Partial<DesktopWithoutDates>,
  ) => void;
  isEdit: boolean;
  currentUser: CurrentUserType;
  isPanelPinned?: boolean;
};

const inter = Inter({ subsets: ["latin"] });
const alegreya = Alegreya({ subsets: ["latin"] });
const lobster = Lobster({ subsets: ["latin"], weight: "400" });
const allan = Allan({ subsets: ["latin"], weight: "400" });
const lora = Lora({ subsets: ["latin"] });
const comfortea = Comfortaa({ subsets: ["latin"] });

const GRID_COLS = 6;
const GRID_ROWS = 8;
const PINNED_PANEL_WIDTH = 220;
const PINNED_DESKTOP_PADDING = 12;
const FRAME_OVERLAY_Z_INDEX = 2147483646;
const DESKTOP_FRAME_RADIUS = "1rem";
const FRAME_OVERLAY_COLOR = "var(--background, #fff)";

type DesktopApp = DesktopStateType["state"]["appItems"][number];

const ICON_COMPONENTS: Record<DesktopApp["iconKey"], LucideIcon> = {
  StickyNote,
  Globe,
  FolderIcon,
};

const mapDesktopAppToAppIcon = (app: DesktopApp): AppIcon => {
  switch (app.type) {
    case "website":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        name: app.name,
        type: "website",
        url: app.url,
        favicon: app.favicon,
      };
    case "memo":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        name: app.name,
        type: "memo",
        content: app.content,
      };
    case "folder":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        name: app.name,
        type: "folder",
      };
    case "stamp":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "stamp",
        stampType: app.stampType,
        stampText: app.stampText,
      };
    default: {
      const _exhaustiveCheck: never = app;
      throw new Error(`Unhandled app type: ${_exhaustiveCheck}`);
    }
  }
};

const mapAppIconToDesktopApp = (app: AppIcon): DesktopApp => {
  switch (app.type) {
    case "website":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "website",
        name: app.name,
        url: app.url ?? "",
        favicon: app.favicon ?? "",
      };
    case "memo":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "memo",
        name: app.name,
        content: app.content ?? "",
      };
    case "folder":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "folder",
        name: app.name,
      };
    case "stamp":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "stamp",
        stampType: app.stampType,
        stampText: app.stampText ?? "",
      };
    default: {
      const _exhaustiveCheck: never = app;
      throw new Error(`Unhandled app type: ${_exhaustiveCheck}`);
    }
  }
};

const cloneApps = (appsToClone: AppIcon[]) =>
  appsToClone.map((app) => ({ ...app }));

const cloneAppPositions = (positions: Map<string, GridPosition>) =>
  new Map<string, GridPosition>(
    Array.from(positions.entries(), ([key, value]) => [key, { ...value }]),
  );

const createFolderContentsMap = (data: Record<string, string[]>) =>
  new Map<string, string[]>(
    Object.entries(data).map(([key, value]) => [key, [...value]]),
  );

const resolveAppColorStyles = (
  color: string,
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

const cloneFolderContents = (contents: Map<string, string[]>) =>
  new Map<string, string[]>(
    Array.from(contents.entries(), ([key, value]) => [key, [...value]]),
  );

const mapEntriesToJson = (contents: Map<string, string[]>) =>
  JSON.stringify(
    Array.from(contents.entries(), ([key, value]) => [key, [...value]]),
  );

export default function MacosDesktop({
  desktopById,
  osName,
  onDesktopUpdate,
  isEdit,
  currentUser,
  isPanelPinned = false,
}: Props) {
  const backgroundImg = useMemo(() => {
    return backgroundOptions.find((opt) => opt.name === desktopById.background);
  }, [desktopById]);
  const [apps, setApps] = useState<AppIcon[]>([]);
  const [appPositions, setAppPositions] = useState<Map<string, GridPosition>>(
    new Map(),
  );
  const [draggedApp, setDraggedApp] = useState<string | null>(null);
  const [draggedOver, setDraggedOver] = useState<GridPosition | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuType>({
    visible: false,
    x: 0,
    y: 0,
    position: null,
    existingApp: null,
    folderId: null,
  });
  const [memoWindows, setMemoWindows] = useState<MemoWindowType[]>([]);
  const [browserWindows, setBrowserWindows] = useState<BrowserWindowType[]>([]);
  const [folderWindows, setFolderWindows] = useState<FolderWindowType[]>([]);
  const openFolderIds = useMemo(
    () =>
      new Set(
        folderWindows
          .filter((window) => !window.isMinimized)
          .map((window) => window.id),
      ),
    [folderWindows],
  );
  const panelOffsetRight = isPanelPinned ? PINNED_PANEL_WIDTH : 0;
  const framePadding = isPanelPinned ? PINNED_DESKTOP_PADDING : 0;
  const pinnedPaddingStyle: CSSProperties | undefined = framePadding
    ? { padding: framePadding }
    : undefined;
  const frameOverlayStyle = useMemo<CSSProperties | undefined>(() => {
    if (framePadding <= 0) return undefined;
    return {
      borderRadius: DESKTOP_FRAME_RADIUS,
      boxShadow: `inset 0 0 0 ${framePadding}px ${FRAME_OVERLAY_COLOR}`,
      zIndex: FRAME_OVERLAY_Z_INDEX,
      pointerEvents: "none",
    };
  }, [framePadding]);

  const frameCornerStyles = useMemo<
    Array<{ key: string; style: CSSProperties }>
  >(() => {
    if (framePadding <= 0) return [];

    const size = framePadding;
    const base: CSSProperties = {
      position: "absolute",
      width: 0,
      height: 0,
      zIndex: FRAME_OVERLAY_Z_INDEX + 1,
      pointerEvents: "none",
    };

    return [
      {
        key: "top-left",
        style: {
          ...base,
          top: 0,
          left: 0,
          borderTop: `${size}px solid ${FRAME_OVERLAY_COLOR}`,
          borderRight: `${size}px solid transparent`,
        },
      },
      {
        key: "top-right",
        style: {
          ...base,
          top: 0,
          right: 0,
          borderTop: `${size}px solid ${FRAME_OVERLAY_COLOR}`,
          borderLeft: `${size}px solid transparent`,
        },
      },
      {
        key: "bottom-left",
        style: {
          ...base,
          bottom: 0,
          left: 0,
          borderBottom: `${size}px solid ${FRAME_OVERLAY_COLOR}`,
          borderRight: `${size}px solid transparent`,
        },
      },
      {
        key: "bottom-right",
        style: {
          ...base,
          bottom: 0,
          right: 0,
          borderBottom: `${size}px solid ${FRAME_OVERLAY_COLOR}`,
          borderLeft: `${size}px solid transparent`,
        },
      },
    ];
  }, [framePadding]);
  const [nextzIndex, setNextzIndex] = useState(1000);
  const [_memoCounter, setMemoCounter] = useState(2);
  const [_folderCounter, setFolderCounter] = useState(1);
  const [positionsInitialized, setPositionsInitialized] = useState(false);
  const [memoNameDialog, setMemoNameDialog] = useState<MemoNameDialog>({
    visible: false,
    position: null,
    folderId: null,
  });
  const [appUrlDialog, setAppUrlDialog] = useState<AppUrlDialog>({
    visible: false,
    position: null,
    folderId: null,
  });
  const [folderNameDialog, setFolderNameDialog] = useState<FolderNameDialog>({
    visible: false,
    position: null,
    folderId: null,
  });
  const [selectStampDialog, setSelectStampDialog] = useState<SelectStampDialog>(
    {
      visible: false,
      position: null,
    },
  );
  const [editDialog, setEditDialog] = useState<EditDialog>({
    visible: false,
    app: null,
    newName: "",
    newUrl: "",
    newContent: "",
    newColor: "",
  });
  const defaultDialogColor = DEFAULT_DIALOG_COLORS[0] ?? "#FEE2E2";
  const [memoColor, setMemoColor] = useState(defaultDialogColor);
  const [appColor, setAppColor] = useState(defaultDialogColor);
  const [folderColor, setFolderColor] = useState(defaultDialogColor);
  const changeNameEditDialog = (value: string) =>
    setEditDialog((prev) => ({
      ...prev,
      newName: value,
    }));

  const changeContentEditDialog = (value: string) =>
    setEditDialog((prev) => ({
      ...prev,
      newContent: value,
    }));

  const changeColorEditDialog = (value: string) =>
    setEditDialog((prev) => ({
      ...prev,
      newColor: value,
    }));

  const [memoNameInput, setMemoNameInput] = useState("");
  //memoNameInputを更新関数
  const changeMemoNameInput = (value: string) => setMemoNameInput(value);
  const [appUrlInput, setAppUrlInput] = useState("");
  //appUrlInputを更新関数
  const changeAppUrlInput = (value: string) => setAppUrlInput(value);
  const [folderNameInput, setFolderNameInput] = useState("");
  //folderNameInputを更新関数
  const changeFolderNameInput = (value: string) => setFolderNameInput(value);
  const [isLoadingApp, setIsLoadingApp] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [background, setBackground] = useState(backgroundImg?.value);
  const [brightness, setBrightness] = useState(
    lightDegreeLocalStore.defaultValue,
  );
  const [font, setFont] = useState<FontOptionType>(desktopById.font);
  const [folderContents, setFolderContents] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [originalFolderContents, setOriginalFolderContents] = useState<
    Map<string, string[]>
  >(new Map());
  const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(
    null,
  );
  const [failedFavicons, setFailedFavicons] = useState<
    Record<string, string | null>
  >({});

  // help window
  const [helpWindow, setHelpWindow] = useState<HelpWindowType>({
    visible: false,
    content: "welcome",
    position: { x: 150, y: 150 },
    size: { width: 650, height: 450 },
    isMinimized: false,
    zIndex: nextzIndex + 1000,
  });

  //差分検知用の初期値
  const [originalApps, setOriginalApps] = useState<AppIcon[]>([]);
  const [originalAppPositions, setOriginalAppPositions] = useState<
    Map<string, GridPosition>
  >(new Map());

  // public or private
  const [isPublic, setIsPublic] = useState(false);
  const handleSetIsPublic = (value: boolean) => {
    setIsPublic(value);
    onDesktopUpdate?.(desktopById.id, { isPublic: value });
  };

  const [currentUserInfo, setCurrentUserInfo] = useState<CurrentUserType>(null);

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
    lightDegreeLocalStore.set(value);
  };

  useEffect(() => {
    const storedBrightness = lightDegreeLocalStore.get();
    setBrightness(storedBrightness);
  }, []);

  const dragSourceRef = useRef<GridPosition | null>(null);
  const draggedFromFolderRef = useRef(false);
  const dragSourceFolderRef = useRef<string | null>(null);
  const appsById = useMemo(
    () => new Map(apps.map((app) => [app.id, app])),
    [apps],
  );

  useEffect(() => {
    setFailedFavicons((prev) => {
      let updated = false;
      const next = { ...prev };

      for (const appId of Object.keys(next)) {
        const currentApp = apps.find((app) => app.id === appId);
        if (!currentApp) {
          delete next[appId];
          updated = true;
          continue;
        }

        const currentFavicon =
          currentApp.type === "website" ? (currentApp.favicon ?? null) : null;
        if (currentFavicon !== next[appId]) {
          delete next[appId];
          updated = true;
        }
      }

      return updated ? next : prev;
    });
  }, [apps]);

  const isFolderDescendant = (
    folderMap: Map<string, string[]>,
    ancestorId: string,
    candidateId: string,
  ) => {
    const visited = new Set<string>();
    const queue = [...(folderMap.get(ancestorId) ?? [])];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || visited.has(currentId)) continue;
      if (currentId === candidateId) return true;
      visited.add(currentId);
      const childApp = appsById.get(currentId);
      if (childApp?.type === "folder") {
        const children = folderMap.get(currentId);
        if (children) {
          queue.push(...children);
        }
      }
    }

    return false;
  };

  const wouldCreateFolderCycle = (
    folderMap: Map<string, string[]>,
    sourceFolderId: string,
    targetFolderId: string,
  ) => {
    if (sourceFolderId === targetFolderId) return true;
    return isFolderDescendant(folderMap, sourceFolderId, targetFolderId);
  };

  const collectFolderDescendantIds = (
    folderId: string,
    folderMap: Map<string, string[]>,
  ) => {
    const descendants = new Set<string>();
    const queue = [...(folderMap.get(folderId) ?? [])];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId || descendants.has(currentId)) continue;
      descendants.add(currentId);
      const app = appsById.get(currentId);
      if (app?.type === "folder") {
        const children = folderMap.get(currentId);
        if (children) {
          queue.push(...children);
        }
      }
    }

    return descendants;
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!positionsInitialized && apps.length === 0) {
      const positionsMap = new Map<string, { row: number; col: number }>(
        Object.entries(desktopById.state.appPositions),
      );
      const responseApps = desktopById.state.appItems.map(
        mapDesktopAppToAppIcon,
      );
      setAppPositions(positionsMap);
      setOriginalAppPositions(cloneAppPositions(positionsMap));
      setApps(responseApps);
      setOriginalApps(cloneApps(responseApps));

      const fcMap = createFolderContentsMap(desktopById.state.folderContents);
      setFolderContents(fcMap);
      setOriginalFolderContents(cloneFolderContents(fcMap));

      setPositionsInitialized(true);
      setIsPublic(desktopById.isPublic);

      if (desktopById.background) {
        const backgroundImg = backgroundOptions.find(
          (opt) => opt.name === desktopById.background,
        );
        if (!backgroundImg) return;
        setBackground(backgroundImg.value);
      }

      if (desktopById.font) {
        setFont(desktopById.font);
      }

      setCurrentUserInfo({
        name: currentUser?.name || null,
        osName: currentUser?.osName || null,
        icon: currentUser?.icon || null,
      });
    }
  }, [desktopById, apps.length, positionsInitialized, currentUser]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      // Don't close if clicking inside the dialog or context menu
      const target = e.target as HTMLElement;
      if (
        target.closest(".memo-dialog") ||
        target.closest(".app-dialog") ||
        target.closest(".folder-dialog") ||
        target.closest(".edit-dialog") ||
        target.closest(".context-menu") ||
        target.closest(".stamp-dialog") ||
        target.closest(".edit-stamp-dialog")
      ) {
        return;
      }

      setContextMenu({
        visible: false,
        x: 0,
        y: 0,
        position: null,
        existingApp: null,
        folderId: null,
      });
      setMemoNameDialog({
        visible: false,
        position: null,
        folderId: null,
      });
      setAppUrlDialog({
        visible: false,
        position: null,
        folderId: null,
      });
      setFolderNameDialog({
        visible: false,
        position: null,
        folderId: null,
      });
      setSelectStampDialog({
        visible: false,
        position: null,
      });
      setEditDialog({
        visible: false,
        app: null,
        newName: "",
        newUrl: "",
        newContent: "",
        newColor: "",
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const getAppAtPosition = (row: number, col: number): AppIcon | null => {
    for (const [appId, position] of appPositions.entries()) {
      if (position.row === row && position.col === col) {
        return apps.find((app) => app.id === appId) || null;
      }
    }
    return null;
  };

  const markFaviconAsFailed = (appId: string, favicon: string | undefined) => {
    setFailedFavicons((prev) => {
      const failedSrc = favicon ?? null;
      if (prev[appId] === failedSrc) {
        return prev;
      }

      return {
        ...prev,
        [appId]: failedSrc,
      };
    });
  };

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

  const handleDragStart = (e: React.DragEvent, appId: string) => {
    if (!isEdit) return;
    setDraggedApp(appId);
    const position = appPositions.get(appId);
    if (position) {
      dragSourceRef.current = position;
    }
    draggedFromFolderRef.current = false;
    dragSourceFolderRef.current = null;
    setDragPreview(e, e.currentTarget as HTMLElement);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFolderItemDragStart = (
    e: React.DragEvent,
    appId: string,
    folderId: string,
  ) => {
    if (!isEdit) return;
    setDraggedApp(appId);
    dragSourceRef.current = null;
    draggedFromFolderRef.current = true;
    dragSourceFolderRef.current = folderId;
    setDragPreview(e, e.currentTarget as HTMLElement);
    e.dataTransfer.effectAllowed = "move";
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

  const handleDragOver = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    setDraggedOver({ row, col });

    // Check if we're dragging over a folder
    const targetApp = getAppAtPosition(row, col);
    if (targetApp && targetApp.type === "folder") {
      setDraggedOverFolder(targetApp.id);
    } else {
      setDraggedOverFolder(null);
    }

    e.dataTransfer.dropEffect = "move";
  };

  const handleDragLeave = () => {
    setDraggedOver(null);
    setDraggedOverFolder(null);
  };
  const handleDrop = (
    e: React.DragEvent,
    targetRow: number,
    targetCol: number,
  ) => {
    if (!isEdit) return;
    e.preventDefault();

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
          setFolderWindows((prev) => prev.filter((w) => w.id !== draggedApp));
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
      setFolderWindows((prev) => prev.filter((w) => w.id !== draggedApp));
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
      setFolderWindows((prev) => prev.filter((w) => w.id !== draggedApp));
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
      setFolderWindows((prev) => prev.filter((w) => w.id !== draggedApp));
    }

    resetDragTracking();
  };

  const handleRightClick = (e: React.MouseEvent, row: number, col: number) => {
    if (isEdit === false) return;
    e.preventDefault();
    e.stopPropagation();
    const existingApp = getAppAtPosition(row, col);

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      position: { row, col },
      existingApp,
      folderId: null,
    });
  };

  const handleFolderAppContextMenu = (
    e: React.MouseEvent,
    app: AppIcon,
    folderId: string,
  ) => {
    if (isEdit === false) return;
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      position: null,
      existingApp: app,
      folderId,
    });
  };

  const handleFolderEmptyAreaContextMenu = (
    e: React.MouseEvent,
    folderId: string,
  ) => {
    if (isEdit === false) return;
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      position: null,
      existingApp: null,
      folderId,
    });
  };

  const showMemoNameDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setMemoNameDialog({
      visible: true,
      position: contextMenu.position,
      folderId: contextMenu.folderId ?? null,
    });
    setMemoNameInput("Notes");
    setMemoColor(defaultDialogColor);
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      position: null,
      folderId: null,
      existingApp: null,
    });
  };

  const showAppUrlDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setAppUrlDialog({
      visible: true,
      position: contextMenu.position,
      folderId: contextMenu.folderId ?? null,
    });
    setAppColor(defaultDialogColor);
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      position: null,
      folderId: null,
      existingApp: null,
    });
  };

  const showFolderNameDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setFolderNameDialog({
      visible: true,
      position: contextMenu.position,
      folderId: contextMenu.folderId ?? null,
    });
    setFolderNameInput("Folder");
    setFolderColor(defaultDialogColor);
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      position: null,
      folderId: null,
      existingApp: null,
    });
  };

  const showSelectStampDialog = (e: React.MouseEvent) => {
    if (contextMenu.folderId) return;
    e.preventDefault();
    e.stopPropagation();

    setSelectStampDialog({
      visible: true,
      position: contextMenu.position,
    });
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      position: null,
      folderId: null,
      existingApp: null,
    });
  };

  const showEditDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!contextMenu.existingApp) return;

    const appToEdit = contextMenu.existingApp;

    if (!appToEdit) return;

    switch (appToEdit.type) {
      case "website":
        setEditDialog({
          visible: true,
          app: appToEdit,
          newName: appToEdit.name,
          newUrl: appToEdit.url || "",
          newContent: "",
          newColor: appToEdit.color,
        });
        break;
      case "memo":
        setEditDialog({
          visible: true,
          app: appToEdit,
          newName: appToEdit.name,
          newUrl: "",
          newContent: appToEdit.content,
          newColor: appToEdit.color,
        });
        break;
      case "folder":
        setEditDialog({
          visible: true,
          app: appToEdit,
          newName: appToEdit.name,
          newUrl: "",
          newContent: "",
          newColor: appToEdit.color,
        });
        break;
      case "stamp":
        setEditDialog({
          visible: true,
          app: appToEdit,
          newName: "",
          newUrl: "",
          newContent: appToEdit.stampText || "",
          newColor: appToEdit.color,
        });
        break;
      default: {
        const _exhaustiveCheck: never = appToEdit;
        throw new Error(`Unhandled app type: ${_exhaustiveCheck}`);
      }
    }
    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      position: null,
      existingApp: null,
      folderId: null,
    });
  };

  const deleteApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!contextMenu.existingApp) return;

    const appToDelete = contextMenu.existingApp;

    const idsToRemove = new Set<string>([appToDelete.id]);

    if (appToDelete.type === "folder") {
      const descendants = collectFolderDescendantIds(
        appToDelete.id,
        folderContents,
      );
      for (const id of descendants) {
        idsToRemove.add(id);
      }
    }

    setApps((prev) => prev.filter((app) => !idsToRemove.has(app.id)));

    setAppPositions((prev) => {
      const newPositions = new Map(prev);
      for (const id of idsToRemove) {
        newPositions.delete(id);
      }
      return newPositions;
    });

    setFolderContents((prev) => {
      const newContents = new Map(prev);
      for (const id of idsToRemove) {
        newContents.delete(id);
      }
      for (const [folderId, contents] of Array.from(newContents.entries())) {
        const filteredContents = contents.filter((id) => !idsToRemove.has(id));
        if (filteredContents.length !== contents.length) {
          newContents.set(folderId, filteredContents);
        }
      }
      return newContents;
    });

    setMemoWindows((prev) => prev.filter((w) => !idsToRemove.has(w.id)));
    setBrowserWindows((prev) => prev.filter((w) => !idsToRemove.has(w.id)));
    setFolderWindows((prev) => prev.filter((w) => !idsToRemove.has(w.id)));

    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      position: null,
      existingApp: null,
      folderId: null,
    });
  };

  const removeAppFromFolderViaContext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!contextMenu.folderId || !contextMenu.existingApp) return;

    removeFromFolder(contextMenu.folderId, contextMenu.existingApp.id);

    setContextMenu({
      visible: false,
      x: 0,
      y: 0,
      position: null,
      existingApp: null,
      folderId: null,
    });
  };

  const saveEdit = () => {
    if (!editDialog.app || !editDialog.newName.trim()) return;

    // Update the app
    setApps((prev) =>
      prev.map((app) =>
        app.id === editDialog.app?.id
          ? {
              ...app,
              name: editDialog.newName.trim(),
              color: editDialog.newColor || app.color,
              ...(app.type === "website" && editDialog.newUrl
                ? {
                    url: editDialog.newUrl,
                  }
                : {}),
              ...(app.type === "stamp" && editDialog.newContent !== undefined
                ? {
                    stampContent: editDialog.newContent,
                  }
                : {}),
            }
          : app,
      ),
    );

    // Update any open windows
    if (editDialog.app.type === "memo") {
      setMemoWindows((prev) =>
        prev.map((w) =>
          w.id === editDialog.app?.id
            ? {
                ...w,
                title: editDialog.newName.trim(),
                color: editDialog.newColor || editDialog.app?.color || w.color,
              }
            : w,
        ),
      );
    } else if (editDialog.app.type === "website") {
      setBrowserWindows((prev) =>
        prev.map((w) =>
          w.id === editDialog.app?.id
            ? {
                ...w,
                title: editDialog.newName.trim(),
                color: editDialog.newColor || editDialog.app?.color || w.color,
                ...(editDialog.newUrl
                  ? {
                      url: editDialog.newUrl,
                    }
                  : {}),
              }
            : w,
        ),
      );
    } else if (editDialog.app.type === "folder") {
      setFolderWindows((prev) =>
        prev.map((w) =>
          w.id === editDialog.app?.id
            ? {
                ...w,
                title: editDialog.newName.trim(),
                color: editDialog.newColor || editDialog.app?.color || w.color,
              }
            : w,
        ),
      );
    }

    setEditDialog({
      visible: false,
      app: null,
      newName: "",
      newUrl: "",
      newContent: "",
      newColor: "",
    });
  };

  const cancelEdit = () => {
    setEditDialog({
      visible: false,
      app: null,
      newName: "",
      newUrl: "",
      newContent: "",
      newColor: "",
    });
  };

  const findNextEmptyPosition = (): GridPosition | null => {
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        if (!getAppAtPosition(row, col)) {
          return { row, col };
        }
      }
    }
    return null;
  };

  const createMemoWithName = () => {
    if (!memoNameInput.trim()) return;
    const targetFolderId = memoNameDialog.folderId;
    if (!targetFolderId && !memoNameDialog.position) return;

    const memoId = `memo-${Date.now()}`;
    const memoApp: AppIcon = {
      id: memoId,
      name: memoNameInput.trim(),
      iconKey: "StickyNote",
      color: memoColor,
      type: "memo",
      content: "",
    };

    setApps((prev) => [...prev, memoApp]);

    if (targetFolderId) {
      setFolderContents((prev) => {
        const newContents = new Map(prev);
        const current = newContents.get(targetFolderId) ?? [];
        newContents.set(targetFolderId, [...current, memoId]);
        return newContents;
      });
    } else {
      setAppPositions((prev) => {
        const newPositions = new Map(prev);
        if (memoNameDialog.position) {
          newPositions.set(memoId, memoNameDialog.position);
        }
        return newPositions;
      });
    }

    setMemoCounter((prev) => prev + 1);
    setMemoNameDialog({ visible: false, position: null, folderId: null });
    setMemoNameInput("");
    setMemoColor(defaultDialogColor);
  };

  const createAppWithUrl = async () => {
    if (!appUrlInput.trim()) return;
    const targetFolderId = appUrlDialog.folderId;
    const targetPosition = appUrlDialog.position;
    if (!targetFolderId && !targetPosition) return;

    const placeApp = (appId: string) => {
      if (targetFolderId) {
        setFolderContents((prev) => {
          const newContents = new Map(prev);
          const current = newContents.get(targetFolderId) ?? [];
          newContents.set(targetFolderId, [...current, appId]);
          return newContents;
        });
      } else {
        setAppPositions((prev) => {
          const newPositions = new Map(prev);
          if (targetPosition) {
            newPositions.set(appId, targetPosition);
          }
          return newPositions;
        });
      }
    };

    setIsLoadingApp(true);

    try {
      let url = appUrlInput.trim();
      if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
      }

      let siteName = "";
      let favicon = "";

      try {
        favicon = `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=64`;
        siteName = new URL(url).hostname.replace("www.", "");
        const isUrlExist = await checkUrlExists(url);
        if (!isUrlExist) {
          favicon = "";
        }
      } catch (error) {
        console.error("Error fetching site metadata:", error);
        favicon = "";
        siteName = new URL(url).hostname.replace("www.", "");
      }

      if (!siteName) {
        siteName = new URL(url).hostname;
      }

      const appId = `app-${Date.now()}`;
      const newApp: AppIcon = {
        id: appId,
        name: siteName,
        iconKey: "Globe",
        color: "#FFEB3B",
        type: "website",
        url: url,
        favicon,
      };

      setApps((prev) => [...prev, newApp]);
      placeApp(appId);
    } catch (error) {
      console.error("Error creating app:", error);
      const appId = `app-${Date.now()}`;
      const newApp: AppIcon = {
        id: appId,
        name: appUrlInput.trim(),
        iconKey: "Globe",
        color: appColor,
        type: "website",
        url: appUrlInput.startsWith("http")
          ? appUrlInput
          : `https://${appUrlInput}`,
        favicon: "",
      };

      setApps((prev) => [...prev, newApp]);
      placeApp(appId);
    } finally {
      setAppUrlDialog({ visible: false, position: null, folderId: null });
      setAppUrlInput("");
      setIsLoadingApp(false);
      setAppColor(defaultDialogColor);
    }
  };

  const createFolderWithName = () => {
    if (!folderNameInput.trim()) return;
    const targetFolderId = folderNameDialog.folderId;
    const targetPosition = folderNameDialog.position;
    if (!targetFolderId && !targetPosition) return;

    const folderId = `folder-${Date.now()}`;
    const folderApp: AppIcon = {
      id: folderId,
      name: folderNameInput.trim(),
      iconKey: "FolderIcon",
      color: folderColor,
      type: "folder",
    };

    setApps((prev) => [...prev, folderApp]);

    if (targetFolderId) {
      setFolderContents((prev) => {
        const newContents = new Map(prev);
        const parentContents = newContents.get(targetFolderId) ?? [];
        newContents.set(targetFolderId, [...parentContents, folderId]);
        newContents.set(folderId, []);
        return newContents;
      });
    } else {
      setAppPositions((prev) => {
        const newPositions = new Map(prev);
        if (targetPosition) {
          newPositions.set(folderId, targetPosition);
        }
        return newPositions;
      });
      setFolderContents((prev) => {
        const newContents = new Map(prev);
        newContents.set(folderId, []);
        return newContents;
      });
    }

    setFolderCounter((prev) => prev + 1);
    setFolderNameDialog({ visible: false, position: null, folderId: null });
    setFolderNameInput("");
    setFolderColor(defaultDialogColor);
  };

  const onSelectStamp = (stampName: string) => {
    if (!selectStampDialog.position) return;
    const selectedStamp = stampOptions.find(
      (option) => option.name === stampName,
    );
    if (!selectedStamp) return;

    const stampId = `stamp-${Date.now()}`;
    // Stampにはname,icon,iconKey,colorは必要ないが仮でおいておく
    const stamp: AppIcon = {
      id: stampId,
      iconKey: "StickyNote",
      color: "#FFEB3B",
      type: "stamp",
      stampType: selectedStamp.name,
      stampText: "",
    };

    setApps((prev) => [...prev, stamp]);

    setAppPositions((prev) => {
      const newPositions = new Map(prev);
      if (selectStampDialog.position) {
        newPositions.set(stampId, selectStampDialog.position);
      }
      return newPositions;
    });

    setSelectStampDialog({ visible: false, position: null });
  };

  const cancelMemoCreation = () => {
    setMemoNameDialog({ visible: false, position: null, folderId: null });
    setMemoNameInput("");
    setMemoColor(defaultDialogColor);
  };

  const cancelAppCreation = () => {
    setAppUrlDialog({ visible: false, position: null, folderId: null });
    setAppUrlInput("");
    setAppColor(defaultDialogColor);
  };

  const cancelFolderCreation = () => {
    setFolderNameDialog({ visible: false, position: null, folderId: null });
    setFolderNameInput("");
    setFolderColor(defaultDialogColor);
  };

  const openMemo = (memoApp: MemoAppType) => {
    const existingWindow = memoWindows.find((w) => w.id === memoApp.id);

    if (existingWindow) {
      // Bring to front
      setMemoWindows((prev) =>
        prev.map((w) =>
          w.id === memoApp.id
            ? {
                ...w,
                isMinimized: false,
                zIndex: nextzIndex,
                color: memoApp.color,
              }
            : w,
        ),
      );
      setNextzIndex((prev) => prev + 1);
    } else {
      // Create new window
      const newWindow: MemoWindowType = {
        id: memoApp.id,
        title: memoApp.name,
        content: memoApp.content || "",
        position: {
          x: 100 + memoWindows.length * 30,
          y: 100 + memoWindows.length * 30,
        },
        size: { width: 600, height: 400 },
        isMinimized: false,
        zIndex: nextzIndex,
        color: memoApp.color,
      };

      setMemoWindows((prev) => [...prev, newWindow]);
      setNextzIndex((prev) => prev + 1);
    }
  };

  const openBrowser = (app: WebsiteAppType) => {
    if (!app.url) return;

    const existingWindow = browserWindows.find((w) => w.id === app.id);

    if (existingWindow) {
      // Bring to front
      setBrowserWindows((prev) =>
        prev.map((w) =>
          w.id === app.id
            ? {
                ...w,
                isMinimized: false,
                zIndex: nextzIndex,
                color: app.color,
              }
            : w,
        ),
      );
      setNextzIndex((prev) => prev + 1);
    } else {
      // Create new window
      const newWindow: BrowserWindowType = {
        id: app.id,
        title: app.name,
        favicon: app.favicon,
        url: app.url,
        position: {
          x: 150 + browserWindows.length * 30,
          y: 80 + browserWindows.length * 30,
        },
        size: { width: 1000, height: 700 },
        isMinimized: false,
        zIndex: nextzIndex,
        color: app.color,
      };

      setBrowserWindows((prev) => [...prev, newWindow]);
      setNextzIndex((prev) => prev + 1);
    }
  };

  const openFolder = (folderApp: FolderAppType) => {
    const existingWindow = folderWindows.find((w) => w.id === folderApp.id);

    if (existingWindow) {
      // Bring to front
      setFolderWindows((prev) =>
        prev.map((w) =>
          w.id === folderApp.id
            ? {
                ...w,
                isMinimized: false,
                zIndex: nextzIndex,
                color: folderApp.color,
              }
            : w,
        ),
      );
      setNextzIndex((prev) => prev + 1);
    } else {
      // Create new window
      const newWindow: FolderWindowType = {
        id: folderApp.id,
        title: folderApp.name,
        position: {
          x: 200 + folderWindows.length * 30,
          y: 120 + folderWindows.length * 30,
        },
        size: { width: 800, height: 600 },
        isMinimized: false,
        zIndex: nextzIndex,
        color: folderApp.color,
      };

      setFolderWindows((prev) => [...prev, newWindow]);
      setNextzIndex((prev) => prev + 1);
    }
  };

  const appsChanged = JSON.stringify(apps) !== JSON.stringify(originalApps);
  const positionsChanged =
    JSON.stringify(
      Array.from(appPositions.entries(), ([key, value]) => [key, { ...value }]),
    ) !==
    JSON.stringify(
      Array.from(originalAppPositions.entries(), ([key, value]) => [
        key,
        { ...value },
      ]),
    );
  const folderContentsChanged =
    mapEntriesToJson(folderContents) !==
    mapEntriesToJson(originalFolderContents);
  const showDesktopSaveBtn = positionsInitialized
    ? appsChanged || positionsChanged || folderContentsChanged
    : false;

  const handleSaveDesktop = async () => {
    const prevOriginalApps = cloneApps(originalApps);
    const prevOriginalAppPositions = cloneAppPositions(originalAppPositions);
    const prevOriginalFolderContents = cloneFolderContents(
      originalFolderContents,
    );

    setOriginalApps(cloneApps(apps));
    setOriginalAppPositions(cloneAppPositions(appPositions));
    setOriginalFolderContents(cloneFolderContents(folderContents));
    toast.dismiss();
    const apiApps = apps.map(mapAppIconToDesktopApp);
    const state: DesktopStateType["state"] = {
      appItems: apiApps,
      appPositions: Object.fromEntries(
        Array.from(appPositions.entries(), ([key, value]) => [
          key,
          { ...value },
        ]),
      ) as DesktopStateType["state"]["appPositions"],
      folderContents: Object.fromEntries(
        Array.from(folderContents.entries(), ([key, value]) => [
          key,
          [...value],
        ]),
      ) as DesktopStateType["state"]["folderContents"],
    };
    try {
      const res = await authedHono.api.desktop[":desktopId"].state.$put({
        param: {
          desktopId: desktopById.id,
        },
        json: {
          state: state,
          id: desktopById.id,
        },
      });
      if (!res.ok) {
        toast("Desktop update failed", {
          style: { color: "#dc2626" },
          icon: <Megaphone size={19} />,
        });
        setOriginalApps(prevOriginalApps);
        setOriginalAppPositions(prevOriginalAppPositions);
        setOriginalFolderContents(prevOriginalFolderContents);
        return;
      }
      onDesktopUpdate?.(desktopById.id, { state });
      toast("Desktop state saved", {
        icon: <Megaphone size={19} />,
      });
    } catch {
      toast("Desktop update failed", {
        style: { color: "#dc2626" },
        icon: <Megaphone size={19} />,
      });
      setOriginalApps(prevOriginalApps);
      setOriginalAppPositions(prevOriginalAppPositions);
      setOriginalFolderContents(prevOriginalFolderContents);
    }
  };

  const handleRevertDesktopChanges = () => {
    toast.dismiss();
    setApps(cloneApps(originalApps));
    setAppPositions(cloneAppPositions(originalAppPositions));
    setFolderContents(cloneFolderContents(originalFolderContents));
    toast("Changes discarded", {
      icon: <Megaphone size={19} />,
    });
  };

  const updateMemoContent = (windowId: string, content: string) => {
    // Update memo window content
    setMemoWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, content } : w)),
    );

    // Update app content without triggering position recalculation
    setApps((prev) =>
      prev.map((app) => (app.id === windowId ? { ...app, content } : app)),
    );
  };

  const closeMemoWindow = (windowId: string) => {
    setMemoWindows((prev) => prev.filter((w) => w.id !== windowId));
  };

  const closeBrowserWindow = (windowId: string) => {
    setBrowserWindows((prev) => prev.filter((w) => w.id !== windowId));
  };

  const closeFolderWindow = (windowId: string) => {
    setFolderWindows((prev) => prev.filter((w) => w.id !== windowId));
  };

  const minimizeBrowserWindow = (windowId: string) => {
    setBrowserWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w)),
    );
  };

  const minimizeFolderWindow = (windowId: string) => {
    setFolderWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, isMinimized: true } : w)),
    );
  };

  const bringHelpWindowToFront = () => {
    setHelpWindow((prev) => ({
      ...prev,
      zIndex: nextzIndex,
    }));
    setNextzIndex((prev) => prev + 1);
  };

  const bringMemoToFront = (windowId: string) => {
    setMemoWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextzIndex } : w)),
    );
    setNextzIndex((prev) => prev + 1);
  };

  const bringBrowserToFront = (windowId: string) => {
    setBrowserWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextzIndex } : w)),
    );
    setNextzIndex((prev) => prev + 1);
  };

  const bringFolderToFront = (windowId: string) => {
    setFolderWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextzIndex } : w)),
    );
    setNextzIndex((prev) => prev + 1);
  };

  const removeFromFolder = (folderId: string, appId: string) => {
    // Remove app from folder
    setFolderContents((prev) => {
      const newContents = new Map(prev);
      const currentContents = newContents.get(folderId) || [];
      newContents.set(
        folderId,
        currentContents.filter((id) => id !== appId),
      );
      return newContents;
    });

    const emptyPosition = findNextEmptyPosition();
    if (emptyPosition) {
      setAppPositions((prev) => {
        const newPositions = new Map(prev);
        newPositions.set(appId, emptyPosition);
        return newPositions;
      });
    }
  };

  const handleAppClick = (app: AppIcon) => {
    if (app.type === "memo") {
      openMemo(app);
    } else if (app.type === "website") {
      openBrowser(app);
    } else if (app.type === "folder") {
      openFolder(app);
    }
  };

  const handleBackgroundChange = (
    backgroundName: BackgroundOptionType,
    backgroundValue: string,
  ) => {
    setBackground(backgroundValue);
    onDesktopUpdate?.(desktopById.id, { background: backgroundName });
  };

  const getBackgroundStyle = () => {
    if (background?.startsWith("http")) {
      return {
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }
    return {
      background: background,
    };
  };

  const handleFontChange = (newFont: FontOptionType) => {
    setFont(newFont);
    onDesktopUpdate?.(desktopById.id, { font: newFont });
  };

  const getFontStyle = (newFont: FontOptionType) => {
    if (newFont === "INTER") {
      return inter.className;
    }

    if (newFont === "ALEGREYA") {
      return alegreya.className;
    }

    if (newFont === "LOBSTER") {
      return lobster.className;
    }

    if (newFont === "ALLAN") {
      return allan.className;
    }

    if (newFont === "LORA") {
      return lora.className;
    }

    if (newFont === "COMFORTAA") {
      return comfortea.className;
    }
  };

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
              className="pointer-events-none rounded-sm"
              onError={() => markFaviconAsFailed(app.id, app.favicon)}
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

    if (app.type === "memo" && app.content?.trim()) {
      return <FileText size={30} className="text-black/90" />;
    }

    if (app.type === "folder" && openFolderIds.has(app.id)) {
      return <FolderOpen size={30} className="text-black/90" />;
    }

    const IconComponent = ICON_COMPONENTS[app.iconKey] ?? StickyNote;
    return <IconComponent size={30} className="text-black/90" />;
  };

  const getFolderAppCount = (folderId: string): number => {
    return folderContents.get(folderId)?.length || 0;
  };

  //アプリの長さが長すぎた時に短くする関数
  function truncate(str: string, max = 5) {
    return str.length > max ? `${str.slice(0, max)}…` : str;
  }

  const renderGrid = () => {
    const grid = [];

    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const app = getAppAtPosition(row, col);
        const isDropTarget =
          draggedOver?.row === row && draggedOver?.col === col;
        const isFolderDropTarget =
          app?.type === "folder" && draggedOverFolder === app.id;
        const cellKey = app ? `${row}-${col}-${app.id}` : `empty-${row}-${col}`;

        grid.push(
          <div
            key={cellKey}
            className={`relative flex items-center justify-center border border-white/5 transition-all duration-200 ease-in-out ${
              isDropTarget ? "scale-105 rounded-2xl bg-white/10" : ""
            }
              				${
                        isFolderDropTarget
                          ? "scale-105 rounded-2xl bg-blue-500/20 ring-2 ring-blue-400"
                          : ""
                      }`}
            onDragOver={(e) => handleDragOver(e, row, col)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, row, col)}
            onContextMenu={(e) => handleRightClick(e, row, col)}
          >
            {app && (
              <div>
                {app.type === "stamp" ? (
                  app.stampText ? (
                    <Tooltip delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          draggable={isEdit}
                          onDragStart={(e) => handleDragStart(e, app.id)}
                          onDragEnd={handleDragEnd}
                        >
                          <Image
                            src={`/os/stamp/${app.stampType}.png`}
                            alt="stamp"
                            width={65}
                            height={65}
                            className="pointer-events-none"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="relative top-2 rounded-2xl">
                        <p className="text-white">{app.stampText}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : (
                    <div
                      draggable={isEdit}
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      onDragEnd={handleDragEnd}
                    >
                      <Image
                        src={`/os/stamp/${app.stampType}.png`}
                        alt="stamp"
                        width={65}
                        height={65}
                      />
                    </div>
                  )
                ) : (
                  <div
                    draggable={isEdit}
                    onDragStart={(e) => handleDragStart(e, app.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleAppClick(app)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleAppClick(app);
                      }
                    }}
                    className="group flex transform cursor-grab flex-col items-center transition-all duration-200 ease-out active:cursor-grabbing"
                  >
                    {(() => {
                      const { className, style } = resolveAppColorStyles(
                        app.color,
                      );
                      return (
                        <div
                          className={`relative mb-1.5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-2xl backdrop-blur-sm transition-all duration-200 group-hover:border-white/30 ${className}`}
                          style={style}
                        >
                          {renderAppIcon(app)}
                          {app.type === "website" && app.favicon && (
                            <Globe
                              size={28}
                              className="hidden text-black drop-shadow-sm"
                            />
                          )}
                          {app.type === "folder" &&
                            getFolderAppCount(app.id) > 0 && (
                              <div className="-top-1.5 -right-1.5 absolute flex h-5 w-5 items-center justify-center rounded-full bg-red-500 font-bold text-white text-xs">
                                {getFolderAppCount(app.id)}
                              </div>
                            )}
                          <div className="-z-10 absolute inset-0 rounded-2xl bg-white/80 shadow-2xl backdrop-blur-lg" />
                        </div>
                      );
                    })()}
                    <div
                      className={`mt-1 text-center font-medium text-white text-xs drop-shadow-sm ${getFontStyle(font)}`}
                    >
                      {truncate(app.name, 20)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>,
        );
      }
    }

    return grid;
  };

  const draggedAppData = draggedApp
    ? apps.find((app) => app.id === draggedApp)
    : null;
  const canDropIntoFolderWindow = Boolean(
    isEdit && draggedAppData && draggedAppData.type !== "stamp",
  );

  return (
    <div
      className="relative h-screen overflow-hidden bg-white"
      style={pinnedPaddingStyle}
    >
      {frameOverlayStyle ? (
        <div
          className="pointer-events-none absolute inset-0"
          style={frameOverlayStyle}
          aria-hidden="true"
        >
          {frameCornerStyles.map((corner) => (
            <div key={corner.key} style={corner.style} aria-hidden="true" />
          ))}
        </div>
      ) : null}
      <div
        className={`${isPanelPinned ? "rounded-2xl" : ""} relative z-45 h-full w-full overflow-hidden`}
        style={getBackgroundStyle()}
      >
        <TooltipProvider>
          <Toaster
            visibleToasts={1}
            className={cn("top-0 right-0")}
            richColors={false}
            duration={1000}
            position="top-right"
            toastOptions={{
              classNames: {
                toast: "macos-toast",
                title: "macos-title",
              },
              style: {
                right: isPanelPinned ? "220px" : "0px",
              },
            }}
          />

          <UserIcon
            isPublic={isPublic}
            currentUserInfo={currentUserInfo}
            getFontStyle={getFontStyle}
            currentFont={font}
            osName={osName}
          />

          <div
            className="pointer-events-none absolute inset-0"
            style={{ backgroundColor: `rgba(0, 0, 0, ${brightness})` }}
            aria-hidden="true"
          />

          <DraggableMenu
            onBackgroundChange={handleBackgroundChange}
            getFontStyle={getFontStyle}
            onFontChange={handleFontChange}
            background={
              background ?? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }
            font={font}
            setBackground={setBackground}
            brightness={brightness}
            onBrightnessChange={handleBrightnessChange}
            currentTime={currentTime}
            isPublic={isPublic}
            setIsPublic={handleSetIsPublic}
            osName={osName}
            isEditable={isEdit}
            setHelpWindow={setHelpWindow}
            helpWindow={helpWindow}
            desktopId={desktopById.id}
            isPanelPinned={isPanelPinned}
          />

          {/* Desktop grid */}
          <div className="relative z-10 h-[calc(100vh)] p-8">
            <div
              className="mx-auto grid h-full max-w-6xl gap-0"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
              }}
            >
              {renderGrid()}
            </div>
          </div>

          {/* Context Menu */}
          {contextMenu.visible && (
            <ContextMenu
              contextMenu={contextMenu}
              showEditDialog={showEditDialog}
              deleteApp={deleteApp}
              showAppUrlDialog={showAppUrlDialog}
              showMemoNameDialog={showMemoNameDialog}
              showFolderNameDialog={showFolderNameDialog}
              showSelectStampDialog={showSelectStampDialog}
              removeFromFolder={removeAppFromFolderViaContext}
            />
          )}

          {editDialog.app && editDialog.visible && (
            <div>
              {editDialog.app.type === "stamp" ? (
                <EditStampDialog
                  dialogZIndex={nextzIndex}
                  contentInput={editDialog.newContent}
                  changeContentInput={changeContentEditDialog}
                  onSave={saveEdit}
                  visible={editDialog.visible}
                  onCancel={cancelEdit}
                  formLabel="Hello!!"
                  panelOffsetRight={panelOffsetRight}
                  usePinnedLayout={isPanelPinned}
                />
              ) : (
                <DefaultDialog
                  visible={editDialog.visible}
                  title={`Edit ${editDialog.app.type === "memo" ? "Notes" : editDialog.app.type === "folder" ? "Folder" : "App"}`}
                  onCancel={cancelEdit}
                  onSave={saveEdit}
                  dialogZIndex={nextzIndex}
                  dialogClassName="edit-dialog"
                  placeholder="Enter name..."
                  nameInput={editDialog.newName}
                  changeNameInput={changeNameEditDialog}
                  selectedColor={editDialog.newColor}
                  onColorSelect={changeColorEditDialog}
                  colorOptions={DEFAULT_DIALOG_COLORS}
                  panelOffsetRight={panelOffsetRight}
                  usePinnedLayout={isPanelPinned}
                />
              )}
            </div>
          )}

          {appUrlDialog.visible && (
            <CreateAppDialog
              nameInput={appUrlInput}
              dialogZIndex={nextzIndex}
              dialogClassName="app-dialog"
              changeNameInput={changeAppUrlInput}
              onSave={createAppWithUrl}
              onCancel={cancelAppCreation}
              visible={appUrlDialog.visible}
              saveLabel={isLoadingApp ? "Creating..." : "Save"}
              isLoadingApp={isLoadingApp}
              title="Create New App"
              placeholder="https://example.com"
              panelOffsetRight={panelOffsetRight}
              usePinnedLayout={isPanelPinned}
              selectedColor={appColor}
              onColorSelect={setAppColor}
              colorOptions={DEFAULT_DIALOG_COLORS}
            />
          )}

          {memoNameDialog.visible && (
            <DefaultDialog
              nameInput={memoNameInput}
              dialogZIndex={nextzIndex}
              dialogClassName="memo-dialog"
              changeNameInput={changeMemoNameInput}
              onSave={createMemoWithName}
              onCancel={cancelMemoCreation}
              visible={memoNameDialog.visible}
              title="Create New Notes"
              placeholder="Enter notes name..."
              panelOffsetRight={panelOffsetRight}
              usePinnedLayout={isPanelPinned}
              selectedColor={memoColor}
              onColorSelect={setMemoColor}
              colorOptions={DEFAULT_DIALOG_COLORS}
            />
          )}

          {folderNameDialog.visible && (
            <DefaultDialog
              nameInput={folderNameInput}
              dialogZIndex={nextzIndex}
              dialogClassName="folder-dialog"
              changeNameInput={changeFolderNameInput}
              onSave={createFolderWithName}
              onCancel={cancelFolderCreation}
              visible={folderNameDialog.visible}
              title="Create New Folder"
              placeholder="Enter folder name..."
              panelOffsetRight={panelOffsetRight}
              usePinnedLayout={isPanelPinned}
              selectedColor={folderColor}
              onColorSelect={setFolderColor}
              colorOptions={DEFAULT_DIALOG_COLORS}
            />
          )}

          {selectStampDialog.visible && (
            <StampDialog
              dialogZIndex={nextzIndex}
              visible={selectStampDialog.visible}
              onSelectStamp={onSelectStamp}
              panelOffsetRight={panelOffsetRight}
              usePinnedLayout={isPanelPinned}
            />
          )}

          {/* Help Window */}
          {helpWindow.visible && (
            <HelpWindow
              currentFont={font}
              getFontStyle={getFontStyle}
              window={helpWindow}
              onClose={() =>
                setHelpWindow((prev) => ({
                  ...prev,
                  visible: false,
                }))
              }
              // onMinimize={}
              onBringToFront={() => {
                bringHelpWindowToFront();
              }}
              onPositionChange={(position) => {
                setHelpWindow((prev) => ({
                  ...prev,
                  position,
                }));
              }}
              onSizeChange={(size) => {
                setHelpWindow((prev) => ({
                  ...prev,
                  size,
                }));
              }}
            />
          )}

          {/* Memo Windows */}
          {memoWindows.map(
            (window) =>
              !window.isMinimized && (
                <MemoWindow
                  key={window.id}
                  window={window}
                  isEditable={isEdit}
                  currentFont={font}
                  getFontStyle={getFontStyle}
                  onClose={() => closeMemoWindow(window.id)}
                  onContentChange={(content) =>
                    updateMemoContent(window.id, content)
                  }
                  onBringToFront={() => bringMemoToFront(window.id)}
                  onPositionChange={(position) => {
                    setMemoWindows((prev) =>
                      prev.map((w) =>
                        w.id === window.id
                          ? {
                              ...w,
                              position,
                            }
                          : w,
                      ),
                    );
                  }}
                  onSizeChange={(size) => {
                    setMemoWindows((prev) =>
                      prev.map((w) =>
                        w.id === window.id
                          ? {
                              ...w,
                              size,
                            }
                          : w,
                      ),
                    );
                  }}
                />
              ),
          )}

          {/* Browser Windows */}
          {browserWindows.map(
            (window) =>
              !window.isMinimized && (
                <BrowserWindow
                  key={window.id}
                  window={window}
                  currentFont={font}
                  getFontStyle={getFontStyle}
                  onClose={() => closeBrowserWindow(window.id)}
                  onMinimize={() => minimizeBrowserWindow(window.id)}
                  onBringToFront={() => bringBrowserToFront(window.id)}
                  onPositionChange={(position) => {
                    setBrowserWindows((prev) =>
                      prev.map((w) =>
                        w.id === window.id
                          ? {
                              ...w,
                              position,
                            }
                          : w,
                      ),
                    );
                  }}
                  onSizeChange={(size) => {
                    setBrowserWindows((prev) =>
                      prev.map((w) =>
                        w.id === window.id
                          ? {
                              ...w,
                              size,
                            }
                          : w,
                      ),
                    );
                  }}
                />
              ),
          )}

          {/* Folder Windows */}
          {folderWindows.map(
            (window) =>
              !window.isMinimized && (
                <FolderWindow
                  key={window.id}
                  window={window}
                  currentFont={font}
                  getFontStyle={getFontStyle}
                  folderContents={folderContents.get(window.id) || []}
                  allFolderContents={folderContents}
                  apps={apps}
                  desktopBackground={background}
                  brightness={brightness}
                  isEditable={isEdit}
                  canDropExternal={canDropIntoFolderWindow}
                  onExternalDrop={() => handleDropIntoFolderWindow(window.id)}
                  onClose={() => closeFolderWindow(window.id)}
                  onMinimize={() => minimizeFolderWindow(window.id)}
                  onBringToFront={() => bringFolderToFront(window.id)}
                  onRemoveApp={(appId) => removeFromFolder(window.id, appId)}
                  onAppClick={handleAppClick}
                  onAppContextMenu={handleFolderAppContextMenu}
                  onEmptyAreaContextMenu={handleFolderEmptyAreaContextMenu}
                  onAppDragStart={(e, appId) =>
                    handleFolderItemDragStart(e, appId, window.id)
                  }
                  onAppDragEnd={handleDragEnd}
                  onAppDrop={handleFolderItemReorderDrop}
                  onDropIntoFolder={handleDropIntoNestedFolder}
                  onPositionChange={(position) => {
                    setFolderWindows((prev) =>
                      prev.map((w) =>
                        w.id === window.id
                          ? {
                              ...w,
                              position,
                            }
                          : w,
                      ),
                    );
                  }}
                  onSizeChange={(size) => {
                    setFolderWindows((prev) =>
                      prev.map((w) =>
                        w.id === window.id
                          ? {
                              ...w,
                              size,
                            }
                          : w,
                      ),
                    );
                  }}
                  failedFavicons={failedFavicons}
                  onFaviconError={markFaviconAsFailed}
                  openFolderIds={openFolderIds}
                />
              ),
          )}

          {showDesktopSaveBtn && isEdit && (
            <div
              className={`fixed ${isPanelPinned ? "right-[calc(220px+24px)]" : "right-6"} bottom-6 text-black text-sm shadow-lg transition`}
              style={{ zIndex: 2147483647 }}
            >
              <div className="flex items-center gap-3 rounded-t-2xl border-b bg-white/90 px-3 py-3">
                <CircleAlert size={17} />
                <p className="font-bold text-sm">Unsaved changes</p>
              </div>
              <div className="rounded-b-2xl bg-white/85 px-3 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-[120px] rounded-xl"
                    onClick={handleRevertDesktopChanges}
                  >
                    Revert
                  </Button>
                  <Button
                    size="sm"
                    className="w-[120px] rounded-xl"
                    onClick={handleSaveDesktop}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
