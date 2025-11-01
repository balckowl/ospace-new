"use client";

import { Check, Loader2, Lock, Pin, PinOff, Plus } from "lucide-react";
import { useQueryState } from "nuqs";
import {
  type DragEvent,
  type FocusEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { authedHono } from "@/lib/hono-client";
import type { DesktopStateType } from "@/server/schemas/desktop.schema";
import { Button } from "../ui/button";
import { backgroundOptions } from "./BackgroundImage";
import { PINNED_PANEL_WIDTH } from "./constants/desktop";
import Desktop from "./Desktop";
import VirtualDesktopDialog from "./dialog/VirtualDesktopDialog";
import { truncate } from "./functions/truncate";
import { TabContextMenu } from "./TabContextMenu";
import type { CurrentUserType } from "./types";

export type DesktopWithoutDates = Omit<
  DesktopStateType,
  "createdAt" | "updatedAt"
>;

const isSameOrder = (list: DesktopWithoutDates[], order: string[]): boolean => {
  if (list.length !== order.length) {
    return false;
  }
  return list.every((item, index) => item.id === order[index]);
};

const sanitizeFileName = (input: string) =>
  input.replace(/[\\/:*?"<>|]/g, "_") || "desktop";

const buildDesktopExport = (desktop: DesktopWithoutDates) => {
  const { state, name } = desktop;
  const { appItems, folderContents } = state;
  const appById = new Map(appItems.map((item) => [item.id, item]));

  const childIds = new Set<string>();
  for (const ids of Object.values(folderContents ?? {})) {
    ids.forEach((id) => {
      childIds.add(id);
    });
  }

  const rootIds = appItems
    .map((item) => item.id)
    .filter((id) => !childIds.has(id));

  const websites: Array<{ name: string; url: string; path: string[] }> = [];
  const memos: Array<{ name: string; content: string; path: string[] }> = [];

  const visit = (id: string, path: string[]) => {
    const app = appById.get(id);
    if (!app) {
      return;
    }

    if (app.type === "folder") {
      const children = state.folderContents[app.id] ?? [];
      const nextPath = [...path, app.name];
      children.forEach((childId) => {
        visit(childId, nextPath);
      });
      return;
    }

    if (app.type === "website") {
      websites.push({ name: app.name, url: app.url, path });
      return;
    }

    if (app.type === "memo") {
      memos.push({ name: app.name, content: app.content, path });
      return;
    }
  };

  rootIds.forEach((rootId) => {
    visit(rootId, []);
  });

  const lines: string[] = [];
  lines.push(`Desktop: ${name}`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");

  lines.push("Websites:");
  if (websites.length === 0) {
    lines.push("- (none)");
  } else {
    websites.forEach((item, index) => {
      const prefix = item.path.length ? `${item.path.join(" / ")} / ` : "";
      lines.push(`${index + 1}. ${prefix}${item.name}`);
      lines.push(`   URL: ${item.url}`);
    });
  }

  lines.push("");
  lines.push("Memos:");
  if (memos.length === 0) {
    lines.push("- (none)");
  } else {
    memos.forEach((item, index) => {
      const prefix = item.path.length ? `${item.path.join(" / ")} / ` : "";
      lines.push(`${index + 1}. ${prefix}${item.name}`);
      const contentLines = item.content ? item.content.split(/\r?\n/) : [];
      if (contentLines.length === 0) {
        lines.push("   (empty)");
      } else {
        contentLines.forEach((line) => {
          lines.push(`   ${line}`);
        });
      }
    });
  }

  lines.push("");
  lines.push("-----");

  return lines.join("\n");
};

const MAX_DESKTOP_COUNT = 4;

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
  const [tabId, setTabId] = useQueryState("desktopId");
  const [desktops, setDesktops] = useState<DesktopWithoutDates[]>(desktopList);
  const originalOrderRef = useRef<string[]>(desktopList.map((d) => d.id));
  const [orderChanged, setOrderChanged] = useState(false);
  const [draggedDesktopId, setDraggedDesktopId] = useState<string | null>(null);
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
  const [isLoading, setIsLoading] = useState(false);
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
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const previousRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const reduceMotionRef = useRef(false);
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
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateReduceMotion = () => {
      reduceMotionRef.current = media.matches;
    };

    updateReduceMotion();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", updateReduceMotion);
      return () => {
        media.removeEventListener("change", updateReduceMotion);
      };
    }

    media.addListener(updateReduceMotion);
    return () => {
      media.removeListener(updateReduceMotion);
    };
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
    originalOrderRef.current = desktopList.map((d) => d.id);
    setOrderChanged(false);
    previousRectsRef.current.clear();
  }, [desktopList]);

  useLayoutEffect(() => {
    const currentRects = new Map<string, DOMRect>();

    for (const desktop of desktops) {
      const node = itemRefs.current.get(desktop.id);
      if (!node) {
        continue;
      }
      currentRects.set(desktop.id, node.getBoundingClientRect());
    }

    if (!reduceMotionRef.current) {
      for (const desktop of desktops) {
        const node = itemRefs.current.get(desktop.id);
        if (!node) {
          continue;
        }

        const prevRect = previousRectsRef.current.get(desktop.id);
        const nextRect = currentRects.get(desktop.id);

        if (!prevRect || !nextRect) {
          node.style.transition = "";
          node.style.transform = "";
          continue;
        }

        const deltaX = prevRect.left - nextRect.left;
        const deltaY = prevRect.top - nextRect.top;

        if (deltaX === 0 && deltaY === 0) {
          continue;
        }

        node.style.transition = "none";
        node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const handleTransitionEnd = () => {
              node.style.transition = "";
              node.removeEventListener("transitionend", handleTransitionEnd);
            };

            node.style.transition = "transform 200ms ease";
            node.style.transform = "";
            node.addEventListener("transitionend", handleTransitionEnd, {
              once: true,
            });
          });
        });
      }
    } else {
      for (const desktop of desktops) {
        const node = itemRefs.current.get(desktop.id);
        if (!node) {
          continue;
        }
        node.style.transition = "";
        node.style.transform = "";
      }
    }

    previousRectsRef.current = currentRects;
  }, [desktops]);

  useEffect(() => {
    if (desktops.length === 0) {
      if (tabId !== null) {
        void setTabId(null);
      }
      return;
    }

    if (tabId == null || tabId === "") {
      void setTabId(desktops[0].id);
      return;
    }

    if (!desktops.some((d) => d.id === tabId)) {
      void setTabId(desktops[0].id);
    }
  }, [desktops, tabId, setTabId]);

  const handleDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>, desktopId: string) => {
      setDraggedDesktopId(desktopId);
      hideTabContextMenu();
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", desktopId);
      }
    },
    [hideTabContextMenu],
  );

  const handleDragOverTab = useCallback(
    (event: DragEvent<HTMLButtonElement>) => {
      if (!draggedDesktopId) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    },
    [draggedDesktopId],
  );

  const handleDropOnTab = useCallback(
    (event: DragEvent<HTMLButtonElement>, overId: string) => {
      event.preventDefault();
      if (!draggedDesktopId || draggedDesktopId === overId) {
        setDraggedDesktopId(null);
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const offsetY = event.clientY - rect.top;
      const pointerRatio =
        rect.height > 0 ? Math.min(Math.max(offsetY / rect.height, 0), 1) : 0.5;

      setDesktops((prev) => {
        const activeIndex = prev.findIndex(
          (item) => item.id === draggedDesktopId,
        );
        const overIndex = prev.findIndex((item) => item.id === overId);

        if (activeIndex === -1 || overIndex === -1) {
          return prev;
        }

        const next = [...prev];
        const [moved] = next.splice(activeIndex, 1);

        const movingDown = activeIndex < overIndex;
        let targetIndex = overIndex;

        if (movingDown) {
          if (pointerRatio < 0.25) {
            targetIndex = Math.max(overIndex - 1, 0);
          } else {
            targetIndex = overIndex;
          }
        } else {
          if (pointerRatio > 0.75) {
            targetIndex = Math.min(overIndex + 1, next.length);
          } else {
            targetIndex = overIndex;
          }
        }

        if (targetIndex < 0) {
          targetIndex = 0;
        }
        if (targetIndex > next.length) {
          targetIndex = next.length;
        }

        if (targetIndex === activeIndex) {
          return prev;
        }

        next.splice(targetIndex, 0, moved);
        setOrderChanged(!isSameOrder(next, originalOrderRef.current));
        return next;
      });

      setDraggedDesktopId(null);
    },
    [draggedDesktopId],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedDesktopId(null);
  }, []);

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
    setDesktops((prev) => {
      const next = [newDesktop, ...prev];
      originalOrderRef.current = next.map((item) => item.id);
      setOrderChanged(false);
      return next;
    });
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

  const canDeleteDesktop = desktops.length > 1 && !orderChanged;
  const canAddDesktop = isEdit && desktops.length < MAX_DESKTOP_COUNT;

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

      if (res.status === 500) {
        throw Error("エラー");
      }

      const data = await res.json();
      const deletedId = data.id;

      if (deletedId) {
        setDesktops((prev) => {
          const updated = prev.filter((desktop) => desktop.id !== deletedId);
          if (deletedId === tabId) {
            void setTabId(updated[0]?.id ?? null);
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
        id,
      },
      json: {
        name,
      },
    });
    const data = await res.json();
    handleDesktopUpdate(data.id, { name: data.name });
  };

  const handleDialogSubmit = async (name: string) => {
    if (dialogState.mode === "create") {
      await createDesktop(name);
    } else if (dialogState.targetDesktopId) {
      await renameDesktop(dialogState.targetDesktopId, name);
    }
  };

  const handleSaveOrder = async () => {
    setIsLoading(true);
    const orderedIds = desktops.map((desktop) => desktop.id);
    await authedHono.api.desktops["save-order"].$post({
      json: {
        desktopIds: orderedIds,
      },
    });
    setIsLoading(false);
    originalOrderRef.current = orderedIds;
    setOrderChanged(false);
  };

  const handleDownloadDesktop = () => {
    const targetId = tabContextMenu.desktopId;
    if (!targetId) {
      hideTabContextMenu();
      return;
    }

    const desktop = desktops.find((d) => d.id === targetId);
    if (!desktop) {
      hideTabContextMenu();
      return;
    }

    const textContent = buildDesktopExport(desktop);
    const blob = new Blob([textContent], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${sanitizeFileName(desktop.name)}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    hideTabContextMenu();
  };

  return (
    <div
      className="relative transition-[padding-right] duration-300 ease-in-out bg-gray-100"
      style={{ paddingRight: isPinned ? `${PINNED_PANEL_WIDTH}px` : 0 }}
    >
      <div
        className={[
          "fixed bottom-0 top-0 px-7 right-0 z-6000 flex w-[270px] rounded-l-2xl  flex-col gap-3 border-black/5 bg-white/90 py-6 backdrop-blur transition-all duration-300 ease-in-out will-change-transform",
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
          className="mb-2 cursor-pointer flex h-9 w-9 items-center justify-center rounded-lg text-black/70 transition duration-200 ease-out hover:scale-105 hover:bg-gray-800/10"
          aria-label={isPinned ? "Unpin tab panel" : "Pin tab panel"}
          aria-pressed={isPinned}
        >
          {isPinned ? <PinOff size={19} /> : <Pin size={19} />}
        </button>
        <div
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto"
          role="tablist"
          aria-label="Virtual desktops"
          aria-orientation="vertical"
        >
          {desktops.map((d) => {
            const background = backgroundOptions.find(
              (opt) => opt.name === d.background,
            )?.value;
            const isActiveDesktop = d.id === current.id;

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
                aria-selected={isActiveDesktop}
                draggable
                ref={(node) => {
                  if (node) {
                    itemRefs.current.set(d.id, node);
                    node.style.willChange = "transform";
                  } else {
                    itemRefs.current.delete(d.id);
                  }
                }}
                onClick={(event) => {
                  void setTabId(d.id);
                  if (event.detail !== 0) {
                    setHasKeyboardFocus(false);
                  }
                }}
                onDragStart={(event) => handleDragStart(event, d.id)}
                onDragOver={handleDragOverTab}
                onDrop={(event) => handleDropOnTab(event, d.id)}
                onDragEnd={handleDragEnd}
                onContextMenu={(event) => {
                  if (!isEdit) return;
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
                  "group cursor-grab text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                  isActiveDesktop ? " text-black" : "text-black/70",
                  draggedDesktopId === d.id ? "cursor-grabbing opacity-70" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className="relative h-30 mb-1">
                  <div
                    className={["w-full h-full rounded-2xl transition-colors"]
                      .filter(Boolean)
                      .join(" ")}
                    style={getBackgroundStyle()}
                  />
                  {isActiveDesktop && (
                    <div className="absolute inset-0 flex rounded-2xl items-center justify-center bg-blue-500/20">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black">
                        <Check width={17} height={17} color="white" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3">
                    {!d.isPublic && (
                      <Lock strokeWidth={2} size={20} color="white" />
                    )}
                  </div>
                </div>
                <p className="text-center">{truncate(d.name, 10)}</p>
              </button>
            );
          })}
        </div>
        {orderChanged ? (
          <Button
            type="button"
            onClick={handleSaveOrder}
            disabled={isLoading}
            className="flex h-9 items-center cursor-pointer justify-center rounded-full text-sm font-semibold text-white"
          >
            {isLoading && (
              <Loader2 className="animate-spin" width={15} height={15} />
            )}{" "}
            Save order
          </Button>
        ) : null}
        {canAddDesktop && (
          <Button
            type="button"
            onClick={handleAddDesktop}
            className="flex h-9 bg-white cursor-pointer items-center justify-center rounded-full border border-black/10 text-black/70 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            aria-label="Add desktop"
          >
            <Plus size={16} />
          </Button>
        )}
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
        panelOffsetRight={isPinned ? PINNED_PANEL_WIDTH : 0}
        usePinnedLayout={isPinned}
      />
      <TabContextMenu
        ref={contextMenuRef}
        visible={tabContextMenu.visible}
        position={menuPosition}
        onDownload={handleDownloadDesktop}
        onEdit={handleEditDesktopRequest}
        onDelete={handleDeleteDesktopRequest}
        showDelete={canDeleteDesktop}
      />
    </div>
  );
}
