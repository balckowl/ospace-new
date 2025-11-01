import type { InferOutput } from "valibot";
import type {
  AppUnionType,
  currentUserSchema,
} from "@/server/schemas/desktop.schema";

export interface MemoNameDialog {
  visible: boolean;
  position: GridPosition | null;
  folderId: string | null;
}

export interface AppUrlDialog {
  visible: boolean;
  position: GridPosition | null;
  folderId: string | null;
}

export interface FolderNameDialog {
  visible: boolean;
  position: GridPosition | null;
  folderId: string | null;
}

export interface SelectStampDialog {
  visible: boolean;
  position: GridPosition | null;
}

export interface EditDialog {
  visible: boolean;
  app: AppIcon | null;
  newName: string;
  newUrl?: string;
  newContent: string;
  newColor: string;
}

type HexColor = AppUnionType["color"];

export type AppIcon = AppUnionType;
export interface MemoWindowType {
  id: string;
  title: string;
  content: string;
  color: HexColor;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}
export interface HelpWindowType {
  visible: boolean;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface BrowserWindowType {
  id: string;
  title: string;
  favicon: string | undefined;
  url: string;
  color: HexColor;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface FolderWindowType {
  id: string;
  title: string;
  color: HexColor;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface GridPosition {
  row: number;
  col: number;
}

export interface ContextMenuType {
  visible: boolean;
  x: number;
  y: number;
  position: GridPosition | null;
  existingApp?: AppIcon | null;
  folderId?: string | null;
}

export type CurrentUserType = InferOutput<typeof currentUserSchema> | null;
