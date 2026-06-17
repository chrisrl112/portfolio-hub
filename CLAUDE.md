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

## How the hub is wired (P1 scaffold)
- **Manifests load + validate at build time** via `src/lib/manifests.ts`
  (`getProjects()`, `getProject()`). It globs `projects/*/manifest.json`,
  validates each against `schema/manifest.schema.json` with ajv, and also
  checks slug↔directory and `links.page` agreement. A bad manifest throws and
  **fails the build** (verified). Don't render manifest data without going
  through this loader.
- **Adding a project** (the §9.2 runbook, in repo terms): create
  `projects/<slug>/` with `manifest.json`, `flowchart.mmd` (Mermaid source),
  and `case-study.mdx`. The slug must match the directory name and
  `links.page` must equal `/projects/<slug>`. Tile + page appear automatically.
- **Project page template:** `src/pages/projects/[slug].astro` owns section 01
  (Hero) + chrome from the manifest; `case-study.mdx` supplies the §4.3
  narrative (sections 02–09) using the shared components in
  `src/components/casestudy/` (`Section`, `Loops`, `Roles`, `Demo`,
  `MetricDefs`, `Mermaid`). Keep the section order and `n="0X"` numbering.
- **MDX gotcha:** no raw `<style>` blocks inside `.mdx` — MDX parses CSS `{` as
  a JS expression and the build fails. Put styles in `global.css`.
- **Metrics are placeholders until P2.** Values render as `—` with
  `data-metric-key` / `data-metric-source` hooks for heartbeat hydration. Never
  hand-key a fake number (§9.4 — no page silently lies).
- **Styling:** Tailwind v4 via `@tailwindcss/vite`; design tokens (dark
  industrial-luxe, status-light motif) live in `src/styles/global.css`. One
  accent per project, set from `manifest.accent_hex` onto `--accent`.
- **Diagrams:** Mermaid renders client-side (v1); React Flow is the v2 upgrade.

## Phase order (§8) — do not skip ahead
P0 rails (this) → P1 hub MVP → P2 live layer → P3 automation → P4 polish.
Ship P1 before touching P2.
