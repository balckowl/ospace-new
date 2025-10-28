import { pipe, string, url } from "valibot";
import { createEnv } from "valibot-env";

export const env = createEnv({
  publicPrefix: "NEXT_PUBLIC_",
  schema: {
    private: {
      TURSO_CONNECTION_URL: pipe(string(), url()),
      TURSO_AUTH_TOKEN: string(),
      BETTER_AUTH_SECRET: string(),
      GOOGLE_CLIENT_ID: string(),
      GOOGLE_CLIENT_SECRET: string(),
      BETTER_AUTH_URL: pipe(string(), url()),
    },
    public: {
      NEXT_PUBLIC_APP_URL: pipe(string(), url()),
    },
  },
  values: {
    TURSO_CONNECTION_URL: process.env.TURSO_CONNECTION_URL,
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
});
