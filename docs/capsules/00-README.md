# Launch Capsules — Index

These are the four launch project capsules for the personal AI-systems portfolio hub.
The lab brand is **Compound Interests** — *Systems that compound.* (LOCKED — Chris decision,
review_decisions.jsonl 2026-06-13.) Each capsule is a self-contained case-study page draft,
written to the page template in **Build Brief v1 §4.3** and grounded in the per-project content
plans in **§5.1–5.4**.

> `[confirm: domain + handle availability]` — the "Compound Interests" name is locked, but
> domain and social-handle availability for it have **not** been verified yet. Don't assume the
> name is secured online until that check is done.

These are **drafts**. Nothing here has been published, posted, or committed.

---

## What these files are

| File | Project | Readiness | Status / Maturity | One-liner |
|---|---|---|---|---|
| `01-speakeasy-growroom.md` | Speakeasy Growroom | HIGH | live · 4/5 | A fully automated grow with an AI agronomist on staff 24/7. |
| `02-claude-investment.md` | Claude Investment Portfolio | MEDIUM | beta · 3/5 | A one-person fund run by a full AI investment committee. |
| `03-woodshed.md` | The Woodshed | MEDIUM | beta · 3/5 | Deliberate practice, systematized — AI as curriculum, coach, and accountability. |
| `04-fitness-os.md` | Fitness OS | LOW *(the angle)* | beta · 2/5 | Watch a system get built — the roadmap and changelog are the demo. |

Each file also doubles as **draft manifest source**: a YAML frontmatter block at the top
captures the core §3.3 manifest fields (slug, name, tagline, status, maturity, started,
stack, ai_roles) so the build can lift them straight into `manifest.json`.

---

## The section template (every capsule follows this exact order — §4.3)

1. **Hero** — name, status badge (live/beta/concept + maturity 1–5), tagline, 2–3 headline metrics, primary CTA.
2. **The Pitch** — Problem → System → Payoff. Real-life stakes, not just technical.
3. **The Loops** — table: cadence × what happens × automation level (full / human-approve / manual).
4. **AI Architecture** — models in named roles (monitor, anomaly-analyst, red-team, committee-chair, coach, curator…) and where the human-approval gates sit.
5. **The Flowchart** — a valid Mermaid `flowchart` block built from the §5 node list.
6. **Challenges & Lessons** — candid, specific. The highest-credibility section for senior readers.
7. **Live** — the demo per §3.5 (what the visitor sees / does).
8. **Changelog & Metrics** — recent-activity stub (newest first) + metric definitions the page surfaces.
9. **Roadmap** — 3–5 forward bullets.

---

## Placeholder / metric convention

The capsules deliberately **do not invent precise numbers.** Where a live figure belongs,
you'll see one of two markers — wire them to real data before the page goes live:

- **`{{metric_key}}`** — a value the page pulls from the project heartbeat or changelog
  at render time (e.g. `{{uptime_days}}`, `{{cycle_day}}`, `{{streak_days}}`). These map
  to `manifest.metrics[].key` per §3.3.
- **`[metric: <name> — pull from <source>]`** — a prose placeholder where a number is
  referenced inline and needs a human/build step to source it.

Qualitative facts grounded in the brief and status files are stated plainly (no placeholder).
Open decisions that are Chris's to make are flagged inline as **`[Chris to confirm: …]`** and
the copy is written to the brief's stated default in the meantime.

---

## Before each page goes live — what's still needed

Drawn from each project's §5 "to do" list. None of this is content work; it's spoke-readiness
(giving each project a public surface, a heartbeat, and a changelog).

### 01 — Speakeasy Growroom (readiness HIGH)
- [ ] Heartbeat POST from the controller (small) → Supabase `heartbeats`.
- [ ] `manifest.json` + `CHANGELOG.md` for the project.
- [ ] Confirm Twitch channel + `parent=` domain param for the embed; verify timelapse fallback exists (R2).
- [ ] Final read of the one-line legal-context sentence (D1) — confirm wording.
- [ ] Opsec check: no street-level location anywhere in copy or stream overlay; telemetry push-only.

### 02 — Claude Investment Portfolio (readiness MEDIUM)
- [ ] Redaction pass + transcript renderer for the Committee Transcript Gallery (flagship content).
- [ ] Heartbeat from pipeline runs (cycle stage, reports generated, last committee date).
- [ ] Disclaimer wired ("personal research system, not investment advice").
- [ ] **D6 disclosure = full positions & $** (LOCKED — Chris decision, review_decisions.jsonl 2026-06-13). The page shows the actual book — positions and dollar amounts — alongside the reasoning. Wire the live holdings table from `Holdings_Master.md`, then `[confirm: live positions/$ table + redaction pass]` before publish — gated on the single-capital-ledger consolidation completing.
- [ ] Resolve the open audit remediation items before publishing live metrics (status file: 🔴 audit-remediation-open).

### 03 — The Woodshed (readiness MEDIUM)
- [ ] **Gating item:** public hosting + read-only demo mode (sample student or guest sandbox) — R8: no real user data in the sandbox.
- [ ] Heartbeat on session completion (streak, sessions, hours).
- [ ] `manifest.json` + `CHANGELOG.md`.
- [ ] Note: app is mid-rebuild (A1 per-block logging is the keystone) — confirm demo mode reflects current, not aspirational, surface.

### 04 — Fitness OS (readiness LOW = the angle)
- [ ] Define the v1 ingest loop (workouts / body metrics / sleep) — deliberately small.
- [ ] `manifest.json` + first `CHANGELOG.md` entry.
- [ ] Short 60–90s video + a simple metrics panel once the first ingest loop exists.
- [ ] R7: surface trends and adherence %, never raw body data.

---

*Template authority: AI-Portfolio-Build-Brief-v1.md §4.3, §5 (template/voice/structure only). Voice: §1.1.
Locked decisions — D4 lab brand = "Compound Interests", D6 disclosure = full positions & $ — per
review_decisions.jsonl 2026-06-13, which supersedes the build brief's older process-only default.*
