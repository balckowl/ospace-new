"use client";

import { Leaf, LogOut, TriangleAlert } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTranslation } from "@/i18n/client";
import { signOut } from "@/lib/auth-client";
import Container from "../lp/layout/Container";
import { Button } from "../ui/button";

type Props = {
  isEdit: boolean;
  lang: string;
};

export default function LockMobileView({ isEdit, lang }: Props) {
  const router = useRouter();
  const { t } = useTranslation(lang);
  const handleSignOut = async () => {
    try {
      await signOut(false);
    } catch (error) {
      toast("Failed to sign out. Please try again.", {
        style: { color: "#dc2626" },
      });
    }
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <img
        src="/lockview-bg-img.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain object-center"
        draggable={false}
      />
      <div className="pointer-events-none absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <Container>
        <div className="relative z-10 flex h-[100dvh] items-center justify-center text-white">
          <div className="text-center">
            <TriangleAlert width={35} height={35} className="mx-auto mb-3" />
            <p className="mb-3">This screen size is not supported.</p>
            {isEdit ? (
              <Button className="rounded-xl" onClick={() => handleSignOut()}>
                <LogOut size={15} className="mr-1" />
                {t("sign_out")}
              </Button>
            ) : (
              <Button
                className="rounded-xl"
                onClick={() => router.push("/" as Route)}
              >
                <Leaf size={15} />
                {t("top_page")}
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
