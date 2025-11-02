import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { validator as vValidator } from "hono-openapi";
import { safeParse } from "valibot";
import { dbClient } from "@/db";
import { user } from "@/db/schema";
import {
  GetDesktopStateResponse,
  type GetDesktopStateResponseType,
  osNameInput,
} from "../schemas/desktop.schema";
import type { Env } from "../types";

export const desktopPublicRoutes = new Hono<Env>().get(
  "/desktop/:osName/state",
  vValidator("param", osNameInput),
  async (c) => {
    const { osName } = c.req.valid("param");

    const u = await dbClient.query.user.findFirst({
      where: eq(user.osName, osName),
      with: {
        desktops: {
          orderBy: (d, { desc }) => [desc(d.orderIndex)],
        },
      },
    });

    if (!u || u.desktops.length === 0) {
      return c.json({ message: "デスクトップがありません。" }, 404);
    }

    /*desktopのuserと認証userが一致していたら編集可能*/
    const isEdit = c.var.session?.user.id === u.id;
    /*isEdit なら全件、そうでなければ isPublic のみ*/
    const withOutUserId = u.desktops.map(({ userId, ...rest }) => rest);
    const visibleDesktops = isEdit
      ? withOutUserId
      : withOutUserId.filter((d) => d.isPublic);

    if (visibleDesktops.length === 0) {
      return c.json({ message: "デスクトップがありません。" }, 404);
    }

    const res: GetDesktopStateResponseType = {
      desktopList: visibleDesktops,
      isEdit,
      currentUser: {
        name: c.var.session?.user.name || null,
        osName: c.var.session?.user.osName || null,
        icon: c.var.session?.user.image || null,
      },
    };

    const parsed = safeParse(GetDesktopStateResponse, res);
    if (!parsed.success) {
      return c.json({ message: "バリデーションエラーです。" }, 500);
    }

    return c.json(res, 200);
  },
);
