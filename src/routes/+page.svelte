<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  type User = { id: string; displayName: string; email: string };
  type Question = { id: string; category: string; question: string; options: string[] };
  type Entry = { id: string; displayName: string; score: number; totalQuestions: number };
  let user = $state<User | null>(null);
  let section = $state("home");
  let questions = $state<Question[]>([]);
  let answers = $state<Record<string, number>>({});
  let attemptId = $state("");
  let index = $state(0);
  let score = $state(0);
  let finished = $state(false);
  let busy = $state(false);
  let error = $state("");
  let entries = $state<Entry[]>([]);
  const current = $derived(questions[index] ?? null);
  const selected = $derived(current ? (answers[current.id] ?? null) : null);

  onMount(async () => {
    try { user = (await (await fetch("/api/auth/me")).json()).user; } catch { user = null; }
  });

  async function start() {
    error = "";
    if (!user) { await goto("/account"); return; }
    busy = true;
    try {
      const response = await fetch("/api/quizzes/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode: "quick" }) });
      const data = await response.json();
      if (!response.ok) { error = data.error ?? "Could not start the quiz."; return; }
      attemptId = data.attempt.id;
      questions = data.attempt.questions;
      answers = {};
      index = 0;
      finished = false;
      section = "play";
    } catch { error = "Could not connect to FanZone."; }
    finally { busy = false; }
  }

  async function next() {
    if (selected === null) { error = "Choose an answer before continuing."; return; }
    error = "";
    if (index < questions.length - 1) { index += 1; return; }
    busy = true;
    try {
      const response = await fetch("/api/quizzes/" + encodeURIComponent(attemptId) + "/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: questions.map((q) => ({ questionId: q.id, selectedIndex: answers[q.id] })) })
      });
      const data = await response.json();
      if (!response.ok) { error = data.error ?? "Could not save your score."; return; }
      score = data.result.score;
      finished = true;
    } catch { error = "Could not save your score."; }
    finally { busy = false; }
  }

  async function leaderboard() {
    await goto("/leaderboard");
  }

  async function history() {
    section = "profile";
    if (!user) return;
    try {
      const response = await fetch("/api/quizzes/history");
      const data = await response.json();
      if (response.ok) entries = data.attempts ?? [];
      else error = data.error ?? "Quiz history is unavailable.";
    } catch { error = "Quiz history is unavailable."; }
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    user = null;
    section = "home";
  }
</script>
<svelte:head><title>FanZone — Prove You Know Football</title><meta name="description" content="Compete in football knowledge quizzes, head-to-head challenges and tournaments." /></svelte:head>
<div class="shell">
  <header><a class="brand" href="/">FAN<span>ZONE</span><small> FOOTBALL CHALLENGE</small></a>
    <nav><button onclick={() => section = "home"}>Home</button><button onclick={start}>Play</button><button onclick={() => goto("/competitions")}>Competitions</button><button onclick={leaderboard}>Leaderboard</button><button onclick={history}>Profile</button></nav>
    {#if user}<button class="account" onclick={history}>{user.displayName.slice(0,1).toUpperCase()}</button>{:else}<button class="account" onclick={() => goto("/account")}>Sign in</button>{/if}
  </header>
  {#if section === "play" && !finished && current}
    <main class="quiz"><div class="eyebrow">QUICK QUIZ · QUESTION {index + 1} OF {questions.length}</div><div class="progress"><span style:width={((index + 1) / questions.length) * 100 + "%"}></span></div>
      <div class="quiz-card"><div class="tag">{current.category}</div><h1>{current.question}</h1><div class="options">{#each current.options as option, i}<button class:chosen={selected === i} onclick={() => { answers = { ...answers, [current.id]: i }; error = ""; }} disabled={busy}>{String.fromCharCode(65 + i)} <span>{option}</span></button>{/each}</div>
        <p class="muted">Your score is calculated when you submit.</p>{#if error}<p class="error" role="alert">{error}</p>{/if}<button class="primary next" onclick={next} disabled={busy}>{busy ? "Saving…" : index === questions.length - 1 ? "Submit quiz" : "Next question"}</button></div></main>
  {:else if section === "play" && finished}
    <main class="hero"><div class="eyebrow">RESULT SAVED</div><h1>You scored <em>{score}/{questions.length}</em></h1><p>Your verified result is saved to your FanZone history.</p><button class="primary" onclick={start}>Play again</button><button class="secondary" onclick={() => section = "home"}>Back home</button></main>
  {:else if section === "leaderboard"}
    <main><div class="eyebrow">ALL-TIME STANDINGS</div><h1>Leaderboard</h1><div class="panel">{#each entries as row, i}<div class="rank"><b>#{i + 1}</b><span>{row.displayName}</span><strong>{row.score} pts</strong></div>{:else}<p class="muted">No saved scores yet.</p>{/each}</div></main>
  {:else if section === "profile"}
    <main><div class="eyebrow">PLAYER PROFILE</div><h1>{user ? "Welcome, " + user.displayName : "Your profile"}</h1>
      {#if user}<div class="panel"><p>{user.email}</p><p class="muted">Your saved quiz history appears here.</p><button class="secondary" onclick={() => goto("/players/" + encodeURIComponent(user?.id ?? ""))}>View player profile</button><button class="secondary" onclick={signOut}>Sign out</button></div><h2>Recent quizzes</h2><div class="panel">{#each entries as row}<div class="rank"><span>{row.displayName ?? "Quiz"}</span><strong>{row.score}/{row.totalQuestions}</strong></div>{:else}<p class="muted">Complete a quiz to start your history.</p>{/each}</div>
      {:else}<div class="panel"><p class="muted">Sign in to save your competition scores.</p><button class="primary" onclick={() => goto("/account")}>Create account or sign in</button></div>{/if}</main>
  {:else}
    <main class="hero"><div class="pill">⚽ FOOTBALL KNOWLEDGE. REAL COMPETITION.</div><h1>DON’T JUST WATCH FOOTBALL.<br/><em>PROVE YOU KNOW IT.</em></h1><p>Challenge your football knowledge, compete with fans and climb the leaderboard.</p><div class="actions"><button class="primary" onclick={start} disabled={busy}>Start a quick quiz <span>→</span></button><button class="secondary" onclick={leaderboard}>View leaderboard</button><button class="secondary" onclick={() => goto("/competitions")}>Competitions</button></div><div class="stats"><div><strong>10</strong><span>Questions per quiz</span></div><div><strong>15 min</strong><span>Quiz time limit</span></div><div><strong>1v1</strong><span>Head-to-head</span></div></div></main>
    <section class="features"><article><div>⚡</div><h3>Quick Quiz</h3><p>Test your knowledge in a fast-paced round.</p><button class="secondary" onclick={start}>Play now</button></article><article><div>🤝</div><h3>Head-to-Head</h3><p>Challenge another fan and settle the score.</p><button class="secondary" onclick={() => goto("/competitions")}>Create challenge</button></article><article><div>🏆</div><h3>Daily Tournament</h3><p>Compete daily and rise through the ranks.</p><button class="secondary" onclick={() => goto("/competitions")}>View tournament</button></article></section>
  {/if}
  {#if error && section !== "play"}<p class="error page-error" role="alert">{error}</p>{/if}
  <footer>FANZONE <span>·</span> Built for fans who know the game. <small>Competition demo — no betting or real-money transactions are enabled.</small></footer>
</div>
<style>
  .account{background:#c8f169;color:#10160e;border:0;border-radius:7px;padding:10px 13px;font-weight:700}
  .error{color:#ff9898;font-size:13px}.page-error{max-width:760px;margin:0 auto 20px}.next{margin-top:12px}
  .muted{color:#8f9c92;font-size:12px;line-height:1.6}
  .features article{display:flex;flex-direction:column;align-items:flex-start}.features article button{margin-top:auto}
  button:disabled{opacity:.65;cursor:wait}
  @media(max-width:950px){nav{gap:7px}nav button{font-size:11px;padding:6px 3px}}
  @media(max-width:700px){.account{margin-left:auto}}
</style>
