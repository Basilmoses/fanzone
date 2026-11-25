<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  let signedIn = $state(false);
  onMount(async () => {
    try { signedIn = Boolean((await (await fetch("/api/auth/me")).json()).user); } catch { signedIn = false; }
  });
</script>

<svelte:head><title>FanZone Wallet · Coming soon</title><meta name="description" content="FanZone wallet features are coming soon." /></svelte:head>
<div class="shell">
  <header><a class="brand" href="/">FAN<span>ZONE</span><small> FOOTBALL CHALLENGE</small></a><nav><a href="/">Home</a><a href="/competitions">Competitions</a><a href="/leaderboard">Leaderboard</a></nav>{#if signedIn}<button class="account" onclick={() => goto("/")}>Profile</button>{:else}<button class="account" onclick={() => goto("/account")}>Sign in</button>{/if}</header>
  <main>
    <div class="eyebrow">FANZONE WALLET</div>
    <div class="icon">◌</div>
    <h1>Coming soon</h1>
    <p>Wallet features are still in development. FanZone does not accept deposits, store money, or make payouts yet.</p>
    <div class="actions"><a class="primary" href="/competitions">Explore competitions</a><a class="secondary" href="/leaderboard">View leaderboard</a></div>
  </main>
  <footer>FANZONE · Wallet transactions are not available yet.</footer>
</div>

<style>
  :global(body){margin:0;background:#101512;color:#f5f7f3;font-family:Inter,ui-sans-serif,system-ui,sans-serif}.shell{min-height:100vh;background:radial-gradient(ellipse at 50% 0,#203628 0,transparent 55%),#101512;display:flex;flex-direction:column}
  header{height:76px;border-bottom:1px solid #29342b;display:flex;align-items:center;padding:0 max(calc((100vw - 1120px)/2),24px);gap:36px}.brand{color:#f5f7f3;text-decoration:none;font-size:19px;font-weight:900;letter-spacing:.1em}.brand span{color:#c8f169}.brand small{font-size:9px;color:#93a093;letter-spacing:.14em}nav{display:flex;gap:20px;margin-left:auto}nav a{color:#b4beb4;text-decoration:none;font-size:13px}.account{color:#101512;background:#c8f169;padding:10px 14px;border:0;border-radius:7px;text-decoration:none;font-weight:800;font-size:12px;cursor:pointer}
  main{width:min(580px,calc(100% - 40px));margin:100px auto;text-align:center;flex:1}.eyebrow{color:#c8f169;font-size:11px;letter-spacing:.16em;font-weight:800}.icon{margin:36px auto 16px;width:70px;height:70px;border:1px solid #45523f;border-radius:50%;display:grid;place-items:center;color:#c8f169;font-size:42px}h1{font-size:clamp(42px,8vw,64px);margin:0 0 16px}p{color:#a4afa4;line-height:1.7;font-size:15px}.actions{display:flex;justify-content:center;gap:10px;margin-top:30px}.primary,.secondary{display:inline-block;padding:12px 16px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:800}.primary{background:#c8f169;color:#101512}.secondary{border:1px solid #45523f;color:#e3e9e2}
  footer{max-width:1120px;width:calc(100% - 48px);margin:0 auto;padding:24px 0;color:#748076;border-top:1px solid #29342b;font-size:11px}@media(max-width:600px){header{gap:12px;padding:0 16px}.brand small{display:none}nav{gap:11px}nav a{font-size:11px}.actions{flex-direction:column}}
</style>
