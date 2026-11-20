import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Avatar({ src, size = 40, ring, className }: { src: string; size?: number; ring?: "gold" | "silver" | "bronze" | "lime" | undefined; className?: string }) {
  const ringCls = { gold: "ring-gold", silver: "ring-silver", bronze: "ring-bronze", lime: "ring-accent" };
  return (
    <img src={src} alt="" width={size} height={size} style={{ width: size, height: size }}
      className={cn("shrink-0 rounded-full bg-secondary object-cover", ring && "ring-2 ring-offset-2 ring-offset-background", ring && ringCls[ring], className)} />
  );
}

export function Stat({ label, value, icon, tone }: { label: string; value: ReactNode; icon?: ReactNode; tone?: "lime" | "blue" }) {
  return (
    <div className="fz-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">{icon}{label}</div>
      <div className={cn("mt-1.5 font-display text-xl font-bold", tone === "lime" && "text-accent", tone === "blue" && "text-primary")}>{value}</div>
    </div>
  );
}

export function Pill({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "lime" | "blue" | "red" }) {
  const t = { muted: "bg-secondary text-muted-foreground", lime: "bg-accent/15 text-accent", blue: "bg-primary/20 text-primary", red: "bg-destructive/15 text-destructive" };
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold", t[tone])}>{children}</span>;
}

export function Empty({ title, sub, icon }: { title: string; sub?: string; icon?: ReactNode }) {
  return (
    <div className="fz-card grid place-items-center gap-2 p-10 text-center">
      <div className="text-3xl">{icon ?? "⚽"}</div>
      <div className="font-bold">{title}</div>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}
