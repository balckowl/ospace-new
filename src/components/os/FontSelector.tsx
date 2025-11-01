import { Check, Type } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLanguage, useTranslation } from "@/i18n/client";
import { authedHono } from "@/lib/hono-client";
import type { FontOptionType } from "@/server/schemas/desktop.schema";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
  onFontChange: (newFont: FontOptionType) => void;
  currentFont: FontOptionType;
  getFontStyle: (newFont: FontOptionType) => void;
  desktopId: string;
};

export const fontOptions: FontOptionType[] = [
  "INTER",
  "ALEGREYA",
  "ALLAN",
  "COMFORTAA",
  "LOBSTER",
  "LORA",
];

export const FontSelector = ({
  onFontChange,
  currentFont,
  getFontStyle,
  desktopId,
}: Props) => {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  const handleFontChange = async (newFont: FontOptionType) => {
    toast.dismiss();
    onFontChange(newFont);
    try {
      await authedHono.api.desktop[":desktopId"].font.$put({
        param: {
          desktopId: desktopId,
        },
        json: {
          font: newFont,
          id: desktopId,
        },
      });
      toast(t("success.font"), {
        icon: <Type size={17} />,
        className: "text-sm",
      });
      setOpen(false);
    } catch (e) {
      toast(t("failed.font"), {
        style: { color: "#dc2626" },
        icon: <Type size={17} />,
        className: "text-sm",
      });
      console.error("Failed to update visibility:", e);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm text-white hover:bg-white/20"
        >
          <Type size={17} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-[185px] rounded-xl border-0 bg-white/90 px-1 py-1 shadow-xl ${getFontStyle(currentFont)}`}
        align="center"
        sideOffset={15}
      >
        <ul>
          {fontOptions.map((font) => (
            <li key={font}>
              <button
                type="button"
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-gray-800/10 ${getFontStyle(font)}`}
                onClick={() => handleFontChange(font)}
                disabled={font === currentFont}
              >
                {font}
                {currentFont === font && <Check width={15} height={15} />}
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
