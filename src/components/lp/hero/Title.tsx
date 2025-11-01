"use client";
import { Trans } from "react-i18next";
import { AuroraText } from "@/components/ui/aurora-text";
import { useTranslation } from "@/i18n/client";

type Props = {
  lang: string;
};

export default function Title({ lang }: Props) {
  const { t } = useTranslation(lang);
  return (
    <Trans
      i18nKey="hero.title"
      t={t}
      components={[
        <AuroraText
          colors={["#FF7A00", "#FF8A00", "#FFD166", "#2563EB", "#8B5CF6"]}
          key="hl"
        />,
        <br key="br" />,
      ]}
    />
  );
}
