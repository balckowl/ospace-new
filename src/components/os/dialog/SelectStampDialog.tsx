import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { StampTypeType } from "@/server/schemas/desktop.schema";

type StampOption = {
  name: StampTypeType;
  src: string;
  alt: string;
  type: "emoji" | "wakusei" | "original";
};

export const stampOptions: StampOption[] = [
  {
    name: "stamp-1",
    src: "/os/stamp/stamp-1.avif",
    alt: "stamp-1",
    type: "emoji",
  },
  {
    name: "stamp-2",
    src: "/os/stamp/stamp-2.avif",
    alt: "stamp-2",
    type: "emoji",
  },
  {
    name: "stamp-3",
    src: "/os/stamp/stamp-3.avif",
    alt: "stamp-3",
    type: "emoji",
  },
  {
    name: "astro-6",
    src: "/os/stamp/astro-6.avif",
    alt: "astro-6",
    type: "original",
  },
  {
    name: "astro-7",
    src: "/os/stamp/astro-7.avif",
    alt: "astro-7",
    type: "original",
  },
  {
    name: "astro-8",
    src: "/os/stamp/astro-8.avif",
    alt: "astro-8",
    type: "original",
  },
  {
    name: "astro-10",
    src: "/os/stamp/astro-10.avif",
    alt: "astro-10",
    type: "original",
  },
  {
    name: "astro-11",
    src: "/os/stamp/astro-11.avif",
    alt: "astro-11",
    type: "original",
  },
  {
    name: "astro-12",
    src: "/os/stamp/astro-12.avif",
    alt: "astro-12",
    type: "original",
  },
  {
    name: "wakusei-2",
    src: "/os/stamp/wakusei-2.avif",
    alt: "wakusei-2",
    type: "wakusei",
  },
  {
    name: "wakusei-3",
    src: "/os/stamp/wakusei-3.avif",
    alt: "wakusei-3",
    type: "wakusei",
  },
  {
    name: "wakusei-4",
    src: "/os/stamp/wakusei-4.avif",
    alt: "wakusei-4",
    type: "wakusei",
  },
  {
    name: "wakusei",
    src: "/os/stamp/wakusei.avif",
    alt: "wakusei",
    type: "wakusei",
  },
];

type Props = {
  dialogZIndex: number;
  visible: boolean;
  onSelectStamp: (stampId: string) => void;
  panelOffsetRight?: number;
  usePinnedLayout?: boolean;
};

export default function StampDialog({
  dialogZIndex,
  visible,
  onSelectStamp,
  panelOffsetRight = 0,
  usePinnedLayout = false,
}: Props) {
  const handleStampSelect = (stampId: string) => {
    onSelectStamp(stampId);
  };

  const stampTypes: Array<StampOption["type"]> = [
    "emoji",
    "wakusei",
    "original",
  ];
  const stampTypeLabels: Record<StampOption["type"], string> = {
    emoji: "Emoji",
    wakusei: "Wakusei",
    original: "Original",
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "dialog fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        usePinnedLayout && "p-6",
      )}
      style={{ zIndex: dialogZIndex, right: panelOffsetRight }}
    >
      <div
        className={cn(
          "stamp-dialog min-h-[270px] min-w-[450px] bg-white p-2.5 shadow-2xl",
          usePinnedLayout ? "rounded-3xl" : "rounded-xl",
        )}
      >
        <Tabs defaultValue={stampTypes[0]}>
          <TabsList className="mb-2 gap-2 bg-transparent p-0">
            {stampTypes.map((type) => (
              <TabsTrigger
                asChild
                key={type}
                value={type}
                className="h-10 w-10 flex-1 rounded-md bg-white p-0 font-medium text-sm transition-colors data-[state=active]:bg-black/10 data-[state=active]:text-white"
              >
                <button type="button">
                  {stampTypeLabels[type] === "Emoji" && (
                    <Image
                      src="/os/stamp/stamp-1.avif"
                      width={30}
                      height={30}
                      alt="emoji"
                    />
                  )}
                  {stampTypeLabels[type] === "Wakusei" && (
                    <Image
                      src="/os/stamp/wakusei-4.avif"
                      width={30}
                      height={30}
                      alt="wakusei"
                    />
                  )}
                  {stampTypeLabels[type] === "Original" && (
                    <Image
                      src="/os/stamp/astro-8.avif"
                      width={30}
                      height={30}
                      alt="original"
                    />
                  )}
                </button>
              </TabsTrigger>
            ))}
          </TabsList>

          {stampTypes.map((type) => (
            <TabsContent key={type} value={type}>
              <div className="grid grid-cols-4 gap-4 px-3">
                {stampOptions
                  .filter((stamp) => stamp.type === type)
                  .map((stamp) => (
                    <Image
                      key={stamp.name}
                      src={stamp.src}
                      width={80}
                      height={80}
                      alt={stamp.alt}
                      className="h-20 w-20 cursor-pointer rounded-md object-cover transition-transform hover:scale-105"
                      onClick={() => handleStampSelect(stamp.name)}
                    />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
