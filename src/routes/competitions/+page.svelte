<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  type User = { id: string; displayName: string; email: string };
  type Question = { id: string; category: string; question: string; options: string[] };
  type Competition = { id: string; title: string; type: string; status: string; inviteCode?: string | null; endsAt?: number; creatorName?: string; opponentName?: string | null; winnerUserId?: string | null };
  type Entry = { id: string; displayName: string; score: number; totalQuestions: number };
  let user = $state<User | null>(null);
  let competition = $state<Competition | null>(null);
  let myCompetitions = $state<Competition[]>([]);
  let daily = $state<Competition | null>(null);
  let dailyEntry = $state<{ id: string; status: string; score: number } | null>(null);
  let entries = $state<Entry[]>([]);
  let inviteCode = $state("");
  let questions = $state<Question[]>([]);
  let answers = $state<Record<string, number>>({});
  let attemptId = $state("");
  let index = $state(0);
  let score = $state(0);
  let finished = $state(false);
  let busy = $state(false);
  let error = $state("");
  const current = $derived(questions[index] ?? null);
  const selected = $derived(current ? (answers[current.id] ?? null) : null);

  onMount(async () => {
    try { user = (await (await fetch("/api/auth/me")).json()).user; } catch { user = null; }
    await refresh();
  });

  async function refresh() {
    error = "";
    try {
      const [dailyResponse, boardResponse, challengesResponse] = await Promise.all([
        fetch("/api/tournaments/daily"),
        fetch("/api/leaderboard?scope=daily"),
        user ? fetch("/api/competitions") : Promise.resolve(null)
      ]);
      const dailyData = await dailyResponse.json();
      const boardData = await boardResponse.json();
      if (dailyResponse.ok) { daily = dailyData.competition; dailyEntry = dailyData.entry; }
      if (boardResponse.ok) entries = boardData.entries ?? [];
      if (challengesResponse) {
        const challengeData = await challengesResponse.json();
        if (challengesResponse.ok) myCompetitions = challengeData.competitions ?? [];
      }
    } catch { error = "Could not load competitions."; }
  }

  async function start(mode: "daily" | "head_to_head", id?: string) {
    if (!user) { await goto("/account"); return; }
    busy = true;
    error = "";
    try {
      const response = mode === "daily"
        ? await fetch("/api/tournaments/daily", { method: "POST" })
        : await fetch("/api/quizzes/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode, competitionId: id }) });
      const data = await response.json();
      if (!response.ok) { error = data.error ?? "Could not start the competition."; return; }
      competition = data.competition ?? (id ? { id, title: "Head-to-Head Challenge", type: mode, status: "active" } : null);
      questions = data.attempt.questions;
      attemptId = data.attempt.id;
      answers = {};
      index = 0;
      finished = false;
    } catch { error = "Could not start the competition."; }
    finally { busy = false; }
  }

  async function submitQuiz() {
    if (selected === null) { error = "Choose an answer before continuing."; return; }
    if (index < questions.length - 1) { index += 1; error = ""; return; }
    busy = true;
    error = "";
    try {
      const response = await fetch("/api/quizzes/" + encodeURIComponent(attemptId) + "/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: questions.map((q) => ({ questionId: q.id, selectedIndex: answers[q.id] })) })
      });
      const data = await response.json();
      if (!response.ok) { error = data.error ?? "Could not save your result."; return; }
      score = data.result.score;
      finished = true;
      await refresh();
    } catch { error = "Could not save your result."; }
    finally { busy = false; }
  }

  async function createChallenge() {
    if (!user) { await goto("/account"); return; }
    error = "";
    try {
      const response = await fetch("/api/competitions", { method: "POST" });
      const data = await response.json();
      if (!response.ok) { error = data.error ?? "Could not create a challenge."; return; }
      competition = data.competition;
      await refresh();
    } catch { error = "Could not create a challenge."; }
  }

  async function join(event: SubmitEvent) {
    event.preventDefault();
    if (!user) { await goto("/account"); return; }
    error = "";
    try {
      const response = await fetch("/api/competitions/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inviteCode }) });
      const data = await response.json();
      if (!response.ok) { error = data.error ?? "Could not join that challenge."; return; }
      await start("head_to_head", data.competition.id);
    } catch { error = "Could not join that challenge."; }
  }

  async function checkChallenge(item: Competition) {
    try {
      const response = await fetch("/api/competitions/" + encodeURIComponent(item.id));
      const data = await response.json();
      if (!response.ok) { error = data.error ?? "Could not refresh the challenge."; return; }
      competition = data.competition;
      await refresh();
    } catch { error = "Could not refresh the challenge."; }
  }
</script>
<svelte:head><title>FanZone Competitions</title><meta name="description" content="Join FanZone daily football tournaments and head-to-head quizzes." /></svelte:head>
<div class="shell">
  <header><a class="brand" href="/">FAN<span>ZONE</span><small> FOOTBALL CHALLENGE</small></a><nav><a href="/">Home</a></nav>{#if user}<span class="user">{user.displayName}</span>{:else}<button class="primary" onclick={() => goto("/account")}>Sign in</button>{/if}</header>
  {#if current && !finished}
    <main class="quiz"><div class="eyebrow">COMPETITION · QUESTION {index + 1} OF {questions.length}</div><div class="progress"><span style:width={((index + 1) / questions.length) * 100 + "%"}></span></div>
      <div class="quiz-card"><div class="tag">{current.category}</div><h1>{current.question}</h1><div class="options">{#each current.options as option, i}<button class:chosen={selected === i} onclick={() => { answers = { ...answers, [current.id]: i }; error = ""; }} disabled={busy}>{String.fromCharCode(65 + i)} <span>{option}</span></button>{/each}</div>
        <p class="muted">Server-scored · One entry per competition</p>{#if error}<p class="error" role="alert">{error}</p>{/if}<button class="primary next" onclick={submitQuiz} disabled={busy}>{busy ? "Saving…" : index === questions.length - 1 ? "Submit quiz" : "Next question"}</button></div></main>
  {:else if finished}
    <main class="hero"><div class="eyebrow">RESULT SAVED</div><h1>You scored <em>{score}/{questions.length}</em></h1><p>Your competition score is recorded.</p><button class="primary" onclick={refresh}>Back to competitions</button></main>
  {:else}
    <main>
      <div class="eyebrow">COMPETE WITH FANS</div><h1>Competitions</h1>
      <section class="panel daily"><h2>Daily FanZone Challenge</h2><p class="muted">Answer ten server-selected questions. The leaderboard ranks score first, then completion time. Each player gets one entry per day.</p>
        {#if daily}<p class="muted">{daily.date} · UTC day</p>{/if}
        {#if dailyEntry?.status === "completed"}<p>Your saved score today: <strong>{dailyEntry.score}/10</strong></p>
        {:else}<button class="primary" onclick={() => start("daily")} disabled={busy}>{dailyEntry?.status === "active" ? "Continue today's entry" : "Enter today's tournament"}</button>{/if}
      </section>
      <section class="panel"><h2>Head-to-Head</h2><p class="muted">Create an invite code to share with a friend, or enter a code you received. Both players answer the same question set.</p>
        <button class="primary" onclick={createChallenge}>Create challenge</button>
        {#if competition?.inviteCode}<p class="notice">Your invite code: <strong class="code">{competition.inviteCode}</strong></p>{/if}
        <form onsubmit={join}><label>Challenge code<input bind:value={inviteCode} maxlength="12" placeholder="12-character code" required /></label><button class="secondary">Join challenge</button></form>
      </section>
      {#if user}<section class="panel"><h2>Your challenges</h2>{#each myCompetitions as item}<div class="rank"><span>{item.status} · {item.opponentName ?? item.creatorName ?? item.title}</span>
          {#if item.status === "open"}<span class="code">{item.inviteCode}</span><button class="secondary" onclick={() => checkChallenge(item)}>Check</button>
          {:else if item.status === "active"}<button class="primary" onclick={() => start("head_to_head", item.id)} disabled={busy}>Play</button>
          {:else}<span class="muted">{item.winnerUserId === user.id ? "You won" : "Completed"}</span>{/if}
        </div>{:else}<p class="muted">No challenges yet.</p>{/each}</section>{/if}
      <section class="panel"><h2>Today's leaderboard</h2>{#each entries as row, i}<div class="rank"><b>#{i + 1}</b><span>{row.displayName}</span><strong>{row.score}/{row.totalQuestions}</strong></div>{:else}<p class="muted">No completed entries yet.</p>{/each}</section>
      {#if error}<p class="error" role="alert">{error}</p>{/if}
    </main>
  {/if}
  <footer>FANZONE <span>·</span> Competition scores are server-calculated. No real-money prizes or payments are enabled.</footer>
</div>
<style>
  nav a{color:#c8f169;text-decoration:none;font-size:13px}.user{color:#dce4dc;font-size:13px}
  main{max-width:760px;margin:0 auto;min-height:65vh;padding-bottom:50px}main h1{font-size:56px}
  .panel{margin:20px 0}.panel h2{margin-top:0}.muted{color:#8f9c92;font-size:12px;line-height:1.6}
  .daily{border-color:#c8f16955}.next{margin-top:12px}.error{color:#ff9898;font-size:13px}.notice{color:#c8f169}
  .code{font:700 16px monospace;letter-spacing:2px}.rank{gap:12px;flex-wrap:wrap}
  form{display:flex;align-items:end;gap:12px;margin-top:18px}label{display:grid;gap:7px;color:#dce4dc;font-size:13px;flex:1}
  input{background:#080d0a;border:1px solid #ffffff28;border-radius:7px;padding:13px;color:#fff;font:inherit;min-width:0}
  button:disabled{opacity:.65;cursor:wait}
  @media(max-width:650px){form{align-items:stretch;flex-direction:column}.rank{align-items:flex-start}}
</style>
