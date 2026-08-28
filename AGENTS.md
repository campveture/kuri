<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Deployment Instructions

## Live Site
- **URL**: https://campveture.github.io/kuri/
- **GitHub repo**: https://github.com/campveture/kuri
- **GitHub Pages source**: GitHub Actions (NOT deploy from branch)

## How to Deploy

When the user asks to deploy or push changes, follow these exact steps:

### Step 1: Build with GitHub Pages base path
```powershell
$env:GITHUB_PAGES="true"; npm run build
```

### Step 2: Stage, commit, and push
```powershell
git add -A
git commit -m "YOUR COMMIT MESSAGE HERE"
git push origin main
```

**IMPORTANT**: Git uses Windows Credential Manager for auth. `gh` CLI is NOT authenticated. Do NOT use `gh` commands for pushing. Just use `git push origin main`.

### Step 3: Wait for GitHub Actions
The push triggers `.github/workflows/deploy.yml` automatically. The workflow:
1. Checks out code
2. Installs Node 20 + dependencies
3. Runs `npm run build` with `GITHUB_PAGES=true` env var
4. Uploads `out/` directory to GitHub Pages

Deployment takes ~2-3 minutes. Check status at: https://github.com/campveture/kuri/actions

## Critical Rules for GitHub Pages

### Image Paths
- CSS `url()` paths do NOT get the `/kuri/` prefix automatically
- Background images MUST use inline styles with `process.env.NEXT_PUBLIC_BASE_PATH`:
  ```tsx
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  // ...
  <div style={{ backgroundImage: `url("${basePath}/images/photo.jpg")` }} />
  ```
- `next/image` component works correctly (uses custom loader in `lib/imageLoader.ts`)

### Config
- `next.config.ts`: `basePath` is `/kuri` when `GITHUB_PAGES=true`, empty string otherwise
- `NEXT_PUBLIC_BASE_PATH` env var is set to match `basePath` for client-side code
- `output: "export"` — static export only, no server-side features
- `trailingSlash: true` — required for GitHub Pages

### Files
- `public/.nojekyll` — MUST exist so GitHub Pages doesn't ignore `_next/` folder
- `.github/workflows/deploy.yml` — GitHub Actions workflow for deployment

## Local Development
```powershell
npm run dev
# Site runs at http://localhost:3000
# Admin panel at http://localhost:3000/admin
# Login: admin / KuriAdmin@2024
```
No `GITHUB_PAGES` env var needed for local dev — base path is empty string.
