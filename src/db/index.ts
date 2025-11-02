import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { env } from "@/env";
import * as schema from "./schema";

const isDev = process.env.Flag === "dev";

const db = drizzle({
  connection: {
    url: env.TURSO_CONNECTION_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  },
  schema,
});

const client = createClient({ url: "file:./src/db/local.db" });

const localDB = drizzle({ client, schema });

export const dbClient = isDev ? localDB : db;
export type DB = typeof dbClient;
