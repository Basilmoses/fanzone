import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, RotateCcw, Zap } from "lucide-react";
import { z } from "zod";
import { QuizEngine, type QuizResult } from "@/components/fz/QuizEngine";
import { ResultStats } from "@/components/fz/Results";
import { Button } from "@/components/ui/button";
import { CATEGORIES, pickQuestions } from "@/lib/fanzone/data";
import { recordGame, useFz } from "@/lib/fanzone/store";
import { meta } from "@/lib/fanzone/meta";
import type { Category } from "@/lib/fanzone/types";

export const Route = createFileRoute("/play/quiz")({
  validateSearch: z.object({ category: z.string().optional() }),
  head: () => meta("Quick Quiz", "10 football questions in 2 minutes. How much do you really know?"),
  component: QuickQuiz,
});

function QuickQuiz() {
  const { category } = Route.useSearch();
  const cat = CATEGORIES.includes(category as Category) ? (category as Category) : undefined;
  const { state, update } = useFz();
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [round, setRound] = useState(0);
  const [qs, setQs] = useState(() => pickQuestions(state.questions, 10, cat, 1));
  const [res, setRes] = useState<QuizResult | null>(null);

  const start = () => { setQs(pickQuestions(state.questions, 10, cat)); setRound((r) => r + 1); setPhase("play"); };
  const finish = (r: QuizResult) => {
    setRes(r); setPhase("done");
    update((s) => recordGame(s, { correct: r.correct, total: r.total, points: r.points, won: r.correct >= 7, label: "Quick Quiz" }));
  };

  return (
    <div>
      <Link to="/play" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Play</Link>
      {phase === "intro" && (
        <div className="mx-auto max-w-md animate-rise text-center">
          <div className="mx-auto grid size-20 place-items-center rounded-3xl bg-lime text-accent-foreground shadow-lime"><Zap className="size-10" /></div>
          <h1 className="mt-5 text-3xl font-bold">Quick Quiz</h1>
          <p className="mt-2 text-muted-foreground">{cat ?? "Mixed categories"} · 10 questions · 2:00</p>
          <ul className="fz-card mt-6 space-y-2 p-5 text-left text-sm text-muted-foreground">
            <li>✅ 100 points per correct answer</li><li>⏱️ +1 bonus point per second left</li><li>🔥 7+ correct counts as a win</li>
          </ul>
          <Button variant="lime" size="lg" className="mt-6 h-14 w-full text-base" onClick={start}>Kick off</Button>
        </div>
      )}
      {phase === "play" && <QuizEngine key={round} questions={qs} onFinish={finish} />}
      {phase === "done" && res && (
        <div className="mx-auto max-w-md animate-pop text-center">
          <p className="text-5xl">{res.correct >= 9 ? "🏆" : res.correct >= 7 ? "⚽" : res.correct >= 5 ? "👏" : "💪"}</p>
          <h1 className="mt-3 text-3xl font-bold">{res.correct >= 7 ? "Full-time win!" : "Full time"}</h1>
          <p className="mb-6 mt-1 text-muted-foreground">+{Math.round(res.points / 10)} FZ added to your wallet</p>
          <ResultStats r={res} />
          <div className="fz-card mt-4 max-h-64 divide-y divide-border overflow-auto text-left text-sm">
            {qs.map((q, k) => (
              <div key={q.id} className="flex gap-2 p-3">
                <span>{res.answers[k] === q.answer ? "✅" : "❌"}</span>
                <span className="flex-1">{q.q}<br /><span className="text-xs text-accent">{q.options[q.answer]}</span></span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="glass" size="lg" asChild><Link to="/leaderboard">Leaderboard</Link></Button>
            <Button variant="lime" size="lg" onClick={start}><RotateCcw /> Play Again</Button>
          </div>
        </div>
      )}
    </div>
  );
}
