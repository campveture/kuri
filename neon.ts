import { defineConfig } from "@neon/config/v1";

/**
 * Neon infrastructure-as-code — which Neon services each branch of this project
 * should have. `neon deploy` provisions them; `neon env pull` writes their env vars.
 *
 * Kuri's Neon services:
 *  - Lakebase Postgres — the database. Every project has this implicitly, so it
 *    needs no declaration here; `DATABASE_URL` / `DATABASE_URL_UNPOOLED` are pulled
 *    for every branch.
 *
 * Not on Neon (yet):
 *  - Object storage for admin image uploads. Neon Object Storage is a public-beta
 *    feature limited to us-east-2; this project is in ap-southeast-1 (better for a
 *    Bangladesh audience), so uploads use Vercel Blob — see
 *    app/api/admin/upload/route.ts. When Object Storage reaches this region, add:
 *      preview: { buckets: { uploads: { access: "public_read" } } }
 *    then `neon deploy` and switch the upload route's primary backend.
 */
export default defineConfig({});
