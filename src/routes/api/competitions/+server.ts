import { json } from "@sveltejs/kit";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

function inviteCode(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(6)), (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

export const GET: RequestHandler = async ({ locals, platform }) => {
  if (!locals.user) return json({ error: "Sign in to view your challenges." }, { status: 401 });
  const rows = await database(platform).prepare(
    "SELECT c.id, c.title, c.type, c.status, c.invite_code AS inviteCode, c.ends_at AS endsAt, " +
    "creator.display_name AS creatorName, opponent.display_name AS opponentName, c.winner_user_id AS winnerUserId " +
    "FROM competitions c LEFT JOIN users creator ON creator.id = c.created_by " +
    "LEFT JOIN users opponent ON opponent.id = c.opponent_user_id " +
    "WHERE c.type = 'head_to_head' AND (c.created_by = ? OR c.opponent_user_id = ?) " +
    "ORDER BY c.created_at DESC LIMIT 30"
  ).bind(locals.user.id, locals.user.id).all();
  return json({ competitions: rows.results });
};

export const POST: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "Sign in to create a challenge." }, { status: 401 });
  const db = database(event.platform);
  const code = inviteCode();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + 86_400;
  await db.prepare(
    "INSERT INTO competitions (id, type, title, invite_code, created_by, status, starts_at, ends_at, created_at) " +
    "VALUES (?, 'head_to_head', 'Head-to-Head Challenge', ?, ?, 'open', ?, ?, ?)"
  ).bind(id, code, user.id, now, expiresAt, now).run();
  return json({ competition: { id, inviteCode: code, status: "open", endsAt: expiresAt } }, { status: 201 });
};
