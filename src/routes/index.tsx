import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, ChevronRight, Flame, Swords, Target, Trophy, Zap, Users, Clock } from "lucide-react";
import hero from "@/assets/stadium-hero.svg";
import { useFz } from "@/lib/fanzone/store";
import { ME_AVATAR, PLAYERS, RECENT_WINNERS } from "@/lib/fanzone/data";
import { accuracy } from "@/lib/fanzone/scoring";
import { fmt } from "@/lib/fanzone/format";
import { Avatar, Pill, Stat } from "@/components/fz/bits";
import { Logo, SectionHead } from "@/components/fz/AppShell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FANZONE — Prove You Know Football" },
      { name: "description", content: "Free-to-play football knowledge battles: quick quizzes, head-to-head duels and daily tournaments." },
      { property: "og:title", content: "FANZONE — Prove You Know Football" },
      { property: "og:description", content: "Don't just watch football. Prove you know football." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { state } = useFz();
  const acc = accuracy(state.correct, state.answered);
  const top = PLAYERS.slice(0, 3);
  return (
    <div>
      <div className="mb-5 flex items-center justify-between md:hidden"><Logo /><Bell className="size-5 text-muted-foreground" /></div>
      <div className="flex items-center gap-3">
        <Avatar src={ME_AVATAR} size={48} ring="lime" />
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">Welcome back 👋</p>
          <p className="font-display text-lg font-bold">{state.username}</p>
        </div>
        <Link to="/wallet" className="fz-card px-3 py-2 text-right">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Balance</p>
          <p className="font-display text-sm font-bold text-accent">{fmt(state.balance)} FZ</p>
        </Link>
      </div>

      <Link to="/play/tournaments" className="relative mt-5 block overflow-hidden rounded-3xl border border-border shadow-glow">
        <img src={hero} alt="Floodlit stadium" width={1280} height={720} className="h-52 w-full object-cover md:h-64" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <Pill tone="lime"><Flame className="size-3" /> FEATURED CHALLENGE</Pill>
          <h2 className="mt-2 text-xl font-bold md:text-2xl">UCL Night Masters</h2>
          <p className="text-sm text-muted-foreground">2,310 fans competing · 40,000 FZ Points pool</p>
        </div>
      </Link>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <Link to="/play/quiz" className="col-span-2 flex items-center gap-4 rounded-3xl bg-lime p-5 text-accent-foreground shadow-lime transition-transform active:scale-[0.98] md:col-span-1 md:flex-col md:items-start">
          <Zap className="size-9" />
          <div className="flex-1"><p className="font-display text-lg font-black">Quick Quiz</p><p className="text-sm opacity-80">10 questions · 2 minutes</p></div>
          <ChevronRight className="md:hidden" />
        </Link>
        <Link to="/play/h2h" className="fz-card p-4 transition-colors hover:border-primary">
          <Swords className="size-7 text-primary" />
          <p className="mt-3 font-bold">Head-to-Head</p><p className="text-xs text-muted-foreground">Duel a real fan</p>
        </Link>
        <Link to="/play/tournaments" className="fz-card p-4 transition-colors hover:border-primary">
          <Trophy className="size-7 text-gold" />
          <p className="mt-3 font-bold">Daily Tournament</p><p className="text-xs text-muted-foreground">4 live today</p>
        </Link>
      </div>

      <SectionHead title="Your form" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Points" value={fmt(state.points)} tone="lime" icon={<Target className="size-3.5" />} />
        <Stat label="Accuracy" value={`${acc}%`} icon={<Zap className="size-3.5" />} />
        <Stat label="Win streak" value={`${state.streak} 🔥`} icon={<Flame className="size-3.5" />} />
        <Stat label="Games today" value={Math.min(state.games, 6)} icon={<Clock className="size-3.5" />} />
      </div>

      <div className="grid gap-x-6 md:grid-cols-2">
        <div>
          <SectionHead title="Leaderboard" action={<Link to="/leaderboard" className="text-xs font-bold text-primary">See all</Link>} />
          <div className="fz-card divide-y divide-border">
            {top.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3">
                <span className={["text-gold", "text-silver", "text-bronze"][i] + " w-5 font-display font-black"}>{i + 1}</span>
                <Avatar src={p.avatar} size={36} />
                <span className="flex-1 font-semibold">{p.name} {p.country}</span>
                <span className="font-display text-sm font-bold">{fmt(p.points)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionHead title="Recent winners" />
          <div className="fz-card divide-y divide-border">
            {RECENT_WINNERS.map((w) => (
              <div key={w.event} className="flex items-center gap-3 p-3">
                <Avatar src={w.player.avatar} size={36} />
                <div className="flex-1 min-w-0"><p className="truncate font-semibold">{w.player.name}</p><p className="truncate text-xs text-muted-foreground">{w.event}</p></div>
                <Pill tone="lime">{w.prize}</Pill>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fz-card pitch-lines mt-6 flex items-center gap-4 p-5">
        <Users className="size-8 text-primary" />
        <div className="flex-1"><p className="font-bold">12,480 fans online</p><p className="text-xs text-muted-foreground">Find an opponent in seconds</p></div>
        <Button asChild variant="brand" size="sm"><Link to="/play/h2h">Challenge</Link></Button>
      </div>
    </div>
  );
}
