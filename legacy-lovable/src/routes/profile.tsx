import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, RotateCcw, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageTitle, SectionHead } from "@/components/fz/AppShell";
import { Avatar, Empty, Stat } from "@/components/fz/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BADGES, ME_AVATAR } from "@/lib/fanzone/data";
import { useFz } from "@/lib/fanzone/store";
import { accuracy } from "@/lib/fanzone/scoring";
import { ago, fmt } from "@/lib/fanzone/format";
import { meta } from "@/lib/fanzone/meta";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => meta("Profile", "Your FANZONE stats, achievement badges and recent activity."),
  component: Profile,
});

function Profile() {
  const { state, update, reset, ready } = useFz();
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(state.username);
  return (
    <div>
      <PageTitle title="Profile" right={<Button asChild variant="glass" size="sm" className="md:hidden"><Link to="/admin"><Shield /> Admin</Link></Button>} />
      <div className="fz-card flex flex-col items-center p-6 text-center">
        <Avatar src={ME_AVATAR} size={88} ring="lime" />
        {edit ? (
          <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!name.trim()) return; update((s) => ({ ...s, username: name.trim().slice(0, 20) })); setEdit(false); toast.success("Username updated"); }}>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus /><Button variant="lime">Save</Button>
          </form>
        ) : (
          <button onClick={() => { setName(state.username); setEdit(true); }} className="mt-4 flex items-center gap-2 font-display text-xl font-bold">{state.username} <Pencil className="size-4 text-muted-foreground" /></button>
        )}
        <p className="mt-1 text-sm text-muted-foreground">Level 18 · {fmt(state.points)} points</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Games played" value={state.games} />
        <Stat label="Total wins" value={state.wins} tone="lime" />
        <Stat label="Accuracy" value={`${accuracy(state.correct, state.answered)}%`} />
        <Stat label="Highest score" value={fmt(state.best)} tone="blue" />
      </div>
      <SectionHead title={`Badges · ${state.badges.length}/${BADGES.length}`} />
      <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
        {BADGES.map((b) => { const got = state.badges.includes(b.id); return (
          <div key={b.id} className={cn("fz-card p-3 text-center", !got && "opacity-35 grayscale")} title={b.desc}>
            <div className="text-3xl">{b.icon}</div><p className="mt-1 text-xs font-bold">{b.name}</p><p className="text-[10px] text-muted-foreground">{b.desc}</p>
          </div>); })}
      </div>
      <SectionHead title="Recent activity" />
      {state.activity.length === 0 ? <Empty title="No activity yet" /> : (
        <div className="fz-card divide-y divide-border">
          {state.activity.slice(0, 8).map((a) => (
            <div key={a.id} className="flex items-center gap-3 p-4 text-sm">
              <span className="flex-1">{a.text}<br /><span className="text-xs text-muted-foreground">{ready ? ago(a.date) : ""}</span></span>
              {a.points ? <span className="font-display font-bold text-accent">+{a.points}</span> : null}
            </div>))}
        </div>
      )}
      <Button variant="ghost" className="mt-6 w-full text-muted-foreground" onClick={() => { reset(); toast("Demo data reset"); }}><RotateCcw /> Reset demo data</Button>
    </div>
  );
}
