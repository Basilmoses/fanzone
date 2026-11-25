import { json } from "@sveltejs/kit";
import { allowAuthAttempt, createSession, hashPassword, normaliseEmail } from "$lib/server/auth";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  let input: { email?: unknown; password?: unknown; displayName?: unknown };
  try {
    input = await event.request.json();
  } catch {
    return json({ error: "Enter valid account details." }, { status: 400 });
  }
  if (!input || typeof input !== "object") return json({ error: "Enter valid account details." }, { status: 400 });
  const email = typeof input.email === "string" ? normaliseEmail(input.email) : "";
  const password = typeof input.password === "string" ? input.password : "";
  const displayName = typeof input.displayName === "string" ? input.displayName.trim().replace(/\s+/g, " ") : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (displayName.length < 2 || displayName.length > 40) {
    return json({ error: "Display name must be 2–40 characters." }, { status: 400 });
  }
  if (password.length < 12 || password.length > 128) {
    return json({ error: "Password must be 12–128 characters." }, { status: 400 });
  }

  try {
    const db = database(event.platform);
    if (!(await allowAuthAttempt(event, email))) {
      return json({ error: "Too many account attempts. Try again in 15 minutes." }, { status: 429 });
    }
    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);
    const now = Math.floor(Date.now() / 1000);
    try {
      await db.prepare(
        "INSERT INTO users (id, display_name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(id, displayName, email, passwordHash, now).run();
    } catch {
      return json({ error: "An account with this email already exists." }, { status: 409 });
    }
    await createSession(event, id);
    return json({ user: { id, displayName, email } }, { status: 201 });
  } catch {
    return json({ error: "Account creation is temporarily unavailable." }, { status: 503 });
  }
};
