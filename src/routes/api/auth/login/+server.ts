import { json } from "@sveltejs/kit";
import { allowAuthAttempt, createSession, normaliseEmail, verifyPassword } from "$lib/server/auth";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  let input: { email?: unknown; password?: unknown };
  try {
    input = await event.request.json();
  } catch {
    return json({ error: "Enter your email and password." }, { status: 400 });
  }
  const email = typeof input.email === "string" ? normaliseEmail(input.email) : "";
  const password = typeof input.password === "string" ? input.password : "";
  if (!email || email.length > 254 || !password || password.length > 128) {
    return json({ error: "Enter a valid email and password." }, { status: 400 });
  }
  try {
    const db = database(event.platform);
    if (!(await allowAuthAttempt(event, email))) {
      return json({ error: "Too many sign-in attempts. Try again in 15 minutes." }, { status: 429 });
    }
    const user = await db.prepare(
      "SELECT id, display_name AS displayName, email, password_hash AS passwordHash FROM users WHERE email = ?"
    ).bind(email).first<{ id: string; displayName: string; email: string; passwordHash: string }>();
    const valid = await verifyPassword(password, user?.passwordHash ?? "pbkdf2-sha256$210000$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    if (!user || !valid) return json({ error: "Email or password is incorrect." }, { status: 401 });
    await createSession(event, user.id);
    return json({ user: { id: user.id, displayName: user.displayName, email: user.email } });
  } catch {
    return json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
};
