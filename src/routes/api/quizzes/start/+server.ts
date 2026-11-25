import { json } from "@sveltejs/kit";
import { startQuizAttempt, type QuizMode } from "$lib/server/competition";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "Sign in to start a saved quiz." }, { status: 401 });
  let input: { mode?: unknown; competitionId?: unknown };
  try {
    input = await event.request.json();
  } catch {
    return json({ error: "Choose a quiz mode." }, { status: 400 });
  }
  const mode = input.mode ?? "quick";
  if (mode !== "quick" && mode !== "daily" && mode !== "head_to_head") {
    return json({ error: "That quiz mode is not available." }, { status: 400 });
  }
  const competitionId = typeof input.competitionId === "string" ? input.competitionId : undefined;
  try {
    const attempt = await startQuizAttempt(database(event.platform), user.id, mode as QuizMode, competitionId);
    return json({ attempt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not start this quiz.";
    return json({ error: message }, { status: message.includes("already completed") ? 409 : 400 });
  }
};
