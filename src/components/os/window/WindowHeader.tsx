import type { ReactNode } from "react";
import type { FontOption } from "@/db/schema";

type Props = {
  children: ReactNode;
  title: string;
  currentFont: FontOption;
  getFontStyle: (newFont: FontOption) => void;
  accentColor?: string;
};

export default function WindowHeader({
  children,
  title,
  currentFont,
  getFontStyle,
  accentColor,
}: Props) {
  const hasAccent = Boolean(accentColor);

  return (
    <div
      className={`${getFontStyle(currentFont)} window-header flex h-10 cursor-grab items-center justify-between px-2 backdrop-blur-lg active:cursor-grabbing ${hasAccent ? "text-black" : "bg-white/90"}`}
      style={hasAccent ? { background: accentColor ?? undefined } : undefined}
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
