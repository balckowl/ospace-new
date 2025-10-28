import Image from "next/image";
import { env } from "@/env";
import type { BackgroundOptionType } from "@/server/schemas/desktop.schema";

export type BackgroundOptionsType = {
  id: string;
  name: BackgroundOptionType;
  value: string;
  preview: React.ReactNode;
};

export const backgroundOptions: BackgroundOptionsType[] = [
  {
    id: "default",
    name: "DEFAULT",
    value: "linear-gradient(to bottom right,#60A5FA,#2563EB,#6B21A8)",
    preview: (
      <div className="h-full w-full rounded bg-linear-to-br from-blue-400 via-blue-600 to-purple-800" />
    ),
  },
  {
    id: "warm",
    name: "WARM",
    value: "linear-gradient(to bottom right,#FACC15,#F97316,#DC2626)",
    preview: (
      <div className="h-full w-full rounded bg-linear-to-br from-yellow-400 via-orange-500 to-red-600" />
    ),
  },
  {
    id: "green",
    name: "GREEN",
    value: "linear-gradient(to bottom right, #4ADE80, #22C55E, #16A34A)",
    preview: (
      <div className="h-full w-full rounded bg-linear-to-br from-green-400 via-green-500 to-green-600" />
    ),
  },
  {
    id: "black",
    name: "BLACK",
    value: "linear-gradient(to bottom right,#000)",
    preview: <div className="h-full w-full rounded bg-black" />,
  },
  {
    id: "sunset",
    name: "SUNSET",
    value: `${env.NEXT_PUBLIC_APP_URL}/os/background/sunset.png`,
    preview: (
      <Image
        src="/os/background/sunset.png"
        alt="Ocean Waves"
        className="h-full w-full rounded object-cover"
        width={500}
        height={300}
        priority
      />
    ),
  },
  {
    id: "station",
    name: "STATION",
    value: `${env.NEXT_PUBLIC_APP_URL}/os/background/station.png`,
    preview: (
      <Image
        src="/os/background/station.png"
        alt="Ocean Waves"
        className="h-full w-full rounded object-cover"
        width={500}
        height={300}
        priority
      />
    ),
  },
  {
    id: "ocean",
    name: "OCEAN",
    value: `${env.NEXT_PUBLIC_APP_URL}/os/background/sky.png`,
    preview: (
      <Image
        src="/os/background/sky.png"
        alt="Ocean Waves"
        className="h-full w-full rounded object-cover"
        width={500}
        height={300}
        priority
      />
    ),
  },
  {
    id: "sakura",
    name: "SAKURA",
    value: `${env.NEXT_PUBLIC_APP_URL}/os/background/sakura.png`,
    preview: (
      <Image
        src="/os/background/sakura.png"
        alt="Ocean Waves"
        className="h-full w-full rounded object-cover"
        width={500}
        height={300}
        priority
      />
    ),
  },
  {
    id: "mountain",
    name: "MOUNTAIN",
    value: `${env.NEXT_PUBLIC_APP_URL}/os/background/mountain.png`,
    preview: (
      <Image
        src="/os/background/mountain.png"
        alt="Ocean Waves"
        className="h-full w-full rounded object-cover"
        width={500}
        height={300}
        priority
      />
    ),
  },
];
