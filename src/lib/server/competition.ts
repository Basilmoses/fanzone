import { database } from "./db";

export type QuizMode = "quick" | "daily" | "head_to_head";
type QuestionRow = { id: string; category: string; prompt: string; options_json: string; position: number };
type PublicQuestion = { id: string; category: string; question: string; options: string[] };

function publicQuestion(row: QuestionRow): PublicQuestion {
  return { id: row.id, category: row.category, question: row.prompt, options: JSON.parse(row.options_json) as string[] };
}

export async function getOrCreateDailyCompetition(db: FanZoneD1Database) {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const start = Math.floor(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) / 1000);
  const end = start + 86_400;
  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO competitions (id, type, title, daily_date, status, starts_at, ends_at, created_at) " +
    "VALUES (?, 'daily', 'Daily FanZone Challenge', ?, 'active', ?, ?, ?) " +
    "ON CONFLICT(daily_date) DO NOTHING"
  ).bind(id, day, start, end, Math.floor(Date.now() / 1000)).run();
  const competition = await db.prepare(
    "SELECT id, title, daily_date AS date, status, starts_at AS startsAt, ends_at AS endsAt " +
    "FROM competitions WHERE type = 'daily' AND daily_date = ?"
  ).bind(day).first<{ id: string; title: string; date: string; status: string; startsAt: number; endsAt: number }>();
  if (!competition) throw new Error("Daily tournament could not be created.");
  return competition;
}

export async function startQuizAttempt(
  db: FanZoneD1Database,
  userId: string,
  mode: QuizMode,
  competitionId?: string
) {
  let competition: { id: string; type: string; status: string; ends_at: number; created_by: string | null; opponent_user_id: string | null } | null = null;
  if (mode === "quick" && competitionId) throw new Error("Quick quizzes cannot be linked to a competition.");
  if (mode !== "quick") {
    if (!competitionId) throw new Error("Choose a competition first.");
    competition = await db.prepare(
      "SELECT id, type, status, ends_at, created_by, opponent_user_id FROM competitions WHERE id = ?"
    ).bind(competitionId).first();
    if (!competition || competition.status !== "active" || competition.ends_at <= Math.floor(Date.now() / 1000)) {
      throw new Error("This competition is not open for play.");
    }
    if (mode === "daily" && competition.type !== "daily") throw new Error("That is not a daily tournament.");
    if (mode === "head_to_head" && (
      competition.type !== "head_to_head" ||
      (competition.created_by !== userId && competition.opponent_user_id !== userId)
    )) throw new Error("You are not a participant in this challenge.");
  }

  const dbNow = Math.floor(Date.now() / 1000);
  if (competitionId) {
    const existing = await db.prepare(
      "SELECT id, status FROM quiz_attempts WHERE competition_id = ? AND user_id = ?"
    ).bind(competitionId, userId).first<{ id: string; status: string }>();
    if (existing) {
      if (existing.status === "active") return await loadAttempt(db, existing.id, userId);
      throw new Error("You have already completed this competition.");
    }
  }

  let selectedQuestions: Array<Omit<QuestionRow, "position">>;
  if (competitionId) {
    let questionSet = await db.prepare(
      "SELECT question_ids_json AS questionIdsJson FROM competition_question_sets WHERE competition_id = ?"
    ).bind(competitionId).first<{ questionIdsJson: string }>();
    if (!questionSet) {
      const candidateSet = await db.prepare(
        "SELECT id FROM questions WHERE active = 1 ORDER BY random() LIMIT 10"
      ).all<{ id: string }>();
      if (candidateSet.results.length < 10) throw new Error("The quiz question bank is not ready.");
      await db.prepare(
        "INSERT OR IGNORE INTO competition_question_sets (competition_id, question_ids_json) VALUES (?, ?)"
      ).bind(competitionId, JSON.stringify(candidateSet.results.map((row) => row.id))).run();
      questionSet = await db.prepare(
        "SELECT question_ids_json AS questionIdsJson FROM competition_question_sets WHERE competition_id = ?"
      ).bind(competitionId).first<{ questionIdsJson: string }>();
    }
    const ids = questionSet ? JSON.parse(questionSet.questionIdsJson) as string[] : [];
    if (!Array.isArray(ids) || ids.length !== 10 || ids.some((id) => typeof id !== "string")) {
      throw new Error("This competition's question set is unavailable.");
    }
    const placeholders = ids.map(() => "?").join(", ");
    const rows = await db.prepare(
      "SELECT id, category, prompt, options_json FROM questions WHERE active = 1 AND id IN (" + placeholders + ")"
    ).bind(...ids).all<Omit<QuestionRow, "position">>();
    const byId = new Map(rows.results.map((row) => [row.id, row]));
    selectedQuestions = ids.map((id) => byId.get(id)).filter((row): row is Omit<QuestionRow, "position"> => Boolean(row));
  } else {
    const pool = await db.prepare(
      "SELECT id, category, prompt, options_json FROM questions WHERE active = 1 ORDER BY random() LIMIT 10"
    ).all<Omit<QuestionRow, "position">>();
    selectedQuestions = pool.results;
  }
  if (selectedQuestions.length !== 10) throw new Error("The quiz question bank is not ready.");
  const attemptId = crypto.randomUUID();
  const expiry = Math.min(dbNow + 900, competition?.ends_at ?? dbNow + 900);
  const statements: FanZoneD1Statement[] = [
    db.prepare(
      "INSERT INTO quiz_attempts (id, user_id, competition_id, mode, status, score, total_questions, started_at, expires_at) " +
      "VALUES (?, ?, ?, ?, 'active', 0, 10, ?, ?)"
    ).bind(attemptId, userId, competitionId ?? null, mode, dbNow, expiry),
    ...selectedQuestions.map((question, position) => db.prepare(
      "INSERT INTO attempt_questions (attempt_id, question_id, position) VALUES (?, ?, ?)"
    ).bind(attemptId, question.id, position))
  ];
  try {
    await db.batch(statements);
  } catch {
    if (competitionId) {
      const existing = await db.prepare(
        "SELECT id, status FROM quiz_attempts WHERE competition_id = ? AND user_id = ?"
      ).bind(competitionId, userId).first<{ id: string; status: string }>();
      if (existing?.status === "active") return await loadAttempt(db, existing.id, userId);
    }
    throw new Error("Could not start this quiz. Please try again.");
  }
  return await loadAttempt(db, attemptId, userId);
}

export async function loadAttempt(db: FanZoneD1Database, attemptId: string, userId: string) {
  const attempt = await db.prepare(
    "SELECT id, mode, competition_id AS competitionId, status, total_questions AS totalQuestions, expires_at AS expiresAt " +
    "FROM quiz_attempts WHERE id = ? AND user_id = ?"
  ).bind(attemptId, userId).first<{ id: string; mode: QuizMode; competitionId: string | null; status: string; totalQuestions: number; expiresAt: number }>();
  if (!attempt) return null;
  const rows = await db.prepare(
    "SELECT aq.question_id AS id, q.category, q.prompt, q.options_json, aq.position " +
    "FROM attempt_questions aq JOIN questions q ON q.id = aq.question_id " +
    "WHERE aq.attempt_id = ? ORDER BY aq.position"
  ).bind(attemptId).all<QuestionRow>();
  return { ...attempt, questions: rows.results.map(publicQuestion) };
}
