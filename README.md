# Asocial

Production-grade X-style social platform built with Next.js, Convex, Clerk, and shadcn/ui.

## Stack

- **Next.js 16** (App Router) — three-column feed shell
- **Convex** — real-time database, feeds, DMs, notifications
- **Clerk** — auth + Billing (Premium tiers)
- **shadcn/ui** — component layer
- **Vercel AI SDK + AI Gateway** — `/ai` chat and @AsocialAI mentions

## Get started

```bash
pnpm install
pnpm dev
```

Copy `.env.example` to `.env.local` and fill in Convex + Clerk values.

## Vercel deployment

The project is linked to Vercel as **`asocial`** under team **abed-al-rahmans-projects**.

```bash
vercel link
vercel env pull .env.local
pnpm run build
vercel --prod
```

### Required Vercel environment variables

Set these in [Project Settings → Environment Variables](https://vercel.com/abed-al-rahmans-projects/asocial/settings/environment-variables):

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Convex site URL |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `CLERK_JWT_ISSUER_DOMAIN` | e.g. `https://large-crow-40.clerk.accounts.dev` |
| `CLERK_WEBHOOK_SIGNING_SECRET` | For `/api/webhooks/clerk` |
| `AI_MODEL` | Optional, e.g. `openai/gpt-4o-mini` |

**AI Gateway:** On Vercel, OIDC auth is automatic — no `AI_GATEWAY_API_KEY` needed. Enable AI Gateway in project settings, then run `vercel env pull .env.local` to get `VERCEL_OIDC_TOKEN` for local use.

**Convex server-side AI** (mention replies, `/ai` via Convex actions) runs outside Vercel. Set on Convex:

```bash
npx convex env set AI_GATEWAY_API_KEY <your-vercel-ai-gateway-key>
npx convex env set AI_MODEL openai/gpt-4o-mini
```

### AI Gateway smoke test

```bash
# Pull OIDC token only (avoid overwriting Convex/Clerk keys in .env.local):
vercel env pull .env.development.local --yes
# Merge VERCEL_OIDC_TOKEN into .env.local, then:
pnpm run ai:smoke
# or: node --env-file=.env.local index.mjs
```

Use `AI_MODEL=openai/gpt-4o-mini` on the free AI Gateway tier. Models like `openai/gpt-5.5` require paid credits.

### GitHub CI/CD

1. Connect the repo in Vercel: **Project → Settings → Git** → link `abedalrahmantech/asocial` (requires GitHub access for the Vercel team).
2. Push to `main` triggers production deploys via Vercel Git integration.
3. Optional GitHub Actions workflow (`.github/workflows/ci.yml`) runs lint/build and can deploy with `VERCEL_TOKEN` secret.

## Routes

| Route | Description |
|-------|-------------|
| `/` | For You feed |
| `/home/following` | Following feed |
| `/explore` | Search & trends |
| `/messages` | DMs |
| `/notifications` | Activity |
| `/bookmarks` | Saved posts |
| `/pricing` | Clerk PricingTable |
| `/ai` | Premium AI chat |
| `/settings` | Account & billing |

## Learn more

- [Convex docs](https://docs.convex.dev/)
- [Clerk Billing B2C](https://clerk.com/docs/nextjs/guides/billing/for-b2c)
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
- [Architecture plan](./docs/ASOCIAL_ARCHITECTURE_PLAN.md)
