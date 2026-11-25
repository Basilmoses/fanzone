<script lang="ts">
  import { onMount } from "svelte";

  type Attempt = { id: string; mode: string; score: number; totalQuestions: number; submittedAt: number; durationMs: number | null };
  type Challenge = { id: string; title: string; status: string; createdAt: number; winnerUserId: string | null; creatorName: string | null; opponentName: string | null; score: number | null; totalQuestions: number | null; opponentScore: number | null };
  type Profile = {
    player: { id: string; displayName: string; createdAt: number };
    stats: { quizzes: number; points: number; questions: number; bestScore: number };
    attempts: Attempt[];
    challenges: Challenge[];
  };
  let profile = $state<Profile | null>(null);
  let loading = $state(true);
  let error = $state("");
  let playerId = "";

  onMount(() => {
    playerId = decodeURIComponent(window.location.pathname.split("/").filter(Boolean).at(-1) ?? "");
    loadProfile();
  });
  async function loadProfile() {
    try {
      const response = await fetch("/api/players/" + encodeURIComponent(playerId));
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load this profile.");
      profile = data;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Could not load this profile.";
    } finally { loading = false; }
  }
  function date(value: number) { return new Date(value * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }
  function result(challenge: Challenge) {
    if (challenge.status !== "completed") return challenge.status === "open" ? "Waiting for a player" : "In progress";
    if (!challenge.winnerUserId) return "Draw";
    return challenge.winnerUserId === playerId ? "Won" : "Lost";
  }
  const achievements = $derived.by(() => {
    if (!profile) return [];
    const badges: string[] = [];
    if (profile.stats.quizzes > 0) badges.push("First quiz");
    if (profile.stats.bestScore === 10) badges.push("Perfect ten");
    if (profile.challenges.some((item) => item.winnerUserId === playerId)) badges.push("Challenge winner");
    if (profile.stats.quizzes >= 10) badges.push("Dedicated fan");
    return badges;
  });
</script>

<svelte:head><title>{profile ? profile.player.displayName + " · FanZone" : "Player profile · FanZone"}</title><meta name="description" content="FanZone player stats, quiz performance and challenge history." /></svelte:head>
<div class="shell">
  <header><a class="brand" href="/">FAN<span>ZONE</span><small> FOOTBALL CHALLENGE</small></a><nav><a href="/leaderboard">Leaderboard</a><a href="/competitions">Competitions</a></nav><a class="account" href="/account">Account</a></header>
  {#if loading}<main><p class="muted">Loading player profile…</p></main>
  {:else if error}<main><section class="panel"><h1>Profile unavailable</h1><p class="muted">{error}</p><a class="primary" href="/leaderboard">Back to leaderboard</a></section></main>
  {:else if profile}
    <main>
      <div class="player-head"><div class="avatar">{profile.player.displayName.slice(0, 1).toUpperCase()}</div><div><div class="eyebrow">FANZONE PLAYER</div><h1>{profile.player.displayName}</h1><p class="muted">Playing since {date(profile.player.createdAt)}</p></div></div>
      <section class="stats">
        <div><strong>{profile.stats.quizzes}</strong><span>Quizzes</span></div>
        <div><strong>{profile.stats.points}</strong><span>Points scored</span></div>
        <div><strong>{profile.stats.bestScore}/10</strong><span>Best score</span></div>
        <div><strong>{profile.stats.questions ? Math.round((profile.stats.points / profile.stats.questions) * 100) : 0}%</strong><span>Accuracy</span></div>
      </section>
      <section class="panel"><div class="section-title"><div><div class="eyebrow">MILESTONES</div><h2>Achievements</h2></div></div>
        {#if achievements.length}<div class="badges">{#each achievements as badge}<span class="badge">🏆 {badge}</span>{/each}</div>{:else}<p class="muted">Complete a quiz to earn your first milestone.</p>{/if}
      </section>
      <section class="panel"><div class="section-title"><div><div class="eyebrow">PERFORMANCE</div><h2>Recent quizzes</h2></div></div>
        {#if profile.attempts.length}<div class="list">{#each profile.attempts as attempt}<div class="row"><span class="mode">{attempt.mode.replaceAll("_", " ")}</span><span class="muted">{date(attempt.submittedAt)}</span><strong>{attempt.score}/{attempt.totalQuestions}</strong></div>{/each}</div>
        {:else}<p class="muted">No completed quizzes yet.</p>{/if}
      </section>
      <section class="panel"><div class="section-title"><div><div class="eyebrow">HEAD-TO-HEAD</div><h2>Challenge history</h2></div></div>
        {#if profile.challenges.length}<div class="list">{#each profile.challenges as challenge}<div class="row challenge"><div><strong>{challenge.title}</strong><small>{challenge.creatorName ?? "Fan"} vs {challenge.opponentName ?? "Waiting for player"} · {date(challenge.createdAt)}</small></div><span class:won={result(challenge) === "Won"} class:lost={result(challenge) === "Lost"}>{result(challenge)}</span><strong>{challenge.score ?? "—"}{#if challenge.opponentScore !== null} : {challenge.opponentScore}{/if}</strong></div>{/each}</div>
        {:else}<p class="muted">No head-to-head challenges yet.</p>{/if}
      </section>
    </main>
  {/if}
  <footer>FANZONE · Built for fans who know the game.</footer>
</div>

<style>
  :global(body){margin:0;background:#101512;color:#f5f7f3;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.shell{min-height:100vh;background:radial-gradient(ellipse at 50% 0,#203628 0,transparent 55%),#101512}
  header{height:76px;border-bottom:1px solid #29342b;display:flex;align-items:center;padding:0 max(calc((100vw - 1120px)/2),24px);gap:36px}.brand{color:#f5f7f3;text-decoration:none;font-size:19px;font-weight:900;letter-spacing:.1em}.brand span{color:#c8f169}.brand small{font-size:9px;color:#93a093;letter-spacing:.14em}nav{display:flex;gap:20px;margin-left:auto}nav a{color:#b4beb4;text-decoration:none;font-size:13px}.account{color:#101512;background:#c8f169;padding:10px 14px;border-radius:7px;text-decoration:none;font-weight:800;font-size:12px}
  main{width:min(860px,calc(100% - 40px));margin:56px auto 90px}.player-head{display:flex;align-items:center;gap:20px}.avatar{width:68px;height:68px;border-radius:50%;background:#293a2d;color:#c8f169;display:grid;place-items:center;font-size:26px;font-weight:900}.eyebrow{color:#c8f169;font-size:10px;letter-spacing:.16em;font-weight:800}h1{font-size:clamp(34px,6vw,52px);margin:8px 0}.muted{color:#99a59a;line-height:1.6;font-size:13px}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:28px 0}.stats div{background:#171f19;border:1px solid #303c32;border-radius:12px;padding:18px}.stats strong,.stats span{display:block}.stats strong{font-size:24px;color:#c8f169}.stats span{font-size:11px;color:#99a59a;margin-top:5px}
  .panel{background:#171f19;border:1px solid #303c32;border-radius:14px;padding:22px;margin-top:16px}.section-title{display:flex;justify-content:space-between;align-items:center}h2{margin:5px 0 16px;font-size:21px}.badges{display:flex;flex-wrap:wrap;gap:9px}.badge{border:1px solid #526442;color:#d5f99b;background:#223121;border-radius:999px;padding:9px 12px;font-size:12px;font-weight:700}.list{display:grid}.row{display:flex;align-items:center;gap:16px;padding:14px 0;border-top:1px solid #29342b}.row:first-child{border:0}.row strong:last-child{margin-left:auto;color:#c8f169}.mode{min-width:100px;text-transform:capitalize;color:#d9e2d9;font-size:13px}.row .muted{margin-left:auto;font-size:12px}.challenge>div{flex:1}.challenge small{display:block;margin-top:4px;color:#8f9c92;font-size:11px}.won{color:#c8f169}.lost{color:#ff9898}footer{max-width:1120px;margin:0 auto;padding:24px;color:#748076;border-top:1px solid #29342b;font-size:11px}.primary{display:inline-block;background:#c8f169;color:#101512;padding:12px 16px;border-radius:7px;text-decoration:none;font-weight:800}
  @media(max-width:650px){header{gap:12px;padding:0 16px}.brand small{display:none}nav{gap:11px}nav a{font-size:11px}.stats{grid-template-columns:repeat(2,1fr)}main{margin-top:36px}.row{gap:8px}.mode{min-width:74px}.challenge{flex-wrap:wrap}.challenge>div{flex-basis:100%}}
</style>
