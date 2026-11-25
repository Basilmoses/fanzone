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

FanZone uses Cloudflare D1 for accounts, quiz attempts, daily tournament standings, and head-to-head challenges. Passwords are PBKDF2-hashed and sessions use secure, HTTP-only cookies. Email verification and password reset are not configured yet; wallet payments remain disabled.

Run `npx wrangler d1 migrations apply DB --local` before local development. The deployment workflow applies remote migrations before deploying. CI requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.

## Original project source

The original Lovable source is archived under [`legacy-lovable/`](legacy-lovable/). It is kept separate because that project uses React while the active application here uses SvelteKit. See [`legacy-lovable/ARCHIVE-NOTES.md`](legacy-lovable/ARCHIVE-NOTES.md) for archive details.
