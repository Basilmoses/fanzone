import { json } from "@sveltejs/kit";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, platform }) => {
  const db = database(platform);
  const player = await db.prepare(
    "SELECT id, display_name AS displayName, created_at AS createdAt FROM users WHERE id = ?"
  ).bind(params.id).first();
  if (!player) return json({ error: "Player not found." }, { status: 404 });

  const [stats, attempts, challenges] = await Promise.all([
    db.prepare(
      "SELECT COUNT(*) AS quizzes, COALESCE(SUM(score), 0) AS points, " +
      "COALESCE(SUM(total_questions), 0) AS questions, COALESCE(MAX(score), 0) AS bestScore " +
      "FROM quiz_attempts WHERE user_id = ? AND status = 'completed'"
    ).bind(params.id).first(),
    db.prepare(
      "SELECT id, mode, score, total_questions AS totalQuestions, submitted_at AS submittedAt, " +
      "duration_ms AS durationMs FROM quiz_attempts WHERE user_id = ? AND status = 'completed' " +
      "ORDER BY submitted_at DESC LIMIT 20"
    ).bind(params.id).all(),
    db.prepare(
      "SELECT c.id, c.title, c.status, c.created_at AS createdAt, c.winner_user_id AS winnerUserId, " +
      "creator.display_name AS creatorName, opponent.display_name AS opponentName, " +
      "mine.score AS score, mine.total_questions AS totalQuestions, rival.score AS opponentScore " +
      "FROM competitions c " +
      "LEFT JOIN users creator ON creator.id = c.created_by " +
      "LEFT JOIN users opponent ON opponent.id = c.opponent_user_id " +
      "LEFT JOIN quiz_attempts mine ON mine.competition_id = c.id AND mine.user_id = ? " +
      "LEFT JOIN quiz_attempts rival ON rival.competition_id = c.id AND rival.user_id != ? " +
      "WHERE c.type = 'head_to_head' AND (c.created_by = ? OR c.opponent_user_id = ?) " +
      "ORDER BY c.created_at DESC LIMIT 20"
    ).bind(params.id, params.id, params.id, params.id).all()
  ]);

  return json({
    player,
    stats,
    attempts: attempts.results,
    challenges: challenges.results
  });
};
