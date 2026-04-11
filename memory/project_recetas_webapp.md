---
name: Recetas Web App — Project State
description: Full-stack recipe app built with Next.js 14, Drizzle ORM, Claude API. Mobile-first PWA.
type: project
---

This is a complete Spanish-language recipe web app bootstrapped from scratch.

**Why:** User wanted a recipe CRUD app with AI-powered voice-to-recipe feature, mobile-first / PWA.

**How to apply:** Future work should treat this as a fully built app needing DB credentials to run.

## Stack
- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Vercel Postgres (Neon) + Drizzle ORM v0.45
- Claude API (`claude-haiku-4-5-20251001`) via `@anthropic-ai/sdk`
- `next-pwa` for PWA/service worker
- Zustand for global client state

## Key files
- `src/db/schema.ts` — Drizzle schema (categories, recipes tables)
- `src/db/seed.ts` — seeds 7 predefined categories; run with `npm run db:seed`
- `src/lib/claude.ts` — Anthropic SDK wrapper for structuring transcribed text
- `src/lib/rate-limit.ts` — in-memory 10 req/min/IP limiter for `/api/estructurar-receta`
- `src/components/AudioRecorder.tsx` — Web Speech API + iOS/Safari textarea fallback
- `src/components/RecipeForm.tsx` — unified create/edit form with audio pre-fill support
- `public/manifest.json` — PWA manifest (amber theme, portrait)

## To run
Requires `.env.local` with `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, `ANTHROPIC_API_KEY`. Run `npm run db:push` then `npm run db:seed` before first use. Dev: `npm run dev`.

## Known notes
- All DB pages use `export const dynamic = "force-dynamic"` (no POSTGRES_URL at build time)
- `node_modules/.bin/next` must be a symlink (not a copy) — fixed during initial setup
- Model in CLAUDE.md says `claude-haiku-3` but actual code uses `claude-haiku-4-5-20251001`
