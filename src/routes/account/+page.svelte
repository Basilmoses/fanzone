<script lang="ts">
  import { onMount } from "svelte";

  type PublicUser = { id: string; displayName: string; email: string };
  let mode = $state<"register" | "login">("register");
  let user = $state<PublicUser | null>(null);
  let displayName = $state("");
  let email = $state("");
  let password = $state("");
  let error = $state("");
  let busy = $state(false);

  onMount(async () => {
    const response = await fetch("/api/auth/me");
    const data = await response.json();
    user = data.user;
  });

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    error = "";
    busy = true;
    try {
      const response = await fetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        error = data.error ?? "We couldn't complete that request.";
      } else {
        user = data.user;
        password = "";
      }
    } catch {
      error = "Connection failed. Please try again.";
    } finally {
      busy = false;
    }
  }

  async function signOut() {
    error = "";
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (response.ok) user = null;
    else error = "We couldn't sign you out. Try again.";
  }
</script>

<svelte:head>
  <title>FanZone account</title>
  <meta name="description" content="Create a FanZone account or sign in to keep your football competition scores." />
</svelte:head>

<div class="shell">
  <header>
    <a class="brand" href="/">FAN<span>ZONE</span><small> FOOTBALL CHALLENGE</small></a>
    <nav><a href="/">Home</a></nav>
  </header>
  <main>
    <div class="eyebrow">PLAYER ACCOUNT</div>
    {#if user}
      <h1>Welcome, <em>{user.displayName}</em></h1>
      <div class="panel">
        <p>Your FanZone account is active.</p>
        <p class="muted">{user.email}</p>
        <button class="primary" onclick={signOut}>Sign out</button>
      </div>
    {:else}
      <h1>{mode === "register" ? "Join the fans." : "Welcome back."}</h1>
      <p class="muted">Your display name appears in public competition rankings. Your email is not shown there.</p>
      <div class="panel">
        <div class="tabs">
          <button class:active={mode === "register"} onclick={() => { mode = "register"; error = ""; }}>Create account</button>
          <button class:active={mode === "login"} onclick={() => { mode = "login"; error = ""; }}>Sign in</button>
        </div>
        <form onsubmit={submit}>
          {#if mode === "register"}
            <label>Display name<input bind:value={displayName} autocomplete="name" minlength="2" maxlength="40" required /></label>
          {/if}
          <label>Email<input type="email" bind:value={email} autocomplete="email" maxlength="254" required /></label>
          <label>Password<input type="password" bind:value={password} autocomplete={mode === "register" ? "new-password" : "current-password"} minlength={mode === "register" ? 12 : 1} maxlength="128" required /></label>
          {#if mode === "register"}<small class="hint">Use at least 12 characters.</small>{/if}
          {#if error}<p class="error" role="alert">{error}</p>{/if}
          <button class="primary" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}</button>
        </form>
      </div>
    {/if}
    <p class="back"><a href="/">← Back to FanZone</a></p>
  </main>
  <footer>FANZONE <span>·</span> Built for fans who know the game.</footer>
</div>

<style>
  nav a,.back a{color:#c8f169;text-decoration:none;font-size:13px}
  main{max-width:560px;margin:0 auto;min-height:70vh;padding:55px 0}
  main h1{font:900 clamp(44px,8vw,70px)/.98 "Barlow Condensed";margin:18px 0}
  .panel{margin-top:25px}
  .tabs{display:flex;gap:10px;margin-bottom:22px;border-bottom:1px solid #ffffff18}
  .tabs button{border:0;background:transparent;color:#aab4ad;padding:10px 13px}
  .tabs button.active{color:#c8f169;border-bottom:2px solid #c8f169}
  form{display:grid;gap:14px}
  label{display:grid;gap:7px;color:#dce4dc;font-size:13px}
  input{background:#080d0a;border:1px solid #ffffff28;border-radius:7px;padding:13px;color:#fff;font:inherit}
  input:focus{outline:2px solid #c8f16977;border-color:#c8f169}
  .hint,.muted{color:#8f9c92;font-size:12px}
  .error{color:#ff9898;font-size:13px}
  .primary:disabled{opacity:.65;cursor:wait}
  .back{margin-top:20px}
  @media(max-width:600px){main{padding:40px 0}.panel{padding:18px}}
</style>
