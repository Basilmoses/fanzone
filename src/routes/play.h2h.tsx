import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Loader2, Swords, X } from "lucide-react";
import { toast } from "sonner";
import { QuizEngine, type QuizResult } from "@/components/fz/QuizEngine";
import { Avatar, Pill } from "@/components/fz/bits";
import { PageTitle, SectionHead } from "@/components/fz/AppShell";
import { Button } from "@/components/ui/button";
import { CATEGORIES, ME_AVATAR, PLAYERS, pickQuestions } from "@/lib/fanzone/data";
import { recordGame, useFz } from "@/lib/fanzone/store";
import { computePoints } from "@/lib/fanzone/scoring";
import { fmt } from "@/lib/fanzone/format";
import { meta } from "@/lib/fanzone/meta";
import type { Category, Player } from "@/lib/fanzone/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/play/h2h")({
  head: () => meta("Head-to-Head", "Challenge another fan to the same football questions and see who wins."),
  component: H2H,
});

type Phase = "lobby" | "pending" | "play" | "result";

function H2H() {
  const { state, update } = useFz();
  const [cat, setCat] = useState<Category>("Premier League");
  const [opp, setOpp] = useState<Player | null>(null);
  const [phase, setPhase] = useState<Phase>("lobby");
  const [incoming, setIncoming] = useState([
    { player: PLAYERS[3]!, cat: "Champions League" as Category },
    { player: PLAYERS[7]!, cat: "AFCON" as Category },
  ]);
  const [seed, setSeed] = useState(1);
  const [me, setMe] = useState<QuizResult | null>(null);
  const [them, setThem] = useState<{ correct: number; points: number } | null>(null);

  useEffect(() => {
    if (phase !== "pending") return;
    const t = setTimeout(() => { toast.success(`${opp?.name} accepted your challenge!`); setPhase("play"); }, 1800);
    return () => clearTimeout(t);
  }, [phase, opp]);

  const challenge = (p: Player) => { setOpp(p); setSeed(Math.floor(Math.random() * 1e6)); setPhase("pending"); };
  const accept = (i: number) => {
    const c = incoming[i]!; setOpp(c.player); setCat(c.cat); setSeed(Math.floor(Math.random() * 1e6));
    setIncoming((l) => l.filter((_, k) => k !== i)); setPhase("play");
  };
  const reject = (i: number) => { toast(`Declined ${incoming[i]!.player.name}'s challenge`); setIncoming((l) => l.filter((_, k) => k !== i)); };

  const finish = (r: QuizResult) => {
    const o = opp!;
    const oc = Math.max(0, Math.min(10, Math.round((o.accuracy / 100) * 10 + (Math.random() * 4 - 2))));
    const op = computePoints(oc, Math.floor(Math.random() * 50) + 10);
    const won = r.points > op;
    setMe(r); setThem({ correct: oc, points: op }); setPhase("result");
    update((s) => recordGame(s, { correct: r.correct, total: r.total, points: r.points + (won ? 250 : 0), won, label: `Head-to-Head vs ${o.name}` }));
  };

  const qs = pickQuestions(state.questions, 10, cat, seed);

  if (phase === "play" && opp)
    return (
      <QuizEngine questions={qs} onFinish={finish} header={
        <div className="fz-card mb-5 flex items-center justify-between p-3">
          <div className="flex items-center gap-2"><Avatar src={ME_AVATAR} size={32} ring="lime" /><span className="text-sm font-bold">You</span></div>
          <Pill tone="blue"><Swords className="size-3" /> {cat}</Pill>
          <div className="flex items-center gap-2"><span className="text-sm font-bold">{opp.name}</span><Avatar src={opp.avatar} size={32} /></div>
        </div>} />
    );

  if (phase === "result" && me && them && opp) {
    const won = me.points > them.points, draw = me.points === them.points;
    return (
      <div className="mx-auto max-w-md animate-pop text-center">
        <p className="text-5xl">{won ? "🏆" : draw ? "🤝" : "😤"}</p>
        <h1 className="mt-3 text-3xl font-bold">{won ? "You win!" : draw ? "It's a draw" : `${opp.name} wins`}</h1>
        <div className="fz-card mt-6 grid grid-cols-3 items-center p-5">
          <div className={cn("grid justify-items-center gap-2", won && "text-accent")}>
            <Avatar src={ME_AVATAR} size={56} ring={won ? "lime" : undefined} /><span className="text-sm font-bold">You</span>
            <span className="font-display text-3xl font-black">{me.correct}</span><span className="text-xs text-muted-foreground">{me.points} pts</span>
          </div>
          <span className="font-display text-muted-foreground">VS</span>
          <div className={cn("grid justify-items-center gap-2", !won && !draw && "text-accent")}>
            <Avatar src={opp.avatar} size={56} ring={!won && !draw ? "lime" : undefined} /><span className="text-sm font-bold">{opp.name}</span>
            <span className="font-display text-3xl font-black">{them.correct}</span><span className="text-xs text-muted-foreground">{them.points} pts</span>
          </div>
        </div>
        {won && <p className="mt-3 text-sm text-accent">+250 bonus points for the win</p>}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Button variant="glass" size="lg" onClick={() => setPhase("lobby")}>Lobby</Button>
          <Button variant="brand" size="lg" onClick={() => challenge(opp)}>Rematch</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link to="/play" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Play</Link>
      <PageTitle title="Head-to-Head" sub="Same 10 questions. Highest points wins." />

      {phase === "pending" && opp && (
        <div className="fz-card animate-pop mb-5 flex items-center gap-3 border-primary p-4">
          <Avatar src={opp.avatar} size={44} />
          <div className="flex-1"><p className="font-bold">Waiting for {opp.name}…</p><p className="text-xs text-muted-foreground">{cat}</p></div>
          <Loader2 className="size-5 animate-spin text-primary" />
          <Button size="sm" variant="ghost" onClick={() => setPhase("lobby")}>Cancel</Button>
        </div>
      )}

      {incoming.length > 0 && (
        <>
          <SectionHead title={`Incoming challenges (${incoming.length})`} />
          <div className="grid gap-3 md:grid-cols-2">
            {incoming.map((c, i) => (
              <div key={c.player.id} className="fz-card flex items-center gap-3 p-4">
                <Avatar src={c.player.avatar} size={44} />
                <div className="min-w-0 flex-1"><p className="truncate font-bold">{c.player.name} {c.player.country}</p><p className="text-xs text-muted-foreground">{c.cat} · {c.player.accuracy}% acc</p></div>
                <Button size="icon" variant="glass" aria-label="Reject" onClick={() => reject(i)}><X /></Button>
                <Button size="icon" variant="lime" aria-label="Accept" onClick={() => accept(i)}><Check /></Button>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionHead title="Category" />
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("shrink-0 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors", cat === c ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground")}>{c}</button>
        ))}
      </div>

      <SectionHead title="Challenge a fan" />
      <div className="grid gap-3 md:grid-cols-2">
        {PLAYERS.slice(0, 10).map((p) => (
          <div key={p.id} className="fz-card flex items-center gap-3 p-4">
            <div className="relative"><Avatar src={p.avatar} size={44} />{p.online && <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-accent" />}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{p.name} {p.country}</p>
              <p className="text-xs text-muted-foreground">Lvl {p.level} · {p.wins} wins · {p.accuracy}% · {fmt(p.points)} pts</p>
            </div>
            <Button size="sm" variant="brand" disabled={phase === "pending"} onClick={() => challenge(p)}><Swords /> Duel</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
