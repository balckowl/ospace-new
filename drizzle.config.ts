import { defineConfig } from "drizzle-kit";
import { env } from "@/env";

const isProduction = process.env.NODE_ENV === "production";

const config = isProduction
  ? defineConfig({
      schema: "./src/db/schema.ts",
      out: "./migrations",
      dialect: "turso",
      dbCredentials: {
        url: env.TURSO_CONNECTION_URL,
        authToken: env.TURSO_AUTH_TOKEN,
      },
    })
  : defineConfig({
      schema: "./src/db/schema.ts",
      out: "./migrations",
      dialect: "sqlite",
      dbCredentials: {
        url: "src/db/local.db",
      },
    });

export default config;
