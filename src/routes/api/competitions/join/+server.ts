import { json } from "@sveltejs/kit";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "Sign in to join a challenge." }, { status: 401 });
  let input: { inviteCode?: unknown };
  try {
    input = await event.request.json();
  } catch {
    return json({ error: "Enter a challenge code." }, { status: 400 });
  }
  if (!input || typeof input !== "object") return json({ error: "Enter a challenge code." }, { status: 400 });
  const code = typeof input.inviteCode === "string" ? input.inviteCode.trim().toUpperCase() : "";
  if (!/^[A-F0-9]{12}$/.test(code)) return json({ error: "Enter a valid challenge code." }, { status: 400 });
  const db = database(event.platform);
  const challenge = await db.prepare(
    "SELECT id, created_by, opponent_user_id, status, ends_at AS endsAt " +
    "FROM competitions WHERE invite_code = ? AND type = 'head_to_head'"
  ).bind(code).first<{ id: string; created_by: string; opponent_user_id: string | null; status: string; endsAt: number }>();
  if (!challenge || challenge.status !== "open" || challenge.endsAt <= Math.floor(Date.now() / 1000)) {
    return json({ error: "That challenge is unavailable or has expired." }, { status: 404 });
  }
  if (challenge.created_by === user.id) return json({ error: "You cannot join your own challenge." }, { status: 400 });
  if (challenge.opponent_user_id && challenge.opponent_user_id !== user.id) {
    return json({ error: "That challenge has already been accepted." }, { status: 409 });
  }
  const now = Math.floor(Date.now() / 1000);
  const result = await db.prepare(
    "UPDATE competitions SET opponent_user_id = ?, status = 'active', accepted_at = ? " +
    "WHERE id = ? AND status = 'open' AND ends_at > ? AND (opponent_user_id IS NULL OR opponent_user_id = ?)"
  ).bind(user.id, now, challenge.id, now, user.id).run();
  if (result.meta.changes !== 1) return json({ error: "That challenge has already been accepted." }, { status: 409 });
  return json({ competition: { id: challenge.id, status: "active" } });
};
