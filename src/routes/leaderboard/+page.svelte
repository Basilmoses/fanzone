<script lang="ts">
  import { onMount } from "svelte";

  type Entry = { id: string; displayName: string; score: number; totalQuestions?: number; attempts?: number; durationMs?: number | null };
  let scope = $state<"daily" | "all-time">("daily");
  let entries = $state<Entry[]>([]);
  let loading = $state(true);
  let error = $state("");

  onMount(() => loadBoard());
  async function loadBoard() {
    loading = true;
    error = "";
    try {
      const response = await fetch("/api/leaderboard?scope=" + scope);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not load the leaderboard.");
      entries = data.entries ?? [];
    } catch (cause) {
      error = cause instanceof Error ? cause.message : "Could not load the leaderboard.";
    } finally {
      loading = false;
    }
  }

  function changeScope(value: "daily" | "all-time") {
    scope = value;
    loadBoard();
  }
</script>

<svelte:head><title>FanZone Leaderboard</title><meta name="description" content="Live FanZone football quiz standings and player profiles." /></svelte:head>
<div class="shell">
  <header><a class="brand" href="/">FAN<span>ZONE</span><small> FOOTBALL CHALLENGE</small></a><nav><a href="/">Home</a><a href="/competitions">Competitions</a></nav><a class="account" href="/account">Account</a></header>
  <main>
    <div class="eyebrow">LIVE STANDINGS</div><h1>Leaderboard</h1>
    <p class="muted">Scores come from completed quizzes and competitions. Open a player to see their record.</p>
    <div class="tabs"><button class:active={scope === "daily"} onclick={() => changeScope("daily")}>Today's tournament</button><button class:active={scope === "all-time"} onclick={() => changeScope("all-time")}>All time</button></div>
    {#if error}<p class="error" role="alert">{error}</p>{:else if loading}<p class="muted">Loading standings…</p>{:else if entries.length === 0}<section class="panel"><p>No completed entries yet. Be the first fan on the board.</p><a class="primary" href="/competitions">Enter a competition</a></section>{:else}
      <section class="panel board">
        {#each entries as entry, i}
          <a class="row" href={"/players/" + encodeURIComponent(entry.id)}>
            <span class="rank">{String(i + 1).padStart(2, "0")}</span><span class="avatar">{entry.displayName.slice(0, 1).toUpperCase()}</span><span class="name">{entry.displayName}<small>{entry.attempts ? entry.attempts + " completed quizzes" : "Player profile"}</small></span><strong>{entry.score}{#if entry.totalQuestions}<small> / {entry.totalQuestions}</small>{/if}</strong>
          </a>
        {/each}
      </section>
    {/if}
  </main>
  <footer>FANZONE · Built for fans who know the game.</footer>
</div>

<style>
  :global(body){margin:0;background:#101512;color:#f5f7f3;font-family:Inter,ui-sans-serif,system-ui,sans-serif}
  .shell{min-height:100vh;background:radial-gradient(ellipse at 50% 0,#203628 0,transparent 55%),#101512}
  header{height:76px;border-bottom:1px solid #29342b;display:flex;align-items:center;padding:0 max(calc((100vw - 1120px)/2),24px);gap:36px}
  .brand{color:#f5f7f3;text-decoration:none;font-size:19px;font-weight:900;letter-spacing:.1em}.brand span{color:#c8f169}.brand small{font-size:9px;color:#93a093;letter-spacing:.14em}
  nav{display:flex;gap:20px;margin-left:auto}nav a{color:#b4beb4;text-decoration:none;font-size:13px}.account{color:#101512;background:#c8f169;padding:10px 14px;border-radius:7px;text-decoration:none;font-weight:800;font-size:12px}
  main{width:min(760px,calc(100% - 40px));margin:66px auto 90px}.eyebrow{color:#c8f169;font-size:11px;letter-spacing:.16em;font-weight:800}h1{font-size:clamp(38px,7vw,58px);margin:12px 0}.muted{color:#99a59a;line-height:1.6;font-size:14px}
  .tabs{display:flex;gap:8px;margin:28px 0 16px}.tabs button{background:#171f19;border:1px solid #344136;border-radius:8px;color:#a8b3a8;padding:12px 16px;font-weight:700;cursor:pointer}.tabs button.active{background:#c8f169;color:#11170f;border-color:#c8f169}
  .panel{background:#171f19;border:1px solid #303c32;border-radius:14px;padding:20px}.board{padding:0;overflow:hidden}.row{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid #29342b;color:#f3f6f1;text-decoration:none}.row:last-child{border:0}.row:hover{background:#202b22}
  .rank{width:26px;color:#94a094;font-variant-numeric:tabular-nums}.avatar{width:38px;height:38px;border-radius:50%;background:#293a2d;color:#c8f169;display:grid;place-items:center;font-weight:800}.name{flex:1;font-weight:750}.name small,.row strong small{display:block;color:#8f9c92;font-size:11px;font-weight:500;margin-top:4px}.row strong{text-align:right;color:#c8f169}.primary{display:inline-block;background:#c8f169;color:#101512;padding:12px 16px;border-radius:7px;text-decoration:none;font-weight:800}.error{color:#ff9898}footer{max-width:1120px;margin:0 auto;padding:24px;color:#748076;border-top:1px solid #29342b;font-size:11px}
  @media(max-width:600px){header{gap:12px;padding:0 16px}.brand small{display:none}nav{gap:11px}nav a{font-size:11px}main{margin-top:40px}}
</style>
