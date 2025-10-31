import { getTranslation } from "@/i18n/server";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { Button } from "../../ui/button";
import CoreFunctions from "../core-functions/CoreFunctions";
import Exprience from "../experience/Experience";
import Hero from "../hero/Hero";
import Footer from "../layout/Footer";
import Header from "../layout/Header";
import Recommend from "../recommend/Recommend";

type Props = {
  lang: string;
};

export default async function LpWrapper({ lang }: Props) {
  const { t } = await getTranslation(lang);
  const getStarted = t("get_started");

  return (
    <Fragment>
      <Header>
        <Button className="rounded-xl px-5 py-4 text-md" asChild>
          <Link href={{ pathname: `/${lang}/login` }}>
            {getStarted} <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </Header>
      <div className="h-[calc(70px+30px)] bg-[#0B0C10]" />
      <Hero lang={lang} />
      <CoreFunctions lang={lang} />
      <Exprience lang={lang} />
      <Recommend lang={lang} />
      <Footer />
    </Fragment>
  );
}
