"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { DesktopStateType } from "@/server/schemas/desktop.schema";
import Desktop from "./Desktop";
import CreateVirtualDesktopDialog from "./dialog/CreateVirtualDesktopDialog";
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
  const [visible, setVisible] = useState(false);

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

  if (desktops.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        デスクトップがありません。
      </div>
    );
  }

  const current = desktops.find((d) => d.id === tabId) ?? desktops[0];

  const handleAddDesktop = async () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  const updateDesktop = (newDesktop: DesktopWithoutDates) => {
    setDesktops([...desktops, newDesktop]);
  };

  return (
    <div className="overflow-hidden">
      {/* タブ群 */}
      <div
        className="flex h-[30px]"
        role="tablist"
        aria-label="Virtual desktops"
      >
        {desktops.map((d) => (
          <button
            key={d.id}
            type="button"
            role="tab"
            aria-selected={d.id === current.id}
            onClick={() => setTabId(d.id)}
            className={[
              "px-5 border-r",
              d.id === current.id ? "bg-gray-100" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {d.name}
          </button>
        ))}
        <button type="button" onClick={handleAddDesktop}>
          <Plus size={17} />
        </button>
      </div>
      <Desktop
        key={current.id}
        desktopById={current}
        osName={osName}
        onDesktopUpdate={handleDesktopUpdate}
        isEdit={isEdit}
        currentUser={currentUser}
      />
      <CreateVirtualDesktopDialog
        visible={visible}
        onClose={onClose}
        updateDesktop={updateDesktop}
      />
    </div>
  );
}
