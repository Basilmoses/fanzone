import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Gamepad2, Trophy, Wallet, User, Shield } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/play", label: "Play", icon: Gamepad2 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-xl bg-lime font-display text-sm font-black text-accent-foreground">F</span>
      <span className="font-display text-lg font-bold tracking-tight">FAN<span className="text-accent">ZONE</span></span>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));
  if (path.startsWith("/admin")) return <>{children}</>;
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-1 border-r border-border p-5 md:flex">
        <div className="mb-8"><Logo /></div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", active(to) && "bg-secondary text-foreground")}>
            <Icon className={cn("size-5", active(to) && "text-accent")} /> {label}
          </Link>
        ))}
        <Link to="/admin" className="mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground">
          <Shield className="size-5" /> Admin
        </Link>
      </aside>
      <div className="min-w-0 flex-1 pb-28 md:pb-10">
        <main key={path} className="animate-rise px-4 pt-5 md:px-8 md:pt-8">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className={cn("flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-muted-foreground transition-colors", active(to) && "text-foreground")}>
              <span className={cn("grid h-8 w-12 place-items-center rounded-full transition-all", active(to) && "bg-accent text-accent-foreground")}>
                <Icon className="size-5" />
              </span>
              {label === "Leaderboard" ? "Ranks" : label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

export function PageTitle({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function SectionHead({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between">
      <h2 className="text-base font-bold">{title}</h2>
      {action}
    </div>
  );
}
