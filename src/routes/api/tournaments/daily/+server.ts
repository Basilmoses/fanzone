import { json } from "@sveltejs/kit";
import { getOrCreateDailyCompetition, startQuizAttempt } from "$lib/server/competition";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async (event) => {
  try {
    const db = database(event.platform);
    const competition = await getOrCreateDailyCompetition(db);
    const entry = event.locals.user
      ? await db.prepare("SELECT id, status, score FROM quiz_attempts WHERE competition_id = ? AND user_id = ?")
          .bind(competition.id, event.locals.user.id).first()
      : null;
    return json({ competition, entry });
  } catch {
    return json({ error: "Daily tournament details are temporarily unavailable." }, { status: 503 });
  }
};

export const POST: RequestHandler = async (event) => {
  if (!event.locals.user) return json({ error: "Sign in to enter today's tournament." }, { status: 401 });
  try {
    const db = database(event.platform);
    const competition = await getOrCreateDailyCompetition(db);
    const attempt = await startQuizAttempt(db, event.locals.user.id, "daily", competition.id);
    return json({ competition, attempt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not join today's tournament.";
    return json({ error: message }, { status: message.includes("already completed") ? 409 : 400 });
  }
};
