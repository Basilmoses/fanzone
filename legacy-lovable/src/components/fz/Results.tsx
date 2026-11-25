import { accuracy, rating } from "@/lib/fanzone/scoring";
import type { QuizResult } from "./QuizEngine";
import { Stat } from "./bits";

export function ResultStats({ r }: { r: QuizResult }) {
  const acc = accuracy(r.correct, r.total);
  return (
    <div className="grid grid-cols-3 gap-3">
      <Stat label="Score" value={`${r.correct}/${r.total}`} tone="lime" />
      <Stat label="Accuracy" value={`${acc}%`} />
      <Stat label="Points" value={`+${r.points}`} tone="blue" />
      <div className="col-span-3 fz-card p-4 text-center text-sm text-muted-foreground">
        Rating: <span className="font-display font-bold text-foreground">{rating(acc)}</span> · Time left {r.secondsLeft}s
      </div>
    </div>
  );
}
