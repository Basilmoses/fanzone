import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, ArrowLeft, Flag, HelpCircle, LayoutGrid, Pencil, Plus, Trash2, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/fz/AppShell";
import { Avatar, Empty, Pill, Stat } from "@/components/fz/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, PLAYERS } from "@/lib/fanzone/data";
import { useFz, uid } from "@/lib/fanzone/store";
import { countdown, fmt } from "@/lib/fanzone/format";
import { meta } from "@/lib/fanzone/meta";
import type { Category, Question, Tournament } from "@/lib/fanzone/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => meta("Admin", "FANZONE admin console: users, questions, tournaments and moderation."),
  component: Admin,
});

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "users", label: "Users", icon: Users },
  { id: "questions", label: "Questions", icon: HelpCircle },
  { id: "tournaments", label: "Tournaments", icon: Trophy },
  { id: "flags", label: "Flagged", icon: Flag },
] as const;
type Tab = (typeof TABS)[number]["id"];

const FEED = ["TekeKing scored 10/10 in Quick Quiz", "AmaraGoals beat Drogba11 in H2H (9–7)", "142 fans joined Premier League Showdown", "KanoTiki flagged: 10/10 in 11 seconds", "LagosMaestro reached Level 39"];

function Admin() {
  const { state, update, ready } = useFz();
  const [tab, setTab] = useState<Tab>("overview");
  const [editQ, setEditQ] = useState<Question | null>(null);
  const [editT, setEditT] = useState<Tournament | null>(null);
  const [filter, setFilter] = useState("");

  const saveQ = (q: Question) => {
    if (!q.q.trim() || q.options.some((o) => !o.trim())) { toast.error("Fill in the question and all four answers"); return; }
    update((s) => ({ ...s, questions: s.questions.some((x) => x.id === q.id) ? s.questions.map((x) => (x.id === q.id ? q : x)) : [q, ...s.questions] }));
    setEditQ(null); toast.success("Question saved");
  };
  const saveT = (t: Tournament) => {
    if (!t.name.trim()) { toast.error("Name required"); return; }
    update((s) => ({ ...s, tournaments: s.tournaments.some((x) => x.id === t.id) ? s.tournaments.map((x) => (x.id === t.id ? t : x)) : [t, ...s.tournaments] }));
    setEditT(null); toast.success("Tournament saved");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3"><Logo /><Pill tone="blue">ADMIN</Pill></div>
        <Button asChild variant="glass" size="sm"><Link to="/"><ArrowLeft /> Back to app</Link></Button>
      </header>
      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4">
        {TABS.map(({ id, label, icon: I }) => (
          <button key={id} onClick={() => setTab(id)} className={cn("flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold", tab === id ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground")}><I className="size-4" />{label}</button>
        ))}
      </div>

      <div key={tab} className="animate-rise">
        {tab === "overview" && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="Registered users" value="48,213" tone="lime" />
              <Stat label="Games today" value="12,904" />
              <Stat label="Questions" value={state.questions.length} tone="blue" />
              <Stat label="Live tournaments" value={state.tournaments.length} />
            </div>
            <div className="fz-card mt-4 p-5">
              <p className="mb-4 font-bold">Games played · last 7 days</p>
              <div className="flex h-36 items-end gap-2">
                {[42, 58, 51, 70, 66, 88, 95].map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1"><div className="w-full rounded-t-lg bg-brand" style={{ height: `${v}%` }} /><span className="text-[10px] text-muted-foreground">{"MTWTFSS"[i]}</span></div>
                ))}
              </div>
            </div>
            <div className="fz-card mt-4 divide-y divide-border">
              <p className="flex items-center gap-2 p-4 font-bold"><Activity className="size-4 text-accent" /> Live competition activity</p>
              {FEED.map((f, i) => <p key={f} className="p-4 text-sm text-muted-foreground">{f}<span className="float-right text-xs">{i + 1}m ago</span></p>)}
            </div>
          </>
        )}

        {tab === "users" && (
          <div className="fz-card divide-y divide-border">
            <div className="p-3"><Input placeholder="Search users…" value={filter} onChange={(e) => setFilter(e.target.value)} /></div>
            {PLAYERS.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase())).map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-4 text-sm">
                <Avatar src={p.avatar} size={36} />
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.name} {p.country}</p><p className="text-xs text-muted-foreground">Lvl {p.level} · {p.wins} wins · {p.accuracy}%</p></div>
                {state.flagged.includes(p.id) ? <Pill tone="red">Flagged</Pill> : <Pill tone="lime">Active</Pill>}
              </div>
            ))}
          </div>
        )}

        {tab === "questions" && (
          <>
            <div className="mb-3 flex justify-between"><p className="text-sm text-muted-foreground">{state.questions.length} questions in bank</p>
              <Button variant="lime" size="sm" onClick={() => setEditQ({ id: uid(), category: "Premier League", q: "", options: ["", "", "", ""], answer: 0 })}><Plus /> Add question</Button></div>
            {state.questions.length === 0 ? <Empty title="No questions" /> : (
              <div className="fz-card divide-y divide-border">
                {state.questions.map((q) => (
                  <div key={q.id} className="flex items-start gap-3 p-4 text-sm">
                    <div className="min-w-0 flex-1"><Pill tone="blue">{q.category}</Pill><p className="mt-1.5 font-semibold">{q.q}</p><p className="text-xs text-accent">✓ {q.options[q.answer]}</p></div>
                    <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditQ(q)}><Pencil /></Button>
                    <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => { update((s) => ({ ...s, questions: s.questions.filter((x) => x.id !== q.id) })); toast("Question deleted"); }}><Trash2 className="text-destructive" /></Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "tournaments" && (
          <>
            <div className="mb-3 flex justify-end"><Button variant="lime" size="sm" onClick={() => setEditT({ id: uid(), name: "", category: "Mixed", entry: "Free entry", prize: "10,000 FZ Points", participants: 0, max: 1000, endsAt: Date.now() + 8 * 3600_000, rules: ["10 questions, 2 minutes", "One entry per player"] })}><Plus /> New tournament</Button></div>
            <div className="fz-card divide-y divide-border">
              {state.tournaments.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-4 text-sm">
                  <div className="min-w-0 flex-1"><p className="font-semibold">{t.name}</p><p className="text-xs text-muted-foreground">{t.category} · {fmt(t.participants)}/{fmt(t.max)} · ends in {ready ? countdown(t.endsAt - Date.now()) : "…"}</p></div>
                  <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditT(t)}><Pencil /></Button>
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => update((s) => ({ ...s, tournaments: s.tournaments.filter((x) => x.id !== t.id) }))}><Trash2 className="text-destructive" /></Button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "flags" && (
          state.flagged.length === 0 ? <Empty title="No flagged accounts" sub="All clear." icon="✅" /> : (
            <div className="grid gap-3 md:grid-cols-2">
              {PLAYERS.filter((p) => state.flagged.includes(p.id)).map((p) => (
                <div key={p.id} className="fz-card p-4">
                  <div className="flex items-center gap-3"><Avatar src={p.avatar} size={40} /><div className="flex-1"><p className="font-bold">{p.name}</p><p className="text-xs text-destructive">Suspicious answer speed (avg 1.1s)</p></div></div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button variant="glass" size="sm" onClick={() => { update((s) => ({ ...s, flagged: s.flagged.filter((x) => x !== p.id) })); toast.success(`${p.name} cleared`); }}>Clear</Button>
                    <Button variant="destructive" size="sm" onClick={() => { update((s) => ({ ...s, flagged: s.flagged.filter((x) => x !== p.id) })); toast(`${p.name} suspended`); }}>Suspend</Button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <Dialog open={!!editQ} onOpenChange={(o) => !o && setEditQ(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Question</DialogTitle></DialogHeader>
          {editQ && (
            <div className="space-y-3">
              <Select value={editQ.category} onValueChange={(v) => setEditQ({ ...editQ, category: v as Category })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
              <Input placeholder="Question" value={editQ.q} onChange={(e) => setEditQ({ ...editQ, q: e.target.value })} />
              {editQ.options.map((o, k) => (
                <div key={k} className="flex items-center gap-2">
                  <button type="button" onClick={() => setEditQ({ ...editQ, answer: k })} className={cn("grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold", editQ.answer === k ? "bg-accent text-accent-foreground" : "bg-secondary")}>{"ABCD"[k]}</button>
                  <Input placeholder={`Answer ${"ABCD"[k]}`} value={o} onChange={(e) => { const op = [...editQ.options]; op[k] = e.target.value; setEditQ({ ...editQ, options: op }); }} />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Tap a letter to mark the correct answer.</p>
              <Button variant="lime" className="w-full" onClick={() => saveQ(editQ)}>Save question</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!editT} onOpenChange={(o) => !o && setEditT(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Tournament</DialogTitle></DialogHeader>
          {editT && (
            <div className="space-y-3">
              <Label>Name</Label><Input value={editT.name} onChange={(e) => setEditT({ ...editT, name: e.target.value })} />
              <Label>Prize pool (points)</Label><Input value={editT.prize} onChange={(e) => setEditT({ ...editT, prize: e.target.value })} />
              <Label>Max participants</Label><Input type="number" value={editT.max} onChange={(e) => setEditT({ ...editT, max: Number(e.target.value) || 0 })} />
              <Button variant="lime" className="w-full" onClick={() => saveT(editT)}>Save tournament</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
