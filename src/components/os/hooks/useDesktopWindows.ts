import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  FolderAppType,
  MemoAppType,
  WebsiteAppType,
} from "@/server/schemas/desktop.schema";
import type {
  BrowserWindowType,
  FolderWindowType,
  HelpWindowType,
  MemoWindowType,
} from "../types";

const INITIAL_Z_INDEX = 1000;
const HELP_WINDOW_OFFSET = 1000;

export type DesktopWindowsHook = {
  nextzIndex: number;
  memoWindows: MemoWindowType[];
  browserWindows: BrowserWindowType[];
  folderWindows: FolderWindowType[];
  helpWindow: HelpWindowType;
  setMemoWindows: Dispatch<SetStateAction<MemoWindowType[]>>;
  setBrowserWindows: Dispatch<SetStateAction<BrowserWindowType[]>>;
  setFolderWindows: Dispatch<SetStateAction<FolderWindowType[]>>;
  setHelpWindow: Dispatch<SetStateAction<HelpWindowType>>;
  openMemo: (memoApp: MemoAppType) => void;
  openBrowser: (app: WebsiteAppType) => void;
  openFolder: (folderApp: FolderAppType) => void;
  closeMemoWindow: (windowId: string) => void;
  closeBrowserWindow: (windowId: string) => void;
  closeFolderWindow: (windowId: string) => void;
  bringHelpWindowToFront: () => void;
  bringMemoToFront: (windowId: string) => void;
  bringBrowserToFront: (windowId: string) => void;
  bringFolderToFront: (windowId: string) => void;
};

export const useDesktopWindows = (
  initialZIndex: number = INITIAL_Z_INDEX,
): DesktopWindowsHook => {
  const [nextzIndex, setNextzIndex] = useState(initialZIndex);
  const nextzIndexRef = useRef(nextzIndex);

  useEffect(() => {
    nextzIndexRef.current = nextzIndex;
  }, [nextzIndex]);

  const allocateZIndex = useCallback(() => {
    const current = nextzIndexRef.current;
    setNextzIndex((prev) => prev + 1);
    return current;
  }, []);

  const [memoWindows, setMemoWindows] = useState<MemoWindowType[]>([]);
  const [browserWindows, setBrowserWindows] = useState<BrowserWindowType[]>([]);
  const [folderWindows, setFolderWindows] = useState<FolderWindowType[]>([]);
  const [helpWindow, setHelpWindow] = useState<HelpWindowType>({
    visible: false,
    content: "welcome",
    position: { x: 150, y: 150 },
    size: { width: 650, height: 450 },
    zIndex: initialZIndex + HELP_WINDOW_OFFSET,
  });

  const openMemo = useCallback(
    (memoApp: MemoAppType) => {
      setMemoWindows((prev) => {
        const existing = prev.find((w) => w.id === memoApp.id);
        if (existing) {
          const zIndex = allocateZIndex();
          return prev.map((w) =>
            w.id === memoApp.id
              ? {
                  ...w,
                  zIndex,
                  color: memoApp.color,
                }
              : w,
          );
        }

        const zIndex = allocateZIndex();
        const newWindow: MemoWindowType = {
          id: memoApp.id,
          title: memoApp.name,
          content: memoApp.content || "",
          position: {
            x: 100 + prev.length * 30,
            y: 100 + prev.length * 30,
          },
          size: { width: 600, height: 400 },
          zIndex,
          color: memoApp.color,
        };

        return [...prev, newWindow];
      });
    },
    [allocateZIndex],
  );

  const openBrowser = useCallback(
    (app: WebsiteAppType) => {
      if (!app.url) return;

      setBrowserWindows((prev) => {
        const existing = prev.find((w) => w.id === app.id);
        if (existing) {
          const zIndex = allocateZIndex();
          return prev.map((w) =>
            w.id === app.id
              ? {
                  ...w,
                  zIndex,
                  color: app.color,
                }
              : w,
          );
        }

        const zIndex = allocateZIndex();
        const newWindow: BrowserWindowType = {
          id: app.id,
          title: app.name,
          favicon: app.favicon,
          url: app.url,
          position: {
            x: 150 + prev.length * 30,
            y: 80 + prev.length * 30,
          },
          size: { width: 1000, height: 700 },
          zIndex,
          color: app.color,
        };

        return [...prev, newWindow];
      });
    },
    [allocateZIndex],
  );

  const openFolder = useCallback(
    (folderApp: FolderAppType) => {
      setFolderWindows((prev) => {
        const existing = prev.find((w) => w.id === folderApp.id);
        if (existing) {
          const zIndex = allocateZIndex();
          return prev.map((w) =>
            w.id === folderApp.id
              ? {
                  ...w,
                  zIndex,
                  color: folderApp.color,
                }
              : w,
          );
        }

        const zIndex = allocateZIndex();
        const newWindow: FolderWindowType = {
          id: folderApp.id,
          title: folderApp.name,
          position: {
            x: 200 + prev.length * 30,
            y: 120 + prev.length * 30,
          },
          size: { width: 800, height: 600 },
          zIndex,
          color: folderApp.color,
        };

        return [...prev, newWindow];
      });
    },
    [allocateZIndex],
  );

  const closeMemoWindow = useCallback((windowId: string) => {
    setMemoWindows((prev) => prev.filter((w) => w.id !== windowId));
  }, []);

  const closeBrowserWindow = useCallback((windowId: string) => {
    setBrowserWindows((prev) => prev.filter((w) => w.id !== windowId));
  }, []);

  const closeFolderWindow = useCallback((windowId: string) => {
    setFolderWindows((prev) => prev.filter((w) => w.id !== windowId));
  }, []);

  const bringHelpWindowToFront = useCallback(() => {
    const zIndex = allocateZIndex();
    setHelpWindow((prev) => ({
      ...prev,
      zIndex,
    }));
  }, [allocateZIndex]);

  const bringMemoToFront = useCallback(
    (windowId: string) => {
      const zIndex = allocateZIndex();
      setMemoWindows((prev) =>
        prev.map((w) =>
          w.id === windowId
            ? {
                ...w,
                zIndex,
              }
            : w,
        ),
      );
    },
    [allocateZIndex],
  );

  const bringBrowserToFront = useCallback(
    (windowId: string) => {
      const zIndex = allocateZIndex();
      setBrowserWindows((prev) =>
        prev.map((w) =>
          w.id === windowId
            ? {
                ...w,
                zIndex,
              }
            : w,
        ),
      );
    },
    [allocateZIndex],
  );

  const bringFolderToFront = useCallback(
    (windowId: string) => {
      const zIndex = allocateZIndex();
      setFolderWindows((prev) =>
        prev.map((w) =>
          w.id === windowId
            ? {
                ...w,
                zIndex,
              }
            : w,
        ),
      );
    },
    [allocateZIndex],
  );

  return {
    nextzIndex,
    memoWindows,
    browserWindows,
    folderWindows,
    helpWindow,
    setMemoWindows,
    setBrowserWindows,
    setFolderWindows,
    setHelpWindow,
    openMemo,
    openBrowser,
    openFolder,
    closeMemoWindow,
    closeBrowserWindow,
    closeFolderWindow,
    bringHelpWindowToFront,
    bringMemoToFront,
    bringBrowserToFront,
    bringFolderToFront,
  };
};
