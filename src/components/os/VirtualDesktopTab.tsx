"use client";

import { Pin, PinOff, Plus } from "lucide-react";
import {
  type FocusEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { authedHono } from "@/lib/hono-client";
import type { DesktopStateType } from "@/server/schemas/desktop.schema";
import { backgroundOptions } from "./BackgroundImage";
import Desktop from "./Desktop";
import VirtualDesktopDialog from "./dialog/VirtualDesktopDialog";
import { TabContextMenu } from "./TabContextMenu";
import type { CurrentUserType } from "./types";

export type DesktopWithoutDates = Omit<
  DesktopStateType,
  "createdAt" | "updatedAt"
>;

type Props = {
  desktopList: DesktopWithoutDates[];
  osName: string;
  isEdit: boolean;
  currentUser: CurrentUserType;
};

export default function VirtualDesktopTab({
  desktopList,
  osName,
  isEdit,
  currentUser,
}: Props) {
  const [tabId, setTabId] = useState(() => desktopList[0]?.id ?? "");
  const [desktops, setDesktops] = useState<DesktopWithoutDates[]>(desktopList);
  const [dialogState, setDialogState] = useState<{
    visible: boolean;
    mode: "create" | "edit";
    targetDesktopId: string;
    initialName: string;
  }>(() => ({
    visible: false,
    mode: "create",
    targetDesktopId: "",
    initialName: "",
  }));
  const [isMouseNearEdge, setIsMouseNearEdge] = useState(false);
  const [isHoveringTabs, setIsHoveringTabs] = useState(false);
  const [hasKeyboardFocus, setHasKeyboardFocus] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [tabContextMenu, setTabContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    desktopId: string;
    desktopName: string;
  }>({
    visible: false,
    x: 0,
    y: 0,
    desktopId: "",
    desktopName: "",
  });
  const contextMenuRef = useRef<HTMLDivElement | null>(null);
  const hideTabContextMenu = useCallback(() => {
    setTabContextMenu({
      visible: false,
      x: 0,
      y: 0,
      desktopId: "",
      desktopName: "",
    });
  }, []);

  const handleDialogClose = useCallback(() => {
    setDialogState((prev) => ({ ...prev, visible: false }));
  }, []);

  useEffect(() => {
    if (!tabContextMenu.visible) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        hideTabContextMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        hideTabContextMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [hideTabContextMenu, tabContextMenu.visible]);

  useEffect(() => {
    const THRESHOLD = 64;
    const handleMouseMove = (event: MouseEvent) => {
      const viewportWidth = window.innerWidth || 0;
      const next = event.clientX >= viewportWidth - THRESHOLD;
      setIsMouseNearEdge((prev) => (prev === next ? prev : next));
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    setDesktops(desktopList);
  }, [desktopList]);

  useEffect(() => {
    if (!desktops.some((d) => d.id === tabId)) {
      setTabId(desktops[0]?.id ?? "");
    }
  }, [desktops, tabId]);

  const handleDesktopUpdate = useCallback(
    (id: string, patch: Partial<DesktopWithoutDates>) => {
      setDesktops((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );
    },
    [],
  );

  const handleAddDesktop = () => {
    setDialogState({
      visible: true,
      mode: "create",
      targetDesktopId: "",
      initialName: "",
    });
  };

  const handleEditDesktopRequest = () => {
    const { desktopId, desktopName } = tabContextMenu;

    if (!desktopId) {
      hideTabContextMenu();
      return;
    }

    setDialogState({
      visible: true,
      mode: "edit",
      targetDesktopId: desktopId,
      initialName: desktopName,
    });
    hideTabContextMenu();
  };

  const prependDesktop = useCallback((newDesktop: DesktopWithoutDates) => {
    setDesktops((prev) => [newDesktop, ...prev]);
  }, []);

  if (desktops.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        デスクトップがありません。
      </div>
    );
  }

  const handleTabBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (nextTarget && event.currentTarget.contains(nextTarget)) {
      return;
    }
    setHasKeyboardFocus(false);
  };

  const handleMouseEnterTabs = () => {
    setIsHoveringTabs(true);
  };

  const handleMouseLeaveTabs = () => {
    setIsHoveringTabs(false);
    setIsMouseNearEdge(false);
    if (!tabContextMenu.visible) {
      hideTabContextMenu();
    }
  };

  const current = desktops.find((d) => d.id === tabId) ?? desktops[0];

  const showTabs =
    isPinned ||
    isMouseNearEdge ||
    isHoveringTabs ||
    hasKeyboardFocus ||
    tabContextMenu.visible;

  const handleDeleteDesktopRequest = async () => {
    const targetId = tabContextMenu.desktopId;

    if (!targetId) {
      hideTabContextMenu();
      return;
    }

    try {
      const res = await authedHono.api.desktop[":id"].delete.$delete({
        param: {
          id: targetId,
        },
      });

      const data = await res.json();
      const deletedId = data.id;

      if (deletedId) {
        setDesktops((prev) => {
          const updated = prev.filter((desktop) => desktop.id !== deletedId);
          if (deletedId === tabId) {
            setTabId(updated[0]?.id ?? "");
          }
          return updated;
        });
      }
    } finally {
      hideTabContextMenu();
    }
  };

  const menuPosition = tabContextMenu.visible
    ? { x: tabContextMenu.x, y: tabContextMenu.y }
    : null;

  const createDesktop = async (name: string) => {
    const res = await authedHono.api.desktop.new.$post({
      json: {
        name,
      },
    });

    const data = await res.json();
    prependDesktop({ ...data });
  };

  const renameDesktop = async (id: string, name: string) => {
    const res = await authedHono.api.dektop[":id"].name.$put({
      param: {
        id
      },
      json: {
        name
      }
    })
    const data = await res.json()
    handleDesktopUpdate(data.id, { name: data.name });
  };

  const handleDialogSubmit = async (name: string) => {
    if (dialogState.mode === "create") {
      await createDesktop(name);
    } else if (dialogState.targetDesktopId) {
      await renameDesktop(dialogState.targetDesktopId, name);
    }
  };

  return (
    <div
      className="relative h-full transition-[padding-right] duration-300 ease-in-out"
      style={{ paddingRight: isPinned ? "220px" : 0 }}
    >
      <div
        className={[
          "fixed bottom-0 top-0 right-0 z-6000 flex w-[220px] flex-col gap-3 border-black/5 bg-white/90 px-4 py-6 backdrop-blur transition-all duration-300 ease-in-out will-change-transform",
          showTabs ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
          showTabs ? "pointer-events-auto" : "pointer-events-none",
          isPinned ? "" : "border-l shadow-lg",
        ].join(" ")}
        onMouseEnter={handleMouseEnterTabs}
        onMouseLeave={handleMouseLeaveTabs}
        onFocusCapture={() => setHasKeyboardFocus(true)}
        onBlurCapture={handleTabBlurCapture}
      >
        <button
          type="button"
          onClick={() =>
            setIsPinned((prev) => {
              const next = !prev;
              if (!next) {
                setIsHoveringTabs(false);
                setIsMouseNearEdge(false);
                setHasKeyboardFocus(false);
                hideTabContextMenu();
              }
              return next;
            })
          }
          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/70 text-black/70 shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 self-start"
          aria-label={isPinned ? "Unpin tab panel" : "Pin tab panel"}
          aria-pressed={isPinned}
        >
          {isPinned ? <PinOff size={16} /> : <Pin size={16} />}
        </button>
        <div
          className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
          role="tablist"
          aria-label="Virtual desktops"
          aria-orientation="vertical"
        >
          {desktops.map((d) => {
            const background = backgroundOptions.find(
              (opt) => opt.name === d.background,
            )?.value;

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

            return (
              <button
                key={d.id}
                type="button"
                role="tab"
                aria-selected={d.id === current.id}
                onClick={(event) => {
                  setTabId(d.id);
                  if (event.detail !== 0) {
                    setHasKeyboardFocus(false);
                  }
                }}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setTabContextMenu({
                    visible: true,
                    x: event.clientX,
                    y: event.clientY,
                    desktopId: d.id,
                    desktopName: d.name,
                  });
                }}
                className={[
                  "group rounded-xl border border-black/10 px-2 py-2 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  d.id === current.id
                    ? "bg-white text-black shadow-sm"
                    : "text-black/70 hover:bg-white/70",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <p>{d.name}</p>
                <div
                  aria-hidden
                  className="relative w-full h-20 overflow-hidden rounded-lg border border-black/10 shadow-inner"
                  style={getBackgroundStyle()}
                />
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={handleAddDesktop}
          className="flex h-9 items-center justify-center rounded-full border border-black/10 text-black/70 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          aria-label="Add desktop"
        >
          <Plus size={16} />
        </button>
      </div>
      <Desktop
        key={current.id}
        desktopById={current}
        osName={osName}
        onDesktopUpdate={handleDesktopUpdate}
        isEdit={isEdit}
        currentUser={currentUser}
        isPanelPinned={isPinned}
      />
      <VirtualDesktopDialog
        visible={dialogState.visible}
        onClose={handleDialogClose}
        save={handleDialogSubmit}
        initialName={dialogState.initialName}
        title={dialogState.mode === "create" ? "Add Desktop" : "Edit Desktop"}
        submitLabel={dialogState.mode === "create" ? "Save" : "Update"}
      />
      <TabContextMenu
        ref={contextMenuRef}
        visible={tabContextMenu.visible}
        position={menuPosition}
        desktopName={tabContextMenu.desktopName}
        onEdit={handleEditDesktopRequest}
        onDelete={handleDeleteDesktopRequest}
        onClose={hideTabContextMenu}
      />
    </div>
  );
}
