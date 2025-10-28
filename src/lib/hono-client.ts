//lib/hono.ts

import { hc } from "hono/client";
import type { authed, pub } from "@/server/hono";

export const pubHono = hc<typeof pub>("http://localhost:3000");
export const authedHono = hc<typeof authed>("http://localhost:3000");
