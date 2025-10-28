import { Lock, LockOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { authedHono } from "@/lib/hono-client";
import type { FontOptionType } from "@/server/schemas/desktop.schema";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type Props = {
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  getFontStyle: (newFont: FontOptionType) => void;
  currentFont: FontOptionType;
  desktopId: string;
};

export const PublicSelector = ({ isPublic, setIsPublic, desktopId }: Props) => {
  const [open, setOpen] = useState(false);

  const handleChange = async (select: boolean) => {
    if (select === isPublic) return;
    try {
      const res = await authedHono.api.desktop[":desktopId"].visibility.$put({
        param: {
          desktopId,
        },
        json: {
          isPublic: select,
          id: desktopId,
        },
      });
      if (!res.ok) {
        toast("Failed to change public information", {
          style: { color: "#dc2626" },
          icon: select === true ? <LockOpen size={19} /> : <Lock size={19} />,
        });
      }
      toast("Public information has been changed", {
        icon: select === true ? <LockOpen size={19} /> : <Lock size={19} />,
      });
      setIsPublic(select);
      setOpen(false);
    } catch (e) {
      toast("Failed to change public information", {
        style: { color: "#dc2626" },
        icon: select === true ? <LockOpen size={19} /> : <Lock size={19} />,
      });
      console.error("Failed to update visibility:", e);
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          toast.dismiss();
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full text-sm text-white hover:bg-white/20"
        >
          {isPublic ? (
            <LockOpen width={17} height={17} />
          ) : (
            <Lock width={17} height={17} />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[150px] rounded-xl bg-white/90 px-3.5 py-2 shadow-xl"
        align="center"
        sideOffset={16}
      >
        <div className="text-sm">
          <div className="grid grid-cols-3 gap-3">
            <RadioGroup
              value={isPublic ? "Public" : "Private"}
              onValueChange={(value) => handleChange(value === "Public")}
            >
              <div>
                <label
                  htmlFor="public"
                  className="flex cursor-pointer items-center gap-2 py-0.5"
                >
                  <RadioGroupItem value="Public" id="public" color="#3b250a" />
                  <span className="text-sm">Public</span>
                </label>
              </div>
              <div>
                <label
                  htmlFor="private"
                  className="flex cursor-pointer items-center gap-2 py-0.5"
                >
                  <RadioGroupItem value="Private" id="private" />
                  <span className="text-sm">Private</span>
                </label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
