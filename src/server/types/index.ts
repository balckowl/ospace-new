import type { Session, User } from "better-auth";
import type { DB } from "@/db";

export type SessionLike = {
  session: Session;
  user: User & { osName: string };
};

export type Env = {
  Variables: {
    db: DB;
    session: SessionLike | null;
  };
};

export type AuthedEnv = {
  Variables: {
    db: DB;
    session: SessionLike;
  };
};
