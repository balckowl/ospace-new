"use client";

import Link from "next/link";
import { Trans } from "react-i18next";
import { useTranslation } from "@/i18n/client";

type Props = {
  lang: string;
};

export default function LoginAgreement({ lang }: Props) {
  const { t } = useTranslation(lang);
  return (
    <div className="mx-auto max-w-[380px] text-balance px-10 text-center text-white/50 text-xs leading-4 tracking-wide">
      <Trans
        t={t}
        i18nKey="login.agreement"
        components={[
          <Link
            href="/legal"
            className="underline underline-offset-1"
            key="link"
          />,
          <br key="br" />,
        ]}
      />
    </div>
  );
}
