import { ArrowRight } from "lucide-react";
import { Lilita_One } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Safari } from "@/components/magicui/safari";
import { env } from "@/env";
import { getTranslation } from "@/i18n/server";
import { Button } from "../../ui/button";
import Container from "../layout/Container";
import SeparatedWave from "../shared/SeparatedWave";
import StarryBackdrop2 from "../shared/StarryBackdrop2";
import Title from "./Title";

export const litteOne = Lilita_One({ subsets: ["latin"], weight: "400" });

type Props = {
  lang: string;
};

export default async function Hero({ lang }: Props) {
  const { t } = await getTranslation(lang);
  const getStarted = t("get_started");

  return (
    <div className="relative flex flex-col pt-[87px] justify-end overflow-hidden bg-black">
      <StarryBackdrop2 />
      <Container>
        <div className="relative z-10 space-y-7 pb-20 text-center lg:pb-0">
          <h2
            className={`
                text-center 
                font-semibold 
                text-2xl
                 text-white 
                 sm:text-3xl 
                 md:text-4xl 
                 tracking-wide
                 ${litteOne.className}`}
          >
            <Title lang={lang} />
          </h2>
          <Button size="lg" className="rounded-xl px-5 py-4 text-md" asChild>
            <Link
              href={{
                pathname: `/${lang}/login`,
              }}
            >
              {getStarted} <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Safari
            url={`${env.NEXT_PUBLIC_APP_URL}/os/ospace`}
            className="mx-auto hidden h-[360px] max-w-[830px] lg:block"
            height={520}
            videoSrc="/heromv.mp4"
          />
        </div>
      </Container>
      <Image
        src="/lp/astro.avif"
        width={205}
        height={100}
        alt="astro"
        className="-bottom-[15px] absolute right-[100px] z-10 hidden xl:block"
      />
      <Image
        src="/lp/rocket.avif"
        width={305}
        height={100}
        alt="rocket"
        className="absolute bottom-0 left-0 z-10 hidden xl:block"
      />
      <SeparatedWave color="#111827" />
    </div>
  );
}
