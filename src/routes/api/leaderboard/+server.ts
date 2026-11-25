import { json } from "@sveltejs/kit";
import { getOrCreateDailyCompetition } from "$lib/server/competition";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  const db = database(event.platform);
  const scope = event.url.searchParams.get("scope") === "all-time" ? "all-time" : "daily";
  if (scope === "daily") {
    const daily = await getOrCreateDailyCompetition(db);
    const rows = await db.prepare(
      "SELECT u.id, u.display_name AS displayName, a.score, a.total_questions AS totalQuestions, " +
      "a.duration_ms AS durationMs FROM quiz_attempts a JOIN users u ON u.id = a.user_id " +
      "WHERE a.competition_id = ? AND a.status = 'completed' ORDER BY a.score DESC, a.duration_ms ASC LIMIT 100"
    ).bind(daily.id).all();
    return json({ scope, competition: daily, entries: rows.results });
  }
  const rows = await db.prepare(
    "SELECT u.id, u.display_name AS displayName, SUM(a.score) AS score, " +
    "SUM(a.total_questions) AS totalQuestions, COUNT(*) AS attempts " +
    "FROM quiz_attempts a JOIN users u ON u.id = a.user_id " +
    "WHERE a.status = 'completed' GROUP BY u.id ORDER BY score DESC LIMIT 100"
  ).all();
  return json({ scope, entries: rows.results });
};
