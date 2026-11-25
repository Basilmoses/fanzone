<script lang="ts">
  import { questions } from "$lib/questions";
  import { goto } from "$app/navigation";
  let active = $state(false);
  let index = $state(0);
  let selected = $state<number | null>(null);
  let score = $state(0);
  let finished = $state(false);
  let section = $state("home");
  const current = $derived(questions[index]);
  function start() { active = true; index = 0; score = 0; selected = null; finished = false; section = "play"; }
  function answer(i: number) { if (selected !== null) return; selected = i; if (i === current.answer) score += 1; }
  function next() { if (index === questions.length - 1) finished = true; else { index += 1; selected = null; } }
</script>
<svelte:head><title>FanZone — Prove You Know Football</title><meta name="description" content="Compete in football knowledge quizzes, head-to-head challenges and tournaments." /></svelte:head>
<div class="shell">
  <header><a class="brand" href="/">FAN<span>ZONE</span><small> FOOTBALL CHALLENGE</small></a><nav><button onclick={() => section = "home"}>Home</button><button onclick={() => section = "play"}>Play</button><button onclick={() => section = "leaderboard"}>Leaderboard</button><button onclick={() => section = "wallet"}>Wallet</button><button onclick={() => section = "profile"}>Profile</button><button onclick={() => goto("/account")}>Sign in</button></nav><div class="avatar">F</div></header>
  {#if section === "play" && active && !finished}
    <main class="quiz"><div class="eyebrow">QUICK QUIZ · QUESTION {index + 1} OF {questions.length}</div><div class="progress"><span style={`width:${(index + 1) / questions.length * 100}%`}></span></div><div class="quiz-card"><div class="tag">{current.category}</div><h1>{current.question}</h1><div class="options">{#each current.options as option, i}<button class:chosen={selected === i} class:correct={selected !== null && i === current.answer} class:wrong={selected === i && i !== current.answer} onclick={() => answer(i)}>{String.fromCharCode(65+i)} <span>{option}</span></button>{/each}</div>{#if selected !== null}<p class="feedback">{selected === current.answer ? "Correct answer!" : "Not quite. Keep going!"}</p><button class="primary next" onclick={next}>{index === questions.length - 1 ? "See results" : "Next question"}</button>{/if}</div></main>
  {:else if finished}
    <main class="hero"><div class="eyebrow">QUIZ COMPLETE</div><h1>You scored <em>{score}/{questions.length}</em></h1><p>{score >= 8 ? "Excellent football knowledge." : "Good effort. Come back and beat your score."}</p><button class="primary" onclick={start}>Play again</button><button class="secondary" onclick={() => { section = "home"; active = false; }}>Back home</button></main>
  {:else if section === "leaderboard"}
    <main><div class="eyebrow">THE TOP FANS</div><h1>Leaderboard</h1><p class="muted">Demo standings — connect the live competition backend to publish verified scores.</p><div class="panel">{#each ["Alex Morgan","Samuel K.","Tunde A.","Grace O.","David M."] as name, i}<div class="rank"><b>#{i+1}</b><span>{name}</span><strong>{98-i*4} pts</strong></div>{/each}</div></main>
  {:else if section === "wallet"}
    <main><div class="eyebrow">YOUR ACCOUNT</div><h1>Wallet</h1><div class="balance"><span>Available balance</span><strong>₦0.00</strong><small>Demo wallet · No real funds are held or transferred</small></div><div class="panel"><h3>Recent activity</h3><p class="muted">Your transactions will appear here when wallet services are connected.</p></div></main>
  {:else if section === "profile"}
    <main><div class="eyebrow">PLAYER PROFILE</div><h1>Welcome, Fan</h1><div class="panel"><p>Track your quiz performance, challenge history and achievements here.</p><p class="muted">Sign-in and account persistence are not connected in this starter deployment.</p></div></main>
  {:else}
    <main class="hero"><div class="pill">⚽ FOOTBALL KNOWLEDGE. REAL COMPETITION.</div><h1>DON’T JUST WATCH FOOTBALL.<br/><em>PROVE YOU KNOW IT.</em></h1><p>Challenge your football knowledge, compete with fans and climb the leaderboard.</p><div class="actions"><button class="primary" onclick={start}>Start a quick quiz <span>→</span></button><button class="secondary" onclick={() => section = "leaderboard"}>View leaderboard</button></div><div class="stats"><div><strong>10</strong><span>Questions per quiz</span></div><div><strong>2 min</strong><span>Quick challenge</span></div><div><strong>1v1</strong><span>Head-to-head</span></div></div></main>
    <section class="features"><article><div>⚡</div><h3>Quick Quiz</h3><p>Test your knowledge in a fast-paced round.</p></article><article><div>🤝</div><h3>Head-to-Head</h3><p>Challenge another fan and settle the score.</p></article><article><div>🏆</div><h3>Daily Tournaments</h3><p>Compete daily and rise through the ranks.</p></article></section>
  {/if}
  <footer>FANZONE <span>·</span> Built for fans who know the game. <small>Competition demo — no betting or real-money transactions are enabled.</small></footer>
</div>
