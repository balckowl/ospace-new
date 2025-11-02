import { defineConfig } from "drizzle-kit";
import { env } from "@/env";

const isDev = process.env.Flag === "dev";

const config = isDev
  ? defineConfig({
      schema: "./src/db/schema.ts",
      out: "./migrations",
      dialect: "sqlite",
      dbCredentials: {
        url: "src/db/local.db",
      },
    })
  : defineConfig({
      schema: "./src/db/schema.ts",
      out: "./migrations",
      dialect: "turso",
      dbCredentials: {
        url: env.TURSO_CONNECTION_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      },
    });

export default config;
