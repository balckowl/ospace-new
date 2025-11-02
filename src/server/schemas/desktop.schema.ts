import * as v from "valibot";

const IconKey = v.picklist(["StickyNote", "Globe", "FolderIcon"] as const);

const BackgroundOption = v.picklist([
  "DEFAULT",
  "WARM",
  "GREEN",
  "BLACK",
  "SUNSET",
  "STATION",
  "OCEAN",
  "SAKURA",
  "MOUNTAIN",
] as const);

export const FontOption = v.picklist([
  "INTER",
  "ALEGREYA",
  "LOBSTER",
  "ALLAN",
  "COMFORTAA",
  "LORA",
] as const);

export const HexColor = v.pipe(
  v.string(),
  v.regex(
    /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/,
    "Color must be #RGB or #RRGGBB.",
  ),
);

export const StampType = v.picklist([
  "astro-5",
  "astro-3",
  "astro-2",
  "astro",
  "browser",
  "rocket",
  "lock",
  "star",
  "stamp-1",
  "astro-6",
  "wakusei",
  "stamp-2",
  "astro-7",
  "astro-8",
  "stamp-3",
  "wakusei-2",
  "wakusei-3",
  "wakusei-4",
  "astro-9",
  "astro-10",
  "astro-11",
  "astro-12",
] as const);

const AppItemBase = v.object({
  id: v.string(),
  iconKey: IconKey,
  color: HexColor,
});

export const WebsiteOnly = v.strictObject({
  type: v.literal("website"),
  name: v.pipe(v.string(), v.minLength(0), v.maxLength(32)),
  url: v.pipe(v.string(), v.url("Invalid URL")),
  favicon: v.pipe(v.string(), v.url("Invalid URL")),
});

const FolderOnly = v.strictObject({
  type: v.literal("folder"),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(30)),
});

const MemoOnly = v.strictObject({
  type: v.literal("memo"),
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(30)),
  content: v.string(),
});

export const StampOnly = v.strictObject({
  type: v.literal("stamp"),
  stampType: StampType,
  stampText: v.pipe(v.string(), v.maxLength(20)),
});

export const WebsiteApp = v.object({
  ...AppItemBase.entries,
  ...WebsiteOnly.entries,
});
export const FolderApp = v.object({
  ...AppItemBase.entries,
  ...FolderOnly.entries,
});
export const MemoApp = v.object({
  ...AppItemBase.entries,
  ...MemoOnly.entries,
});
export const StampApp = v.object({
  ...AppItemBase.entries,
  ...StampOnly.entries,
});

export const AppUnion = v.union([WebsiteApp, FolderApp, MemoApp, StampApp]);

export const Position = v.object({
  row: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(8)),
  col: v.pipe(v.number(), v.integer(), v.minValue(0), v.maxValue(5)),
});

export const AppPositions = v.record(v.string(), Position);
export const FolderContets = v.record(v.string(), v.array(v.string()));

export const AppLayoutStateSchema = v.object({
  appItems: v.array(AppUnion),
  appPositions: AppPositions,
  folderContents: FolderContets,
});

export const AppLayoutSchema = v.pipe(
  AppLayoutStateSchema,
  v.partialCheck(
    [["appItems"]],
    (input) => {
      const appIds = input.appItems.map((a) => a.id);
      const uniqueIds = new Set(appIds);
      return appIds.length === uniqueIds.size;
    },
    "Duplicate app ids found",
  ),
  v.partialCheck(
    [["appItems"], ["appPositions"], ["folderContents"]],
    (input) => {
      const appIds = input.appItems.map((a) => a.id);
      const childIds = Object.values(input.folderContents).flat();
      const rootIds = appIds.filter((id) => !childIds.includes(id));
      const posIds = Object.keys(input.appPositions);
      const missing = rootIds.filter((id) => !posIds.includes(id));
      return missing.length === 0;
    },
    "Missing positions for root apps",
  ),
  v.partialCheck(
    [["appItems"], ["appPositions"], ["folderContents"]],
    (input) => {
      const appIds = input.appItems.map((a) => a.id);
      const childIds = Object.values(input.folderContents).flat();
      const rootIds = appIds.filter((id) => !childIds.includes(id));
      const posIds = Object.keys(input.appPositions);
      const extra = posIds.filter((id) => !rootIds.includes(id));
      return extra.length === 0;
    },
    "Positions contain non-root app ids",
  ),
  v.partialCheck(
    [["appItems"], ["folderContents"]],
    (input) => {
      const byId = new Map(input.appItems.map((a) => [a.id, a]));
      for (const folderId of Object.keys(input.folderContents)) {
        const folder = byId.get(folderId);
        if (!folder || folder.type !== "folder") {
          return false;
        }
      }
      return true;
    },
    "folderContents key is not a folder app",
  ),
  v.partialCheck(
    [["appItems"], ["folderContents"]],
    (input) => {
      const appIds = new Set(input.appItems.map((a) => a.id));
      for (const children of Object.values(input.folderContents)) {
        for (const childId of children) {
          if (!appIds.has(childId)) {
            return false;
          }
        }
      }
      return true;
    },
    "Unknown child ids in folderContents",
  ),
  v.partialCheck(
    [["appPositions"]],
    (input) => {
      const coords = Object.values(input.appPositions).map(
        (p) => `${p.row},${p.col}`,
      );
      const uniqueCoords = new Set(coords);
      return coords.length === uniqueCoords.size;
    },
    "Duplicate coordinates found",
  ),
);

export const DesktopSchema = v.object({
  id: v.string(),
  state: AppLayoutSchema,
  name: v.pipe(v.string(), v.minLength(2), v.maxLength(15)),
  isPublic: v.boolean(),
  background: BackgroundOption,
  font: FontOption,
  orderIndex: v.pipe(v.number(), v.integer(), v.minValue(0)),
  createdAt: v.date(),
  updatedAt: v.date(),
});

export const DesktopListSchema = v.array(DesktopSchema);

export const currentUserSchema = v.object({
  name: v.nullable(v.string()),
  osName: v.nullable(v.string()),
  icon: v.nullable(v.pipe(v.string(), v.url())),
});

export const GetDesktopStateResponse = v.object({
  desktopList: DesktopListSchema,
  isEdit: v.boolean(),
  currentUser: currentUserSchema,
});

export const osNameFormInput = v.object({
  osName: v.pipe(
    v.string(),
    v.minLength(2, "3文字以上にしてください"),
    v.maxLength(10, "20文字以下にしてください"),
    v.regex(
      /^[a-z](?:[a-z-]*[a-z])?$/,
      "小文字英数とハイフンのみ。先頭末尾は英数。",
    ),
  ),
});

export const osNameInput = v.object({
  osName: v.string(),
});

export const SaveOrderIds = v.object({
  desktopIds: v.pipe(v.array(v.string()), v.minLength(1)),
});

export type IconKeyType = v.InferOutput<typeof IconKey>;
export type FontOptionType = v.InferOutput<typeof FontOption>;
export type BackgroundOptionType = v.InferOutput<typeof BackgroundOption>;
export type StampTypeType = v.InferOutput<typeof StampType>;

export type MemoAppType = v.InferOutput<typeof MemoApp>;
export type FolderAppType = v.InferOutput<typeof FolderApp>;
export type WebsiteAppType = v.InferOutput<typeof WebsiteApp>;
export type AppUnionType = v.InferOutput<typeof AppUnion>;
export type AppLayoutSchemaType = v.InferOutput<typeof AppLayoutSchema>;
export type DesktopStateType = v.InferOutput<typeof DesktopSchema>;

export type GetDesktopStateResponseType = v.InferOutput<
  typeof GetDesktopStateResponse
>;

export const StateInput = v.pick(DesktopSchema, ["id", "state"]);
export const CreateDesktopInput = v.pick(DesktopSchema, ["name"]);
export const VisibilityInput = v.pick(DesktopSchema, ["id", "isPublic"]);
export const BackgroundInput = v.pick(DesktopSchema, ["id", "background"]);
export const FontInput = v.pick(DesktopSchema, ["id", "font"]);
export const DesktopId = v.pick(DesktopSchema, ["id"]);
export const DesktopNameInput = v.pick(DesktopSchema, ["name"]);
