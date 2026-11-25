import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Gift, Info, Ticket } from "lucide-react";
import { toast } from "sonner";
import { PageTitle, SectionHead } from "@/components/fz/AppShell";
import { Empty } from "@/components/fz/bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFz, uid } from "@/lib/fanzone/store";
import { ago, fmt } from "@/lib/fanzone/format";
import { meta } from "@/lib/fanzone/meta";
import type { Txn } from "@/lib/fanzone/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/wallet")({
  head: () => meta("Wallet", "Your FZ Points balance, rewards and demo transaction history."),
  component: Wallet,
});

const ICON = { deposit: ArrowDownLeft, withdraw: ArrowUpRight, reward: Gift, entry: Ticket };

function Wallet() {
  const { state, update, ready } = useFz();
  const [tab, setTab] = useState<"all" | "reward">("all");
  const [mode, setMode] = useState<"deposit" | "withdraw" | null>(null);
  const [amt, setAmt] = useState("500");
  const [busy, setBusy] = useState(false);
  const list = tab === "all" ? state.txns : state.txns.filter((t) => t.type === "reward");
  const rewards = state.txns.filter((t) => t.type === "reward").reduce((s, t) => s + t.amount, 0);

  const submit = () => {
    const n = Math.floor(Number(amt));
    if (!n || n <= 0) { toast.error("Enter a valid amount"); return; }
    if (mode === "withdraw" && n > state.balance) { toast.error("Not enough balance"); return; }
    setBusy(true);
    setTimeout(() => {
      const t: Txn = { id: uid(), type: mode!, label: mode === "deposit" ? "Demo top-up" : "Demo withdrawal", amount: mode === "deposit" ? n : -n, date: Date.now() };
      update((s) => ({ ...s, balance: s.balance + t.amount, txns: [t, ...s.txns] }));
      toast.success(`Simulated ${mode} of ${fmt(n)} FZ complete`);
      setBusy(false); setMode(null);
    }, 900);
  };

  return (
    <div>
      <PageTitle title="Wallet" />
      <div className="relative overflow-hidden rounded-3xl bg-brand p-6 shadow-glow">
        <div className="pitch-lines absolute inset-0 opacity-60" />
        <div className="relative">
          <p className="text-sm opacity-80">Available balance</p>
          <p className="mt-1 font-display text-4xl font-black">{fmt(state.balance)} <span className="text-lg text-accent">FZ</span></p>
          <p className="mt-1 text-xs opacity-75">Lifetime rewards: {fmt(rewards)} FZ</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="lime" onClick={() => setMode("deposit")}><ArrowDownLeft /> Deposit</Button>
            <Button variant="glass" onClick={() => setMode("withdraw")}><ArrowUpRight /> Withdraw</Button>
          </div>
        </div>
      </div>
      <div className="fz-card mt-4 flex gap-3 p-4 text-xs text-muted-foreground">
        <Info className="size-4 shrink-0 text-primary" />
        FANZONE is free-to-play. FZ Points have no cash value; all deposits and withdrawals here are simulated.
      </div>
      <SectionHead title="History" action={
        <div className="flex gap-1 rounded-full bg-secondary p-1 text-xs font-bold">
          {(["all", "reward"] as const).map((k) => <button key={k} onClick={() => setTab(k)} className={cn("rounded-full px-3 py-1", tab === k ? "bg-accent text-accent-foreground" : "text-muted-foreground")}>{k === "all" ? "All" : "Rewards"}</button>)}
        </div>} />
      {list.length === 0 ? <Empty title="No transactions yet" sub="Play a quiz to earn rewards." /> : (
        <div className="fz-card divide-y divide-border">
          {list.map((t) => { const I = ICON[t.type]; return (
            <div key={t.id} className="flex items-center gap-3 p-4">
              <span className={cn("grid size-10 place-items-center rounded-xl", t.amount > 0 ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive")}><I className="size-5" /></span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{t.label}</p><p className="text-xs text-muted-foreground">{ready ? ago(t.date) : ""}</p></div>
              <span className={cn("font-display text-sm font-bold", t.amount > 0 ? "text-accent" : "text-foreground")}>{t.amount > 0 ? "+" : ""}{fmt(t.amount)}</span>
            </div>); })}
        </div>
      )}
      <Dialog open={!!mode} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{mode === "deposit" ? "Demo deposit" : "Demo withdrawal"}</DialogTitle><DialogDescription>Simulated only — no real money moves.</DialogDescription></DialogHeader>
          <Input type="number" inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value)} className="h-12 font-display text-lg" />
          <div className="grid grid-cols-4 gap-2">{[100, 500, 1000, 2500].map((v) => <Button key={v} variant="glass" size="sm" onClick={() => setAmt(String(v))}>{fmt(v)}</Button>)}</div>
          <Button variant="lime" size="lg" disabled={busy} onClick={submit}>{busy ? "Processing…" : "Confirm"}</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
