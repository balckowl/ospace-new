import type { Session, User } from "better-auth";
import { Hono } from "hono";
import { type DB, dbClient as db } from "@/db";
import { auth } from "@/lib/auth";
import { desktopAuthedRoutes } from "./routes/desktop.authed.routes";
import { desktopPublicRoutes } from "./routes/desktop.public.routes";

export type Env = {
  Variables: {
    db: DB;
    session: { session: Session & { osName?: string }; user: User } | null;
  };
};

export const app = new Hono<Env>().basePath("/api");

app.use("*", async (c, next) => {
  c.set("db", db);
  await next();
});

app.use("*", async (c, next) => {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });
  c.set("session", session);
  await next();
});

export const pub = app.route("/", desktopPublicRoutes);
export const authed = app.route("/", desktopAuthedRoutes);
