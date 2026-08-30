# Kuri

Full-stack storefront and operations back-office for **Kuri Valley Estate**, a
single-origin tea brand in Sreemangal, Bangladesh.

- **Live:** https://kurivalley.vercel.app
- **Admin:** https://kurivalley.vercel.app/admin
- Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · Prisma 6.5 ·
  PostgreSQL (Neon) · hand-rolled `jose` + `bcryptjs` auth · deployed on Vercel.

## Run locally

```bash
npm install
cp .env.example .env          # then fill in the values (see below)
npm run db:migrate            # apply migrations to your dev database
npm run db:seed               # seed catalog + admin user
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admin panel at `/admin`.

The dev database is a Neon branch (`dev`). `.neon` links it; connection strings
live in `.env` (`DATABASE_URL` pooled, `DATABASE_URL_UNPOOLED` direct).

### Environment variables

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Pooled Postgres connection (Neon) |
| `DATABASE_URL_UNPOOLED` | Direct connection — used by Prisma migrations (`directUrl`) |
| `AUTH_SECRET` | HS256 signing key for the `kuri_session` JWT. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob store `kuri-uploads` — admin image uploads |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed-time admin credentials (optional; defaults in `prisma/seed.ts`) |
| `SEED_SAMPLE_DATA` | `true` seeds demo orders/discount/collection; `false` (prod) seeds catalog + admin only |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata / absolute links |

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | `prisma generate && next build` |
| `npm run vercel-build` | `prisma generate && prisma migrate deploy && next build` — Vercel's build command |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | `prisma migrate dev` (create + apply a migration) |
| `npm run db:deploy` | `prisma migrate deploy` (apply pending migrations, no prompts) |
| `npm run db:reset` | Drop + recreate + reseed the dev DB |
| `npm run db:seed` | Run `prisma/seed.ts` |
| `npm run db:studio` | Prisma Studio |

## Deploy

Hosted on **Vercel** (project `kuri`, team `campveture-7651`), region `sin1`.
The `campveture/kuri` GitHub repo is connected — **every push to `main`
auto-deploys**. Vercel runs `npm run vercel-build`, which applies any pending
Prisma migrations to the production Neon branch before building.

To ship: merge to `main` and push. Check the deployment in the Vercel dashboard.
There is no manual deploy step.

Production env vars (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `AUTH_SECRET`,
`BLOB_READ_WRITE_TOKEN`) are set in the Vercel project settings and point at the
Neon `production` branch.

## Project structure

- `app/(site)/` — storefront (home, shop, product, cart/checkout, journal, the
  bespoke marketing pages, account, order tracking).
- `app/(auth)/` — login / register.
- `app/admin/` — the back-office: catalog, collections, discounts, orders &
  fulfilment, subscriptions, customers, journal, page builder, per-page content
  editor, physical-store ERP (locations, stock, POS, expenses, P&L), settings,
  messages (newsletter subscribers + contact form submissions).
- `app/api/` — `/api/products` (search), `/api/admin/upload` (image upload).
- `components/` — storefront UI, `components/admin/**`, `components/blocks/**`
  (page-builder block renderer), `components/account/**`.
- `lib/` — `prisma`, `session`, `auth`, `queries`, `orders`, `discounts`,
  `analytics`, `erp`, `settings`, `validators` (Zod), `blocks`, `content`,
  `page-templates`, `utils`, `site`.
- `prisma/` — `schema.prisma`, migrations, `seed.ts`.

## Customising site content

Two editing surfaces, both in the admin:

1. **Page builder** (`/admin/pages`) — block-based landing pages at `/<slug>`,
   and the homepage when a page is marked as home.
2. **Per-page content** (`/admin/content`) — the hand-designed marketing pages
   (Our Origin, Our Story, Subscriptions, Contact) keep their layouts; every
   headline, paragraph and image on them is an editable field. Hardcoded copy is
   the fallback when a field is blank.

Shop / product / cart / checkout / account / order / track are system pages
driven by catalog data, not editable as content.

## Notes on rendering

Hero sections use a lightweight Three.js particle effect
(`components/HeroParticles.tsx`) over full-bleed photos, and respect
`prefers-reduced-motion`. Overlay/gradient colours use explicit `rgba(...)`
values rather than Tailwind's `bg-black/50` shorthand — that shorthand compiles
to an oklab `color-mix()` that rendered opaque in a tested environment. Keep
using `rgba()` for new translucent overlays.

## Photography

Photos are freely-licensed (CC BY / CC BY-SA) images of Sreemangal's tea gardens
from Wikimedia Commons, credited on `/photo-credits` — not the actual estate.
Replace with real photography when available; upload via the admin and set image
fields per page/product.
