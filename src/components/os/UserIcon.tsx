"use client";

import {
  ArrowRight,
  Check,
  CircleUserRound,
  Leaf,
  LogIn,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { signOut } from "@/lib/auth-client";
import type { FontOptionType } from "@/server/schemas/desktop.schema";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import type { CurrentUserType } from "./types";

type Props = {
  userName?: string;
  loginUserOsName?: string;
  isPublic: boolean;
  currentUserInfo: CurrentUserType;
  getFontStyle: (newFont: FontOptionType) => void;
  currentFont: FontOptionType;
  osName: string;
};

export const UserIcon = ({ isPublic, currentUserInfo, osName }: Props) => {
  const router = useRouter();
  const handleSignOut = async () => {
    try {
      await signOut(isPublic);
    } catch {
      toast("Failed to sign out. Please try again.", {
        style: { color: "#dc2626" },
      });
    }
  };
  function truncate(str: string, max = 5) {
    return str.length > max ? `${str.slice(0, max)}…` : str;
  }

  const [isOpen, setIsOpen] = useState(false);

  const goToMyOspace = () => {
    if (currentUserInfo?.osName !== osName) {
      router.push(`/os/${currentUserInfo?.osName}`);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-[60px] left-10 z-50 flex items-center gap-1 rounded-3xl bg-white/90 p-1">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger
          asChild
          className="outline-none focus:outline-none"
        >
          <Avatar>
            <AvatarImage
              src={currentUserInfo?.icon ?? undefined}
              alt="User Avatar"
            />
            <AvatarFallback>
              <CircleUserRound size={40} color="gray" strokeWidth={1.2} />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="min-w-[150px] gap-2 rounded-xl border-0 bg-white p-0 text-sm"
          align="start"
          sideOffset={15}
        >
          <div className="m-0 w-[150px]">
            {currentUserInfo?.osName && currentUserInfo?.name ? (
              <div className="p-1">
                <div className="flex w-full items-center justify-between px-2 py-2">
                  <CircleUserRound size={17} />
                  {truncate(currentUserInfo.name, 7)}
                </div>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-gray-800 text-md uppercase transition-colors hover:bg-gray-800/10"
                  onClick={() => goToMyOspace()}
                >
                  <p>{truncate(currentUserInfo.osName, 7)}</p>
                  {currentUserInfo?.osName === osName ? (
                    <Check size={17} />
                  ) : (
                    <ArrowRight size={17} />
                  )}
                </button>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-red-600 text-sm transition-colors hover:bg-red-600/10"
                  onClick={() => handleSignOut()}
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="p-1">
                <Link
                  href="/login"
                  className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-gray-800 text-md transition-colors hover:bg-gray-800/10"
                >
                  <LogIn size={15} />
                  Sign In
                </Link>
                <button
                  type="button"
                  className=" flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-gray-800 text-md transition-colors hover:bg-gray-800/10"
                  onClick={() => router.push("/")}
                >
                  <Leaf size={15} />
                  Top Page
                </button>
              </div>
            )}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
