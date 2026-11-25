import { json } from "@sveltejs/kit";
import { database } from "$lib/server/db";
import type { RequestHandler } from "./$types";

type AttemptQuestion = { question_id: string; correct_index: number; option_count: number };

export const POST: RequestHandler = async (event) => {
  const user = event.locals.user;
  if (!user) return json({ error: "Sign in to submit your quiz." }, { status: 401 });
  let input: { answers?: unknown };
  try {
    input = await event.request.json();
  } catch {
    return json({ error: "Submit your answers to finish the quiz." }, { status: 400 });
  }
  if (!Array.isArray(input.answers) || input.answers.length !== 10) {
    return json({ error: "Answer all 10 questions before submitting." }, { status: 400 });
  }
  const parsed: Array<{ questionId: string; selectedIndex: number }> = [];
  for (const answer of input.answers) {
    if (
      !answer || typeof answer !== "object" ||
      typeof answer.questionId !== "string" ||
      !Number.isInteger(answer.selectedIndex) ||
      answer.selectedIndex < 0 || answer.selectedIndex > 3
    ) return json({ error: "One or more answers are invalid." }, { status: 400 });
    parsed.push({ questionId: answer.questionId, selectedIndex: answer.selectedIndex });
  }
  if (new Set(parsed.map((answer) => answer.questionId)).size !== 10) {
    return json({ error: "Each question must have one answer." }, { status: 400 });
  }

  const db = database(event.platform);
  const attempt = await db.prepare(
    "SELECT id, status, started_at AS startedAt, expires_at AS expiresAt, competition_id AS competitionId " +
    "FROM quiz_attempts WHERE id = ? AND user_id = ?"
  ).bind(event.params.id, user.id).first<{ id: string; status: string; startedAt: number; expiresAt: number; competitionId: string | null }>();
  if (!attempt) return json({ error: "Quiz attempt not found." }, { status: 404 });
  if (attempt.status !== "active") return json({ error: "This quiz has already been submitted." }, { status: 409 });
  const now = Math.floor(Date.now() / 1000);
  if (attempt.expiresAt <= now) {
    await db.prepare("UPDATE quiz_attempts SET status = 'expired' WHERE id = ? AND status = 'active'")
      .bind(attempt.id).run();
    return json({ error: "Time is up. Start a new quiz to compete again." }, { status: 410 });
  }

  const questionRows = await db.prepare(
    "SELECT aq.question_id, q.correct_index, json_array_length(q.options_json) AS option_count " +
    "FROM attempt_questions aq JOIN questions q ON q.id = aq.question_id WHERE aq.attempt_id = ?"
  ).bind(attempt.id).all<AttemptQuestion>();
  if (questionRows.results.length !== 10) return json({ error: "This quiz could not be scored." }, { status: 409 });
  const questionMap = new Map(questionRows.results.map((row) => [row.question_id, row]));
  if (parsed.some((answer) => !questionMap.has(answer.questionId))) {
    return json({ error: "The submitted answers do not match this quiz." }, { status: 400 });
  }
  const score = parsed.reduce((total, answer) => {
    const question = questionMap.get(answer.questionId)!;
    return total + (answer.selectedIndex === question.correct_index ? 1 : 0);
  }, 0);
  const durationMs = Math.max(0, (now - attempt.startedAt) * 1000);
  const statements = parsed.map((answer) => db.prepare(
    "UPDATE attempt_questions SET selected_index = ?, is_correct = ? " +
    "WHERE attempt_id = ? AND question_id = ? AND EXISTS (" +
    "SELECT 1 FROM quiz_attempts WHERE id = ? AND user_id = ? AND status = 'active' AND expires_at > ?)"
  ).bind(
    answer.selectedIndex,
    answer.selectedIndex === questionMap.get(answer.questionId)!.correct_index ? 1 : 0,
    attempt.id,
    answer.questionId,
    attempt.id,
    user.id,
    now
  ));
  statements.push(db.prepare(
    "UPDATE quiz_attempts SET status = 'completed', score = ?, submitted_at = ?, duration_ms = ? " +
    "WHERE id = ? AND user_id = ? AND status = 'active' AND expires_at > ? " +
    "AND (SELECT COUNT(*) FROM attempt_questions WHERE attempt_id = ? AND selected_index IS NOT NULL) = total_questions"
  ).bind(score, now, durationMs, attempt.id, user.id, now, attempt.id));

  try {
    const results = await db.batch(statements);
    if ((results.at(-1)?.meta.changes ?? 0) !== 1) {
      return json({ error: "This quiz was already submitted or expired." }, { status: 409 });
    }
  } catch {
    return json({ error: "Could not save this result. Try submitting again." }, { status: 409 });
  }

  if (attempt.competitionId) {
    await db.prepare(
      "UPDATE competitions SET status = 'completed', winner_user_id = (" +
      "SELECT CASE WHEN a.score > b.score OR (a.score = b.score AND a.duration_ms < b.duration_ms) THEN a.user_id " +
      "WHEN a.score < b.score OR (a.score = b.score AND a.duration_ms > b.duration_ms) THEN b.user_id ELSE NULL END " +
      "FROM quiz_attempts a JOIN quiz_attempts b ON a.competition_id = b.competition_id " +
      "WHERE a.competition_id = competitions.id AND a.user_id = competitions.created_by " +
      "AND b.user_id = competitions.opponent_user_id AND a.status = 'completed' AND b.status = 'completed') " +
      "WHERE id = ? AND type = 'head_to_head' AND status = 'active' " +
      "AND (SELECT COUNT(*) FROM quiz_attempts WHERE competition_id = ? AND status = 'completed') = 2"
    ).bind(attempt.competitionId, attempt.competitionId).run();
  }
  return json({ result: { score, total: 10, durationMs, submittedAt: now } });
};
