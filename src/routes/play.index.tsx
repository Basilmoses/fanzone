import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Swords, Trophy, Zap } from "lucide-react";
import { PageTitle, SectionHead } from "@/components/fz/AppShell";
import { CATEGORIES } from "@/lib/fanzone/data";
import { meta } from "@/lib/fanzone/meta";

export const Route = createFileRoute("/play/")({
  head: () => meta("Play", "Choose a game mode: Quick Quiz, Head-to-Head or Daily Tournaments."),
  component: Play,
});

const MODES = [
  { to: "/play/quiz", title: "Quick Quiz", sub: "10 questions, 2 minutes. Beat the clock.", icon: Zap, cls: "bg-lime text-accent-foreground shadow-lime" },
  { to: "/play/h2h", title: "Head-to-Head", sub: "Same questions. Two fans. One winner.", icon: Swords, cls: "bg-brand text-primary-foreground shadow-glow" },
  { to: "/play/tournaments", title: "Daily Tournaments", sub: "Climb the bracket for big point pools.", icon: Trophy, cls: "fz-card" },
] as const;

function Play() {
  return (
    <div>
      <PageTitle title="Play" sub="Pick your arena." />
      <div className="grid gap-3 md:grid-cols-3">
        {MODES.map(({ to, title, sub, icon: Icon, cls }) => (
          <Link key={to} to={to} className={`${cls} flex items-center gap-4 rounded-3xl p-5 transition-transform active:scale-[0.98] md:flex-col md:items-start md:p-6`}>
            <Icon className="size-10" />
            <div className="flex-1"><p className="font-display text-lg font-bold">{title}</p><p className="text-sm opacity-80">{sub}</p></div>
            <ChevronRight className="md:hidden" />
          </Link>
        ))}
      </div>
      <SectionHead title="Categories" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {CATEGORIES.map((c) => (
          <Link key={c} to="/play/quiz" search={{ category: c }} className="fz-card p-4 font-semibold transition-colors hover:border-accent">
            <span className="text-2xl">{{ "Premier League": "🦁", "Champions League": "⭐", "World Cup": "🌍", AFCON: "🦅", Legends: "👑", Clubs: "🏟️", International: "🏳️" }[c]}</span>
            <p className="mt-2 text-sm">{c}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
