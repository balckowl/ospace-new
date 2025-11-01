import { AppWindow, Info, SquareArrowOutUpRight } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { useLanguage, useTranslation } from "@/i18n/client";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

type Props = {
  getHelpWindow: () => void;
};

export const HelpSelector = ({ getHelpWindow }: Props) => {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const { t } = useTranslation(language);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm text-white hover:bg-white/20"
        >
          <Info size={18} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[185px] rounded-xl border-0 bg-white/90 px-1 py-1 shadow-xl"
        align="center"
        sideOffset={15}
      >
        <ul>
          <li>
            <Link
              href={"/os/ospace" as Route}
              className="flex w-full   sitems-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-gray-800/10"
            >
              {t("help_selector.changelog")}
              <SquareArrowOutUpRight size={14} />
            </Link>
          </li>

          <li>
            <button
              type="button"
              onClick={() => {
                getHelpWindow();
                setOpen(false);
              }}
              className="flex w-full  items-center justify-between rounded-lg px-2.5 py-1.5 text-sm hover:bg-gray-800/10"
            >
              {t("help_selector.instructions")}
              <AppWindow size={14} />
            </button>
          </li>
        </ul>
      </PopoverContent>
    </Popover>
  );
};
