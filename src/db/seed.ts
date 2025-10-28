import { eq } from "drizzle-orm";
import type { AppLayoutSchemaType } from "@/server/schemas/desktop.schema";
import { dbClient as db } from "./index";
import {
  type BackgroundOption,
  desktop,
  type FontOption,
  user,
} from "./schema";

const now = () => new Date();

async function seed() {
  const users = [
    {
      id: "u_001",
      name: "Alice",
      email: "alice@example.com",
      emailVerified: true,
      image: "https://example.com/alice.png",
      createdAt: now(),
      updatedAt: now(),
      osName: "my-planet-01",
    },
    {
      id: "u_002",
      name: "Bob",
      email: "bob@example.com",
      emailVerified: false,
      image: "https://example.com/bob.png",
      createdAt: now(),
      updatedAt: now(),
      osName: "my-planet-02",
    },
  ] as const;

  const ds1: AppLayoutSchemaType = {
    appItems: [],
    appPositions: { Notes: { row: 0, col: 0 }, Terminal: { row: 0, col: 1 } },
    folderContents: { Work: ["doc1", "doc2"], Play: [] },
  };

  const ds2: AppLayoutSchemaType = {
    appItems: [],
    appPositions: { Browser: { row: 1, col: 0 } },
    folderContents: {},
  };

  const defaultBg: BackgroundOption = "SUNSET";
  const defaultFont: FontOption = "INTER";

  // Users: upsert
  for (const u of users) {
    await db
      .insert(user)
      .values(u)
      .onConflictDoUpdate({
        target: user.id,
        set: {
          name: u.name,
          email: u.email,
          emailVerified: u.emailVerified,
          image: u.image,
          osName: u.osName,
          updatedAt: now(),
        },
      });
  }

  // Desktops: upsert
  const desktopRows = [
    {
      id: "d_u_001",
      userId: "u_001",
      name: "Alice's Desktop",
      isPublic: true,
      background: defaultBg,
      font: defaultFont,
      state: ds1, // ★ 文字列ではなく “オブジェクト” を渡す
      createdAt: now(),
      updatedAt: now(),
    },
    {
      id: "d_u_002",
      userId: "u_002",
      name: "Bob's Desktop",
      isPublic: false,
      background: "DEFAULT" as BackgroundOption,
      font: "LORA" as FontOption,
      state: ds2, // ★ 同上
      createdAt: now(),
      updatedAt: now(),
    },
  ] as const;

  for (const d of desktopRows) {
    const exists = await db.query.desktop.findFirst({
      where: (t, { eq }) => eq(t.id, d.id),
      columns: { id: true },
    });

    if (exists) {
      await db
        .update(desktop)
        .set({
          name: d.name,
          isPublic: d.isPublic,
          background: d.background,
          font: d.font,
          state: d.state, // ★ オブジェクト
          updatedAt: now(),
        })
        .where(eq(desktop.id, d.id));
    } else {
      await db.insert(desktop).values(d); // ★ オブジェクト
    }
  }

  console.log("✅ Seeding done.");

  const usersAll = await db.select().from(user).all();
  const desktopsAll = await db.select().from(desktop).all();
  console.log("users:", usersAll);
  console.log("desktops:", desktopsAll);
}

seed().catch((e) => {
  console.error("❌ Seeding error:", e);
  process.exit(1);
});
