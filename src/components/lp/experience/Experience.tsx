import Image from "next/image";
import { getTranslation } from "@/i18n/server";
import SectionTitle from "../shared/SectionTitle";
import SeparatedWave from "../shared/SeparatedWave";
import StarryBackdrop2 from "../shared/StarryBackdrop2";
import { ArcadeEmbed } from "./ArcadeEmbed";

type Props = {
  lang: string;
};

export default async function Exprience({ lang }: Props) {
  const { t } = await getTranslation(lang);
  const title = t("try_the_demo.title");
  const desc = t("try_the_demo.desc");
  const clickHere = t("try_the_demo.click_here");

  return (
    <section className="relative bg-black px-4 pt-[50px] pb-[90px] md:pt-[120px] md:pb-[200px]">
      <StarryBackdrop2 />
      <div className="relative mx-auto max-w-[850px] z-4">
        <SectionTitle title={title} desc={desc} />

        <div className="overflow-hidden rounded-xl bg-white shadow-xl">
          <ArcadeEmbed />
        </div>
      </div>
      <SeparatedWave color="#ffffff" />
      <div className="-bottom-[30px] z-5 absolute flex flex-col items-center xl:bottom-0 xl:left-[200px]">
        <div className="-left-12 -rotate-10 relative bottom-3 mb-4 hidden rounded-2xl bg-white/90 px-4 py-2 font-semibold text-black text-sm shadow-lg xl:block">
          {clickHere}
          <span
            className="-translate-x-1/2 absolute top-full left-1/2 h-3 w-4 bg-white/90 [clip-path:polygon(0_0,100%_0,50%_100%)]"
            aria-hidden="true"
          />
        </div>
        <Image
          src="/lp/astro-4.avif"
          width={175}
          height={100}
          alt="astro"
          className="hidden xl:block"
        />
        <Image
          src="/lp/astro-4.avif"
          width={150}
          height={100}
          alt="astro"
          className="block xl:hidden"
        />
      </div>
    </section>
  );
}
