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
npm install
npm run dev
```

### Environment variables (`.env.local`)

```
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_JWT_ISSUER_DOMAIN=
CLERK_WEBHOOK_SIGNING_SECRET=
AI_GATEWAY_API_KEY=
AI_MODEL=openai/gpt-4o-mini
```

Set `CLERK_JWT_ISSUER_DOMAIN` on your Convex deployment as well.

### Clerk setup

1. Enable **Convex** integration in Clerk Dashboard
2. Enable **Billing** → create User Plans: `free_user`, `premium`
3. Attach feature slugs: `long_posts`, `verified_badge`, `edit_posts`, `ai_chat`, `ai_mentions`, `reply_priority`, `for_you_boost`
4. Register webhook → `https://your-domain/api/webhooks/clerk`

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
- [Architecture plan](./docs/ASOCIAL_ARCHITECTURE_PLAN.md)
