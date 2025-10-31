import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type {
  AppLayoutSchemaType,
  BackgroundOptionType,
  FontOptionType,
} from "@/server/schemas/desktop.schema";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  osName: text("osName").unique(),
});

export const desktop = sqliteTable(
  "desktop",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => user.id, {
        onDelete: "no action",
        onUpdate: "no action",
      }),

    name: text("name").notNull().default("名称未設定"),
    isPublic: integer("isPublic", { mode: "boolean" }).notNull().default(false),
    background: text("background")
      .$type<BackgroundOptionType>()
      .notNull()
      .default("SUNSET"),
    font: text("font").$type<FontOptionType>().notNull().default("INTER"),
    orderIndex: integer("order_index").notNull().default(0),
    state: text("state", {
      mode: "json",
    })
      .$type<AppLayoutSchemaType>()
      .notNull()
      .default(sql`'{"apps":[],"appPositions":{},"folderContents":{}}'`),
    createdAt: integer("creaxted_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    // 最小限の JSON ガード
    check("desktop_state_json_valid", sql`json_valid(${t.state}) = 1`),
    check(
      "desktop_state_shape",
      sql`
      json_type(${t.state}, '$.apps') = 'array' AND
      json_type(${t.state}, '$.appPositions') = 'object' AND
      json_type(${t.state}, '$.folderContents') = 'object'
    `,
    ),
    // クエリ・制約
    index("idx_desktop_user_order").on(t.userId, t.orderIndex),
    uniqueIndex("uq_desktop_user_order").on(t.userId, t.orderIndex),
  ],
);

export const desktopRelations = relations(desktop, ({ one }) => ({
  user: one(user, { fields: [desktop.userId], references: [user.id] }),
}));

export const userRelations = relations(user, ({ many }) => ({
  desktops: many(desktop),
}));

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp_ms",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp_ms",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});
