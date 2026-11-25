import { json } from "@sveltejs/kit";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "Sign in to view this challenge." }, { status: 401 });
  const db = database(event.platform);
  const competition = await db.prepare(
    "SELECT c.id, c.title, c.type, c.status, c.ends_at AS endsAt, c.created_by AS createdBy, " +
    "c.opponent_user_id AS opponentUserId, c.winner_user_id AS winnerUserId, " +
    "creator.display_name AS creatorName, opponent.display_name AS opponentName " +
    "FROM competitions c LEFT JOIN users creator ON creator.id = c.created_by " +
    "LEFT JOIN users opponent ON opponent.id = c.opponent_user_id WHERE c.id = ? AND c.type = 'head_to_head'"
  ).bind(event.params.id).first<{ id: string; title: string; type: string; status: string; endsAt: number; createdBy: string; opponentUserId: string | null; winnerUserId: string | null; creatorName: string; opponentName: string | null }>();
  if (!competition || (competition.createdBy !== user.id && competition.opponentUserId !== user.id)) {
    return json({ error: "Challenge not found." }, { status: 404 });
  }
  const attempts = await db.prepare(
    "SELECT a.user_id AS userId, u.display_name AS displayName, a.score, a.total_questions AS totalQuestions, " +
    "a.status AS attemptStatus, a.duration_ms AS durationMs " +
    "FROM quiz_attempts a JOIN users u ON u.id = a.user_id WHERE a.competition_id = ?"
  ).bind(competition.id).all();
  return json({ competition, attempts: attempts.results });
};
