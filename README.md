# Kuri

Single-origin tea e-commerce site for Kuri Valley Estate, Sreemangal, Bangladesh. Built with Next.js 16 (App Router, Turbopack) and Tailwind CSS v4.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm run start   # serve the production build locally
```

## Deploy

This is a standard Next.js app, so it deploys cleanly to any Node-capable host:

- **Vercel** (recommended, zero config): run `vercel deploy` from this directory, or connect the repo in the [Vercel dashboard](https://vercel.com/new) and it will detect Next.js automatically.
- **Netlify / any Node host**: `npm run build` then `npm run start`, or use the platform's Next.js adapter/build preset.

No environment variables are required to build or run the site as-is (see "Known gaps" below for what a real launch would need).

## Project structure

- `app/` — routes (App Router). Each page is mostly self-contained JSX + Tailwind classes.
- `components/` — shared UI (nav, footer, cart, product card, icons, illustrations).
- `lib/commerce.ts` — product catalog. Currently local mock data shaped like a simplified Storefront API response, not a real backend.
- `lib/journal.ts` — journal/blog post content.
- `lib/photoCredits.ts` — attribution data for `/photo-credits`.
- `public/images/` — photography (see licensing note below).

## Known gaps before this is a real store

- **No commerce backend.** `lib/commerce.ts` is mock data with sample BDT prices. There's no Shopify, Stripe, or any payment processor connected — the cart works client-side (localStorage) but Checkout is intentionally disabled with an explanatory note.
- **No real photography of Kuri Valley Estate yet.** Every photo currently on the site is a genuine, freely-licensed (CC BY / CC BY-SA) photo of Sreemangal's tea gardens generally, sourced from Wikimedia Commons and credited on `/photo-credits` — not photos of Kuri's actual estate, which doesn't have a photoshoot yet. Swap these out once real photography exists.
- **Bracketed placeholder facts throughout** — `[PRICE]`, `[FOUNDER NAME]`, `[YEAR]`, `[ALTITUDE]`, `[EMAIL]`, etc. These need real answers before launch. Search the codebase for `[` to find them all.
- **Account and Checkout are non-functional stubs** by design — both need real backends (auth, payments) that don't exist yet.
- **Footer's "Shipping & Returns" and "FAQ" links are unbuilt** — these are policy/legal content that shouldn't be drafted speculatively.
- **The Contact form** opens the visitor's email client with a pre-filled message (no backend) rather than actually submitting anywhere.

## Notes on rendering

Hero sections use a lightweight Three.js particle effect (`components/HeroParticles.tsx`) layered over full-bleed photos. Overlay/gradient colors use explicit `rgba(...)` values rather than Tailwind's `color/opacity` shorthand (e.g. `bg-black/50`) — that shorthand compiles to an oklab-based `color-mix()` that was found to render fully opaque in at least one tested environment; plain `rgba()` sidesteps it entirely. Keep using that pattern for any new translucent overlays.
