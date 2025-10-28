import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const isProduction = process.env.NODE_ENV === "production";

// const db = drizzle({
//   connection: {
//     url: process.env.TURSO_CONNECTION_URL as string,
//     authToken: process.env.TURSO_AUTH_TOKEN as string,
//   },
//   schema,
// });

const client = createClient({ url: "file:./src/db/local.db" });

const localDB = drizzle({ client, schema });

export const dbClient = localDB;
export type DB = typeof dbClient;
