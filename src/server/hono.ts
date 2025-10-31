import { Scalar } from "@scalar/hono-api-reference";
import type { Session, User } from "better-auth";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
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

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "My API",
        version: "1.0.0",
        description: "Valibot + hono-openapi example",
      },
      servers: [{ url: "http://localhost:3000", description: "Local" }],
    },
  }),
);

app.get(
  "/docs",
  Scalar({
    url: "/api/openapi",
    theme: "alternate",
    layout: "modern",
  }),
);

export const pub = app.route("/", desktopPublicRoutes);
export const authed = app.route("/", desktopAuthedRoutes);
