<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Kuri — agent runbook

Full-stack storefront + admin for Kuri Valley Estate (tea, Sreemangal, Bangladesh).
Next.js 16 / React 19 / Tailwind 4 / Prisma 6.5 / PostgreSQL on Neon / Vercel.

> **History:** kuri was a static GitHub-Pages marketing site until Aug 2026, when it
> was migrated to the SlayVault full-stack stack (Vercel + Neon) with a complete
> `/admin` back-office. GitHub Pages is **retired**. Any doc mentioning
> `output: "export"`, `basePath: "/kuri"`, `GITHUB_PAGES`, `.nojekyll`,
> `lib/imageLoader.ts`, or `.github/workflows/deploy.yml` is stale — none exist.

## Live

- Storefront: https://kurivalley.vercel.app
- Admin: https://kurivalley.vercel.app/admin
- GitHub: https://github.com/campveture/kuri
- Vercel project `kuri` (team `campveture-7651`, region `sin1`)
- Neon project `kuri` = `billowing-cherry-93796853` (Campveture org), branches
  `production` + `dev`. Local `.neon` links `dev`.

## Deploy

**Pushing to `main` auto-deploys.** The GitHub repo is connected to Vercel;
every push to `main` triggers a production deployment that runs
`npm run vercel-build` (`prisma generate && prisma migrate deploy && next build`),
so pending migrations apply to the `production` Neon branch automatically.

```bash
git add -A
git commit -m "…"
git push origin main        # → live in ~2 min; watch the Vercel dashboard
```

There is **no manual deploy step and no build-time env flag**. Git auth is via
Windows Credential Manager; `gh` CLI is not authenticated for push — use
`git push origin main`.

Because a push is a production deploy of a live storefront, **only push when the
user has asked for it**, and prefer letting them test locally first.

## Local development

```bash
npm install
npm run db:migrate      # apply migrations to the dev Neon branch
npm run db:seed         # catalog + admin user (+ demo data if SEED_SAMPLE_DATA=true)
npm run dev             # http://localhost:3000  ·  admin at /admin
```

`.env` (untracked) holds the dev Neon URLs, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`.
See `.env.example` for the full list.

**Admin login** (seeded): `admin@kuri.com.bd` / password from `ADMIN_PASSWORD`
env or the `prisma/seed.ts` default. The production admin password was set at
seed time and should be rotated in `/admin/settings`.

## Migrations

- Dev: `npm run db:migrate -- --name <slug>` creates + applies against `dev`.
- Prod: **do not run `prisma migrate deploy` against production by hand** — it
  runs automatically inside `vercel-build` on the next push to `main`. Commit the
  migration files; the deploy applies them.

## Stack notes / Next 16 gotchas

- `cookies()` / `headers()` are async — `await` them everywhere.
- `params` / `searchParams` are Promises in pages — `await` them.
- Middleware file is `proxy.ts` with `export function proxy(...)` (guards
  `/admin` and `/account`). The JWT (`kuri_session` cookie, HS256, 30-day) can be
  stale, so every `app/admin/**/page.tsx` also calls `await requireAdmin()`.
- `useFormState` → `useActionState` (from `"react"`); `useFormStatus` from
  `"react-dom"` unchanged.
- `next.config.ts` has no `eslint` key in Next 16. `LayoutProps<>` / `PageProps<>`
  are generated globals — gate CI on `next build`, not bare `tsc`.
- Tailwind config is the CSS `@theme` block in `app/globals.css`, not a JS file.
  Kuri class idioms: `.btn .btn-primary` / `.btn-outline`, `.card`, `.input`,
  `.label`, `.textarea`, `.badge`, `.h-display`, `.text-muted-2`, `.text-negative`.
  Do **not** reintroduce SlayVault classes (`btn-gold`, `card-slay`, `input-slay`,
  `heading-display`).
- Single light theme — no dark mode, no theme toggle, no font switcher.

## Correctness patterns (keep these)

- **Stock / money races:** conditional `updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } })` inside `$transaction`; `count === 0` means sold out. P2002 retry loop for order (`KV-<yy>-<8>`) and sale (`POS-<yy>-<8>`) numbers.
- **Discount `maxUses`:** atomic `updateMany` guarded on `usedCount < maxUses`; decremented on order cancel, re-incremented on reopen.
- **Checkout price integrity:** client sends `expectedTotal`; server recomputes and returns a `priceChanged` state on mismatch instead of charging the wrong amount.
- Money is integer taka everywhere; format with `formatBDT()`.

## Data model highlights

18 SlayVault-derived models + kuri additions: `Post` (journal), `Subscription`
(manual-fulfilment tea subscriptions), `PageContent` (per-page editable content),
`Subscriber` (newsletter), `ContactMessage` (contact form). `Product` carries tea
fields (`tastingNotes`, `origin`, `altitude`, brew specs, `accent`/`accentDark`
pouch colours, `subscribePrice`). Variants are weights: 50g / 100g / 250g.

## Content editing

- `/admin/pages` — block-based landing pages (`/<slug>`) + homepage via `isHome`.
- `/admin/content` — field editor for the hand-designed marketing pages (Our
  Origin, Our Story, Subscriptions, Contact); hardcoded copy is the fallback.
- Shop / product / cart / checkout / account / order / track are system pages.
