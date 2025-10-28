import type { MiddlewareHandler } from "hono";
import type { AuthedEnv, Env } from "../types";

export const authRequired = (): MiddlewareHandler<Env> => {
  return async (c, next) => {
    const session = c.get("session");
    if (!session?.user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    c.set("session", session);
    await next();
  };
};

export type AuthedHandler = MiddlewareHandler<AuthedEnv>;
