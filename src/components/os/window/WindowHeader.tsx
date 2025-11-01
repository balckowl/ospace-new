import type { ReactNode } from "react";
import type { FontOptionType } from "@/server/schemas/desktop.schema";

type Props = {
  children: ReactNode;
  title: string;
  currentFont: FontOptionType;
  getFontStyle: (newFont: FontOptionType) => void;
  accentColor?: string;
};

export default function WindowHeader({
  children,
  title,
  currentFont,
  getFontStyle,
}: Props) {
  return (
    <div
      className={`${getFontStyle(currentFont)} window-header flex h-10 cursor-grab items-center justify-between px-2 backdrop-blur-lg bg-white/90`}
    >
      <div className="flex items-center">
        <div className="rounded-sm px-2 font-bold text-black text-sm">
          {title}
        </div>
      </div>

      {children}
    </div>
  );
}
