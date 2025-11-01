import type { CSSProperties } from "react";
import type { DesktopStateType } from "@/server/schemas/desktop.schema";
import type { AppIcon, GridPosition } from "../types";

export type DesktopApp = DesktopStateType["state"]["appItems"][number];

export const mapDesktopAppToAppIcon = (app: DesktopApp): AppIcon => {
  switch (app.type) {
    case "website":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        name: app.name,
        type: "website",
        url: app.url,
        favicon: app.favicon,
      };
    case "memo":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        name: app.name,
        type: "memo",
        content: app.content,
      };
    case "folder":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        name: app.name,
        type: "folder",
      };
    case "stamp":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "stamp",
        stampType: app.stampType,
        stampText: app.stampText,
      };
    default: {
      const _exhaustiveCheck: never = app;
      throw new Error(`Unhandled app type: ${_exhaustiveCheck}`);
    }
  }
};

export const mapAppIconToDesktopApp = (app: AppIcon): DesktopApp => {
  switch (app.type) {
    case "website":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "website",
        name: app.name,
        url: app.url ?? "",
        favicon: app.favicon ?? "",
      };
    case "memo":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "memo",
        name: app.name,
        content: app.content ?? "",
      };
    case "folder":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "folder",
        name: app.name,
      };
    case "stamp":
      return {
        id: app.id,
        iconKey: app.iconKey,
        color: app.color,
        type: "stamp",
        stampType: app.stampType,
        stampText: app.stampText ?? "",
      };
    default: {
      const _exhaustiveCheck: never = app;
      throw new Error(`Unhandled app type: ${_exhaustiveCheck}`);
    }
  }
};

export const cloneApps = (appsToClone: AppIcon[]) =>
  appsToClone.map((app) => ({ ...app }));

export const cloneAppPositions = (positions: Map<string, GridPosition>) =>
  new Map<string, GridPosition>(
    Array.from(positions.entries(), ([key, value]) => [key, { ...value }]),
  );

export const createFolderContentsMap = (data: Record<string, string[]>) =>
  new Map<string, string[]>(
    Object.entries(data).map(([key, value]) => [key, [...value]]),
  );

export const resolveAppColorStyles = (
  color: string,
): {
  className: string;
  style: CSSProperties | undefined;
} => {
  if (!color) {
    return { className: "", style: undefined };
  }

  if (color.startsWith("bg-")) {
    return { className: color, style: undefined };
  }

  return {
    className: "",
    style: { background: color },
  };
};

export const cloneFolderContents = (contents: Map<string, string[]>) =>
  new Map<string, string[]>(
    Array.from(contents.entries(), ([key, value]) => [key, [...value]]),
  );

export const mapEntriesToJson = (contents: Map<string, string[]>) =>
  JSON.stringify(
    Array.from(contents.entries(), ([key, value]) => [key, [...value]]),
  );
