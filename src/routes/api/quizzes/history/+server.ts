import { json } from "@sveltejs/kit";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ locals, platform }) => {
  if (!locals.user) return json({ error: "Sign in to view your quiz history." }, { status: 401 });
  const rows = await database(platform).prepare(
    "SELECT id, mode, score, total_questions AS totalQuestions, submitted_at AS submittedAt, duration_ms AS durationMs " +
    "FROM quiz_attempts WHERE user_id = ? AND status = 'completed' ORDER BY submitted_at DESC LIMIT 20"
  ).bind(locals.user.id).all();
  return json({ attempts: rows.results });
};
