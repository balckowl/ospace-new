import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { validator as vValidator } from "hono-openapi";
import { revalidateTag } from "next/cache";
import { dbClient } from "@/db";
import { desktop } from "@/db/schema";
import { authRequired } from "../middleware/authRequired";
import {
  BackgroundInput,
  CreateDesktopInput,
  DesktopId,
  DesktopNameInput,
  FontInput,
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

    const rows = await dbClient
      .insert(desktop)
      .values({
        name: name,
        userId: c.var.session.user.id,
        isPublic: false,
        background: "DEFAULT",
        font: "INTER",
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
          appPositions: {
            "app-1": {
              row: 0,
              col: 0,
            },
          },
          folderContents: {},
        },
      })
      .returning();

    revalidateTag("desktop");

    return c.json(rows[0], 200);
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
  });
