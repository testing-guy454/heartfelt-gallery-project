import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

type GateSession = { unlocked?: boolean };

function sessionConfig() {
  const password = process.env.SESSION_SECRET;
  if (!password) throw new Error("SESSION_SECRET is not set");
  return {
    password,
    name: "album-gate",
    maxAge: 60 * 60 * 24 * 60, // 60 days — refreshed on every unlocked read (sliding)
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const isAlbumUnlocked = createServerFn({ method: "GET" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  // Sliding expiration: touch the session on every unlocked read so active
  // visitors don't lose access at day 60. Writing the same value re-issues
  // the cookie with a fresh 60-day maxAge.
  if (session.data.unlocked) {
    await session.update({ unlocked: true });
  }
  return { unlocked: !!session.data.unlocked };
});

export const unlockAlbum = createServerFn({ method: "POST" })
  .inputValidator((data: { passcode: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env.ALBUM_PASSCODE;
    if (!expected) throw new Error("ALBUM_PASSCODE is not set");
    if (!passwordMatches(data.passcode ?? "", expected)) {
      return { ok: false as const };
    }
    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockAlbum = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});
