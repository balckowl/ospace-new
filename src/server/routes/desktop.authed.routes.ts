import { and, eq, inArray, ne, sql } from "drizzle-orm";
import { Hono } from "hono";
import { validator as vValidator } from "hono-openapi";
import { revalidateTag } from "next/cache";
import { dbClient } from "@/db";
import { desktop, user } from "@/db/schema";
import { authRequired } from "../middleware/authRequired";
import {
  BackgroundInput,
  CreateDesktopInput,
  DesktopId,
  DesktopNameInput,
  FontInput,
  osNameFormInput,
  SaveOrderIds,
  StateInput,
  VisibilityInput,
} from "../schemas/desktop.schema";
import type { AuthedEnv } from "../types";

export const desktopAuthedRoutes = new Hono<AuthedEnv>()
  .use("*", authRequired())
  .put(
    "/desktop/:desktopId/state",
    vValidator("json", StateInput),
    async (c) => {
      const { state, id: desktopId } = c.req.valid("json");
      const rows = await dbClient
        .update(desktop)
        .set({
          state,
        })
        .where(
          and(
            eq(desktop.id, desktopId),
            eq(desktop.userId, c.var.session.user.id),
          ),
        )
        .returning();

      revalidateTag("desktop");

      return c.json(rows, 201);
    },
  )
  .put(
    "/desktop/:desktopId/visibility",
    vValidator("json", VisibilityInput),
    async (c) => {
      const { isPublic, id: desktopId } = c.req.valid("json");
      await dbClient
        .update(desktop)
        .set({
          isPublic,
        })
        .where(
          and(
            eq(desktop.id, desktopId),
            eq(desktop.userId, c.var.session.user.id),
          ),
        );

      revalidateTag("desktop");

      return c.json(null, 200);
    },
  )
  .put(
    "/desktop/:desktopId/background",
    vValidator("json", BackgroundInput),
    async (c) => {
      const { background, id: desktopId } = c.req.valid("json");
      const db = c.get("db");

      await db
        .update(desktop)
        .set({
          background,
        })
        .where(
          and(
            eq(desktop.id, desktopId),
            eq(desktop.userId, c.var.session.user.id),
          ),
        );

      revalidateTag("desktop");

      return c.json(null, 200);
    },
  )
  .put("/desktop/:desktopId/font", vValidator("json", FontInput), async (c) => {
    const { font, id: desktopId } = c.req.valid("json");
    const db = c.get("db");

    await db
      .update(desktop)
      .set({
        font,
      })
      .where(
        and(
          eq(desktop.id, desktopId),
          eq(desktop.userId, c.var.session.user.id),
        ),
      );

    revalidateTag("desktop");

    return c.json(200);
  })
  .post("/desktop/new", vValidator("json", CreateDesktopInput), async (c) => {
    const { name } = c.req.valid("json");

    const row = await dbClient.transaction(async (tx) => {
      const [maxRow] = await tx
        .select({
          maxOrder: sql<number>`max(${desktop.orderIndex})`,
        })
        .from(desktop)
        .where(eq(desktop.userId, c.var.session.user.id));

      const nextOrder = (maxRow.maxOrder ?? -1) + 1;

      const rows = await tx
        .insert(desktop)
        .values({
          name,
          userId: c.var.session.user.id,
          isPublic: false,
          background: "DEFAULT",
          font: "INTER",
          orderIndex: nextOrder,
          state: {
            appItems: [
              {
                id: "app-1",
                name: "Intro",
                iconKey: "StickyNote",
                color: "#FFEB3B",
                type: "memo",
                content: `<p>hello</p>`,
              },
            ],
            appPositions: { "app-1": { row: 0, col: 0 } },
            folderContents: {},
          },
        })
        .returning();

      return rows[0];
    });

    revalidateTag("desktop");
    return c.json(row, 200);
  })
  .put(
    "/dektop/:id/name",
    vValidator("param", DesktopId),
    vValidator("json", DesktopNameInput),
    async (c) => {
      const { id: desktopId } = c.req.valid("param");
      const { name: desktopName } = c.req.valid("json");

      const rows = await dbClient
        .update(desktop)
        .set({
          name: desktopName,
        })
        .where(
          and(
            eq(desktop.id, desktopId),
            eq(desktop.userId, c.var.session.user.id),
          ),
        )
        .returning();

      revalidateTag("desktop");

      return c.json(rows[0], 200);
    },
  )
  .delete("/desktop/:id/delete", vValidator("param", DesktopId), async (c) => {
    const { id: desktopId } = c.req.valid("param");

    const [{ cnt }] = await dbClient
      .select({ cnt: sql<number>`count(*)` })
      .from(desktop)
      .where(eq(desktop.userId, c.var.session.user.id));

    if (cnt <= 1) {
      return c.json({ message: "もう削除できません。" }, 500);
    }

    const rows = await dbClient
      .delete(desktop)
      .where(
        and(
          eq(desktop.id, desktopId),
          eq(desktop.userId, c.var.session.user.id),
        ),
      )
      .returning();

    revalidateTag("desktop");

    return c.json(rows[0], 200);
  })
  .post("/user/:osName", vValidator("param", osNameFormInput), async (c) => {
    const { osName } = c.req.valid("param");

    const me = await dbClient
      .select({ osName: user.osName })
      .from(user)
      .where(eq(user.id, c.var.session.user.id))
      .limit(1);

    if (me.length === 0) {
      return c.json({ message: "ユーザーが見つかりませんでした。" }, 404);
    }

    if (me[0].osName !== null) {
      return c.json({ message: "osName は一度しか設定できません。" }, 409);
    }

    const dupRows = await dbClient
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.osName, osName), ne(user.id, c.var.session.user.id)))
      .limit(1);

    if (dupRows.length > 0) {
      return c.json({ message: "この osName は既に使用されている。" }, 409);
    }

    const initialContent = `<p>Your planet &quot;${osName}&quot; is born! 🌍✨<br>You can find instructions on how to use it under <strong>Instructions</strong> in the menu bar.</p>`;

    await dbClient.transaction(async (tx) => {
      await tx
        .update(user)
        .set({ osName })
        .where(eq(user.id, c.var.session.user.id));

      await tx
        .insert(desktop)
        .values({
          userId: c.var.session.user.id,
          name: "名称未設定",
          isPublic: false,
          background: "DEFAULT",
          font: "INTER",
          orderIndex: 0,
          state: {
            appItems: [
              {
                id: "app-1",
                name: "Intro",
                iconKey: "StickyNote",
                color: "#FFEB3B",
                type: "memo",
                content: initialContent,
              },
            ],
            appPositions: { "app-1": { row: 0, col: 0 } },
            folderContents: {},
          },
        })
        .returning();
    });

    return c.json({ message: "作成に成功しました。" }, 200);
  })
  .post("/desktops/save-order", vValidator("json", SaveOrderIds), async (c) => {
    const { desktopIds } = c.req.valid("json");

    // 自分の全デスクトップ ID を取得
    const mine = await dbClient
      .select({ id: desktop.id })
      .from(desktop)
      .where(eq(desktop.userId, c.var.session.user.id));

    const ownedIds = mine.map((m) => m.id);
    const ownedSet = new Set(ownedIds);

    // 件数一致
    if (desktopIds.length !== ownedIds.length) {
      return c.json({ message: "IDs count mismatch: send full list" }, 400);
    }
    // 全 ID が自分のもの
    for (const id of desktopIds) {
      if (!ownedSet.has(id)) {
        return c.json({ message: `Invalid desktop id: ${id}` }, 400);
      }
    }
    // 重複なし
    const uniq = new Set(desktopIds);
    if (uniq.size !== desktopIds.length) {
      return c.json({ message: "Duplicate ids in payload" }, 400);
    }

    await dbClient.transaction(async (tx) => {
      const BUMP = 1_000_000;

      await tx
        .update(desktop)
        .set({
          orderIndex: sql`${desktop.orderIndex} + ${BUMP}`,
          updatedAt: /* @__PURE__ */ new Date(),
        })
        .where(
          and(
            eq(desktop.userId, c.var.session.user.id),
            inArray(desktop.id, desktopIds),
          ),
        );

      const n = desktopIds.length;
      const cases = desktopIds.map(
        (id, i) => sql`WHEN ${desktop.id} = ${id} THEN ${n - 1 - i}`,
      );
      const caseSql = sql`CASE ${sql.join(cases, sql.raw(" "))} ELSE ${desktop.orderIndex} END`;

      await tx
        .update(desktop)
        .set({
          orderIndex: caseSql,
          updatedAt: /* @__PURE__ */ new Date(),
        })
        .where(
          and(
            eq(desktop.userId, c.var.session.user.id),
            inArray(desktop.id, desktopIds),
          ),
        );
    });

    revalidateTag("desktop");
    return c.json({ success: true, updated: desktopIds.length }, 200);
  });
