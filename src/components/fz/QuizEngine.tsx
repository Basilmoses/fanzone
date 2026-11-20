import { useEffect, useRef, useState } from "react";
import { Check, Timer, X } from "lucide-react";
import type { Question } from "@/lib/fanzone/types";
import { computePoints } from "@/lib/fanzone/scoring";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface QuizResult { correct: number; total: number; secondsLeft: number; points: number; answers: (number | null)[] }

export function QuizEngine({ questions, seconds = 120, onFinish, header }: { questions: Question[]; seconds?: number; onFinish: (r: QuizResult) => void; header?: React.ReactNode }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [left, setLeft] = useState(seconds);
  const done = useRef(false);

  const finish = (ans: (number | null)[], secs: number) => {
    if (done.current) return;
    done.current = true;
    const full = questions.map((_, k) => ans[k] ?? null);
    const correct = full.filter((a, k) => a === questions[k]!.answer).length;
    onFinish({ correct, total: questions.length, secondsLeft: secs, points: computePoints(correct, secs), answers: full });
  };

  useEffect(() => {
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (left === 0) finish(answers, 0); }, [left]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = questions[i]!;
  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    const next = [...answers]; next[i] = k; setAnswers(next);
    setTimeout(() => {
      if (i + 1 >= questions.length) finish(next, left);
      else { setI(i + 1); setPicked(null); }
    }, 900);
  };

  const mm = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  return (
    <div className="mx-auto max-w-xl">
      {header}
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-muted-foreground">Question <span className="text-foreground">{i + 1}</span>/{questions.length}</span>
        <span className={cn("flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 font-display font-bold tabular-nums", left <= 20 && "bg-destructive/20 text-destructive")}>
          <Timer className="size-4" /> {mm}
        </span>
      </div>
      <div className="mb-4 flex gap-1">
        {questions.map((qq, k) => (
          <div key={qq.id} className={cn("h-1.5 flex-1 rounded-full bg-secondary transition-colors",
            k < i && (answers[k] === questions[k]!.answer ? "bg-accent" : "bg-destructive"),
            k === i && "bg-primary")} />
        ))}
      </div>
      <Progress value={(left / seconds) * 100} className="mb-5 h-1" />
      <div key={q.id} className="animate-rise">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">{q.category}</span>
        <h2 className="mt-2 text-xl font-bold leading-snug md:text-2xl">{q.q}</h2>
        <div className="mt-6 grid gap-3">
          {q.options.map((o, k) => {
            const isAns = k === q.answer, isPick = k === picked, show = picked !== null;
            return (
              <button key={o} onClick={() => choose(k)} disabled={show}
                className={cn("fz-card flex items-center gap-3 p-4 text-left font-semibold transition-all active:scale-[0.98]",
                  !show && "hover:border-primary",
                  show && isAns && "border-accent bg-accent/15",
                  show && isPick && !isAns && "border-destructive bg-destructive/15",
                  show && !isAns && !isPick && "opacity-50")}>
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg bg-secondary text-sm font-bold",
                  show && isAns && "bg-accent text-accent-foreground", show && isPick && !isAns && "bg-destructive")}>
                  {show && isAns ? <Check className="size-4" /> : show && isPick ? <X className="size-4" /> : "ABCD"[k]}
                </span>
                {o}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <p className={cn("animate-pop mt-4 text-center font-display font-bold", picked === q.answer ? "text-accent" : "text-destructive")}>
            {picked === q.answer ? "GOAL! Correct answer +100" : `Missed! It was ${q.options[q.answer]}`}
          </p>
        )}
      </div>
    </div>
  );
}
