import { Folder, type LucideProps, StickyNote } from "lucide-react";
import type { ReactElement } from "react";

type AppListItem =
  | { type: "image"; icon: string; name: string }
  | { type: "icon"; icon: ReactElement<LucideProps>; name: string };

export const APPLIST: AppListItem[] = [
  {
    type: "image",
    name: "youtube",
    icon: "/lp/youtube.avif",
  },
  {
    type: "icon",
    name: "notes",
    icon: <StickyNote size={40} />,
  },
  {
    type: "image",
    name: "twitter",
    icon: "/lp/twitter.avif",
  },
  {
    type: "image",
    name: "github",
    icon: "/lp/github.avif",
  },
  {
    type: "icon",
    name: "folder",
    icon: <Folder size={40} />,
  },
];
