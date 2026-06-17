# CLAUDE.md — Portfolio Hub (Compound Interests)

## What this is
The hub site for my AI-systems portfolio: a hub-and-spoke catalogue that
runs live demos of every system I build. Brand: **Compound Interests**
(tagline: "Systems that compound"). Domain: chrisliquin.com.

## Read first
- **Read `docs/BUILD_BRIEF.md` before any structural change.** It is the
  founding document. Honor its decisions (D1–D6), the 3-artifact contract
  (§3.2), the manifest schema v1 (§3.3), and the repo topology (§6.1).

## Stack (do not relitigate — see §7.2)
- Astro 6 + Tailwind + MDX
- Node 22 LTS, pnpm
- GitHub → Vercel (Hobby) auto-deploy
- Supabase (free) for heartbeats/status — Phase 2

## Repo topology (§6.1)
- `src/`                     Astro app (pages, components, layouts)
- `projects/<slug>/`         manifest.json + case-study MDX + diagram source
- `schema/manifest.schema.json`  the manifest JSON Schema (validate in CI)
- `docs/BUILD_BRIEF.md`      founding document
- `CLAUDE.md`                this file

## Conventions
- Validate manifests against schema/manifest.schema.json before commit;
  a typo'd manifest must fail the build, not render a broken tile.
- Secrets: `.env` locally, Vercel env vars in prod, service keys only in
  project runtimes, anon read-only key in the client. Never commit secrets.
- Work in small, reviewed commits. Keep this file current — it is my
  persistent memory across sessions.
- Voice for copy: direct, engineering-forward, quantified, no hype.

## Phase order (§8) — do not skip ahead
P0 rails (this) → P1 hub MVP → P2 live layer → P3 automation → P4 polish.
Ship P1 before touching P2.
