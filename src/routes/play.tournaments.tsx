import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, Info, Users } from "lucide-react";
import { toast } from "sonner";
import { PageTitle } from "@/components/fz/AppShell";
import { Empty, Pill } from "@/components/fz/bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useFz, uid } from "@/lib/fanzone/store";
import { countdown, fmt } from "@/lib/fanzone/format";
import { meta } from "@/lib/fanzone/meta";
import type { Tournament } from "@/lib/fanzone/types";

export const Route = createFileRoute("/play/tournaments")({
  head: () => meta("Daily Tournaments", "Join free daily football knowledge tournaments and compete for points and badges."),
  component: Tournaments,
});

function Tournaments() {
  const { state, update, ready } = useFz();
  const [now, setNow] = useState(Date.now());
  const [rules, setRules] = useState<Tournament | null>(null);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const join = (t: Tournament) => {
    update((s) => ({
      ...s, joined: [...s.joined, t.id], badges: [...new Set([...s.badges, "b5"])],
      tournaments: s.tournaments.map((x) => (x.id === t.id ? { ...x, participants: x.participants + 1 } : x)),
      activity: [{ id: uid(), text: `Joined ${t.name}`, date: Date.now() }, ...s.activity],
    }));
    toast.success(`You're in! ${t.name}`, { description: "Your quiz unlocks when the tournament round opens." });
  };

  return (
    <div>
      <Link to="/play" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="size-4" /> Play</Link>
      <PageTitle title="Daily Tournaments" sub="Free to enter. Prize pools are FZ Points, not cash." right={<Pill tone="lime">{state.joined.length} joined</Pill>} />
      {state.tournaments.length === 0 && <Empty title="No tournaments right now" sub="Check back soon." icon="🏆" />}
      <div className="grid gap-4 md:grid-cols-2">
        {state.tournaments.map((t) => {
          const joined = state.joined.includes(t.id);
          return (
            <div key={t.id} className="fz-card overflow-hidden">
              <div className="bg-brand pitch-lines p-5">
                <div className="flex items-start justify-between gap-2">
                  <Pill tone="lime">{t.category}</Pill>
                  <span className="flex items-center gap-1 rounded-full bg-background/40 px-2.5 py-1 font-display text-xs font-bold tabular-nums"><Clock className="size-3" /> {ready ? countdown(t.endsAt - now) : "--:--:--"}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{t.name}</h3>
                <p className="text-sm opacity-90">Prize pool: <b>{t.prize}</b></p>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Entry</span><span className="font-semibold">{t.entry}</span></div>
                <div className="flex justify-between text-sm"><span className="flex items-center gap-1 text-muted-foreground"><Users className="size-3.5" /> Participants</span><span className="font-semibold">{fmt(t.participants)} / {fmt(t.max)}</span></div>
                <Progress value={(t.participants / t.max) * 100} className="h-1.5" />
                <div className="flex gap-2 pt-1">
                  <Button variant="glass" className="flex-1" onClick={() => setRules(t)}><Info /> Rules</Button>
                  {joined ? (
                    <Button variant="glass" className="flex-1 text-accent" disabled><CheckCircle2 /> Joined</Button>
                  ) : (
                    <Button variant="lime" className="flex-1" onClick={() => join(t)}>Join Tournament</Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <Dialog open={!!rules} onOpenChange={(o) => !o && setRules(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{rules?.name}</DialogTitle><DialogDescription>Competition rules</DialogDescription></DialogHeader>
          <ul className="space-y-2 text-sm">{rules?.rules.map((r) => <li key={r} className="flex gap-2"><span className="text-accent">●</span>{r}</li>)}<li className="flex gap-2"><span className="text-accent">●</span>Prizes are FZ Points only — no cash value.</li></ul>
        </DialogContent>
      </Dialog>
    </div>
  );
}
