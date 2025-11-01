"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/i18n/client";
import { authClient } from "@/lib/auth-client";
import Header from "../lp/layout/Header";
import LoginAgreement from "./LoginAgreement";
import SectionTitle from "./shared/SectionTitle";

type Props = {
  lang: string;
};

export default function LoginWrapper({ lang }: Props) {
  const { t } = useTranslation(lang);
  const title = t("login.title");
  const desc = t("login.desc");
  const btn = t("login.btn");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/enter/callback/welcome",
      });
    } catch (error) {
      console.error("Login error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-black">
      <Header />
      <div className="flex min-h-[calc(100dvh-70px)] items-center justify-center px-4">
        <div>
          <SectionTitle title={title} desc={desc} />

          <Button
            onClick={handleSubmit}
            className="itmes-center cursor-pointer relative z-20 mx-auto mb-5 flex w-full gap-3 rounded-xl"
            type="button"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" width={15} height={15} />
            ) : (
              <Image src="/google.avif" width={15} height={15} alt="google" />
            )}
            {btn}
          </Button>
          <LoginAgreement lang={lang} />
        </div>
      </div>
    </div>
  );
}
