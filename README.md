# FanZone

FanZone is a football knowledge competition app: quick quizzes, head-to-head challenges, daily tournaments, leaderboards and player wallets. This repository is the SvelteKit + Cloudflare Workers implementation.

## Stack
- Svelte 5 + SvelteKit
- TypeScript + Vite
- Cloudflare Workers via `@sveltejs/adapter-cloudflare` and Wrangler

## Local development
```bash
npm install
npm run dev
```

## Build and deploy
```bash
npm run check
npm run build
npx wrangler deploy
```

Set up the Cloudflare account authentication with `npx wrangler login` before deploying. The current UI uses demo quiz questions and a demo wallet; no real payments, user authentication, or persistent backend are enabled yet.

## Original project source

The original Lovable source is archived under [`legacy-lovable/`](legacy-lovable/). It is kept separate because that project uses React while the active application here uses SvelteKit. See [`legacy-lovable/ARCHIVE-NOTES.md`](legacy-lovable/ARCHIVE-NOTES.md) for archive details.
