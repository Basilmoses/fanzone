import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { QUESTIONS, makeTournaments } from "./data";
import type { Activity, Question, Tournament, Txn } from "./types";

/** Demo state. Persisted in localStorage; shaped to map to database tables later. */
export interface FzState {
  username: string;
  balance: number;
  points: number;
  games: number;
  wins: number;
  correct: number;
  answered: number;
  best: number;
  streak: number;
  badges: string[];
  joined: string[];
  txns: Txn[];
  activity: Activity[];
  questions: Question[];
  tournaments: Tournament[];
  flagged: string[];
}

const now = Date.now();
const D = 86400_000;
const initial: FzState = {
  username: "FanzoneMe",
  balance: 2500,
  points: 4820,
  games: 37,
  wins: 21,
  correct: 268,
  answered: 370,
  best: 1084,
  streak: 4,
  badges: ["b1", "b2", "b4"],
  joined: [],
  txns: [
    { id: "x1", type: "reward", label: "Daily login bonus", amount: 100, date: now - 3 * 3600_000 },
    { id: "x2", type: "reward", label: "Head-to-Head win vs Kop_Tunde", amount: 250, date: now - D },
    { id: "x3", type: "deposit", label: "Demo top-up", amount: 1000, date: now - 2 * D },
    { id: "x4", type: "reward", label: "Morning Blitz — 12th place", amount: 400, date: now - 3 * D },
    { id: "x5", type: "withdraw", label: "Demo withdrawal", amount: -300, date: now - 5 * D },
  ],
  activity: [
    { id: "a1", text: "Won Head-to-Head vs Kop_Tunde (8–6)", date: now - D, points: 250 },
    { id: "a2", text: "Quick Quiz: 9/10 correct", date: now - 1.5 * D, points: 984 },
    { id: "a3", text: "Unlocked badge: Hat-Trick", date: now - 2 * D },
  ],
  questions: QUESTIONS,
  tournaments: makeTournaments(now),
  flagged: ["p9", "p11"],
};

type Ctx = { state: FzState; update: (fn: (s: FzState) => FzState) => void; reset: () => void; ready: boolean };
const FzContext = createContext<Ctx | null>(null);
const KEY = "fanzone-state-v1";

export function FanzoneProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<FzState>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...initial, ...JSON.parse(raw) });
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);
  const value = useMemo<Ctx>(() => ({ state, ready, update: (fn) => setState(fn), reset: () => setState(initial) }), [state, ready]);
  return <FzContext.Provider value={value}>{children}</FzContext.Provider>;
}

export function useFz() {
  const c = useContext(FzContext);
  if (!c) throw new Error("useFz outside provider");
  return c;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

/** Record a finished game into state. */
export function recordGame(s: FzState, r: { correct: number; total: number; points: number; won?: boolean; label: string }): FzState {
  const badges = new Set(s.badges);
  badges.add("b1");
  if (r.correct === r.total) badges.add("b3");
  if (r.won && r.label.includes("Head")) badges.add("b4");
  const points = s.points + r.points;
  if (points >= 10000) badges.add("b6");
  const reward = Math.round(r.points / 10);
  return {
    ...s,
    games: s.games + 1,
    wins: s.wins + (r.won ? 1 : 0),
    correct: s.correct + r.correct,
    answered: s.answered + r.total,
    best: Math.max(s.best, r.points),
    points,
    balance: s.balance + reward,
    streak: r.won ? s.streak + 1 : 0,
    badges: [...badges],
    txns: reward > 0 ? [{ id: uid(), type: "reward", label: `${r.label} reward`, amount: reward, date: Date.now() }, ...s.txns] : s.txns,
    activity: [{ id: uid(), text: `${r.label}: ${r.correct}/${r.total} correct`, date: Date.now(), points: r.points }, ...s.activity].slice(0, 30),
  };
}
