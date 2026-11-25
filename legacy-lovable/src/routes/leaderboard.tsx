import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Crown } from "lucide-react";
import { PageTitle } from "@/components/fz/AppShell";
import { Avatar } from "@/components/fz/bits";
import { ME_AVATAR, PLAYERS } from "@/lib/fanzone/data";
import { useFz } from "@/lib/fanzone/store";
import { accuracy } from "@/lib/fanzone/scoring";
import { fmt } from "@/lib/fanzone/format";
import { meta } from "@/lib/fanzone/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/leaderboard")({
  head: () => meta("Leaderboard", "Daily, weekly and monthly rankings of the sharpest football minds."),
  component: Leaderboard,
});

const PERIODS = { Daily: 0.06, Weekly: 0.3, Monthly: 1 } as const;
type Period = keyof typeof PERIODS;

function Leaderboard() {
  const { state } = useFz();
  const [period, setPeriod] = useState<Period>("Weekly");
  const f = PERIODS[period];
  const rows = [...PLAYERS.map((p, i) => ({ ...p, points: Math.round(p.points * f * (1 + ((i * 7 + period.length) % 5) / 40)), wins: Math.round(p.wins * f), me: false })),
    { id: "me", name: `${state.username} (You)`, avatar: ME_AVATAR, country: "🇳🇬", points: Math.round(state.points * f), wins: Math.round(state.wins * f), accuracy: accuracy(state.correct, state.answered), level: 18, me: true }]
    .sort((a, b) => b.points - a.points);
  const [a, b, c] = rows as [typeof rows[number], typeof rows[number], typeof rows[number]];
  const podium = [{ p: b, r: 2, ring: "silver" as const, h: "h-24" }, { p: a, r: 1, ring: "gold" as const, h: "h-32" }, { p: c, r: 3, ring: "bronze" as const, h: "h-20" }];

  return (
    <div>
      <PageTitle title="Leaderboard" sub="Resets every period. Climb fast." />
      <div className="fz-card mb-6 grid grid-cols-3 gap-1 p-1">
        {(Object.keys(PERIODS) as Period[]).map((k) => (
          <button key={k} onClick={() => setPeriod(k)} className={cn("rounded-xl py-2 text-sm font-bold transition-colors", period === k ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{k}</button>
        ))}
      </div>
      <div key={period} className="animate-rise mb-6 grid grid-cols-3 items-end gap-3">
        {podium.map(({ p, r, ring, h }) => (
          <div key={p.id} className="flex flex-col items-center gap-2 text-center">
            {r === 1 && <Crown className="size-6 text-gold" />}
            <Avatar src={p.avatar} size={r === 1 ? 72 : 56} ring={ring} />
            <p className="w-full truncate text-sm font-bold">{p.name}</p>
            <p className="font-display text-xs font-bold text-accent">{fmt(p.points)}</p>
            <div className={cn("fz-card grid w-full place-items-center rounded-b-none font-display text-2xl font-black", h, r === 1 ? "text-gold" : r === 2 ? "text-silver" : "text-bronze")}>{r}</div>
          </div>
        ))}
      </div>
      <div className="fz-card divide-y divide-border">
        <div className="grid grid-cols-[2rem_1fr_4rem_3.5rem] gap-2 px-4 py-2 text-[11px] font-bold uppercase text-muted-foreground md:grid-cols-[2rem_1fr_5rem_5rem_5rem]">
          <span>#</span><span>Player</span><span className="hidden text-right md:block">Wins</span><span className="text-right">Acc</span><span className="text-right">Pts</span>
        </div>
        {rows.slice(3).map((p, i) => (
          <div key={p.id} className={cn("grid grid-cols-[2rem_1fr_4rem_3.5rem] items-center gap-2 px-4 py-3 text-sm md:grid-cols-[2rem_1fr_5rem_5rem_5rem]", p.me && "bg-primary/15")}>
            <span className="font-display font-bold text-muted-foreground">{i + 4}</span>
            <span className="flex min-w-0 items-center gap-2"><Avatar src={p.avatar} size={32} /><span className="truncate font-semibold">{p.name}</span></span>
            <span className="hidden text-right md:block">{p.wins}</span>
            <span className="text-right">{p.accuracy}%</span>
            <span className="text-right font-display font-bold">{fmt(p.points)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
