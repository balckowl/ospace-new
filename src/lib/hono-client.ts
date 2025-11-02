import { hc } from "hono/client";
import { env } from "@/env";
import type { authed, pub } from "@/server/hono";

const url = env.NEXT_PUBLIC_APP_URL;
export const pubHono = hc<typeof pub>(url);
export const authedHono = hc<typeof authed>(url);
