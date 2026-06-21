import type { Manifest } from './manifests';

/**
 * Build-time heartbeat feed (ph-5, milestone M2).
 *
 * Telemetry is PUSH-ONLY: each project runtime upserts its own row into a
 * Supabase `heartbeats` table using a service_role key that lives ONLY in that
 * runtime (never here — see supabase/heartbeats.sql §4, CLAUDE.md OPSEC). This
 * module performs the SITE side: a single build-time SELECT with the anon key
 * (read-only RLS), mapping each row by `project_slug` into the heartbeat fields
 * the EXISTING display layer already consumes (`getHeartbeat()` reads
 * `last_report`; `metricsWithValues()` reads `metric_values`).
 *
 * It is deliberately SSG-only (no client fetch): the rendered site stays fully
 * static and ships no Supabase call to the browser, even though the anon key is
 * read-only. A Vercel rebuild (cron / deploy hook) re-bakes fresh values.
 *
 * Fail-soft is the whole point: missing config, a non-200, or an offline build
 * all resolve to an empty Map, so every card honestly falls back to "awaiting
 * first report" and the deploy never breaks.
 */

// PUBLIC_ vars are safe to read at build because RLS denies all anon writes
// (supabase/heartbeats.sql §3). They are absent until configured → empty Map.
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/** One row of the Supabase `heartbeats` table (the §4 push contract). */
export interface HeartbeatRow {
  project_slug: string;
  last_report: string; // ISO-8601 UTC
  last_activity: string | null; // ISO-8601 UTC | null
  status: string;
  metric_values: Record<string, string | number>;
  note: string | null;
}

/**
 * The subset of manifest fields the heartbeat feed supplies. Spread over a
 * Manifest at the call site so the unchanged `getHeartbeat()` /
 * `metricsWithValues()` read fresh telemetry instead of static manifest fields.
 * Note: `status` is intentionally NOT included — badge/status authority stays
 * with the manifest (ph-15), the feed supplies only freshness + metric values.
 */
export interface HeartbeatFields {
  last_report: string | null;
  last_activity: string | null;
  metric_values: Record<string, string | number>;
}

/**
 * Fetch every heartbeat row at build time, keyed by slug. Fails SOFT to an
 * empty Map on missing config / non-200 / offline so the build never breaks and
 * cards fall back to "awaiting first report".
 */
export async function fetchHeartbeats(): Promise<Map<string, HeartbeatRow>> {
  if (!SUPABASE_URL || !SUPABASE_ANON) return new Map(); // not configured → honest empty
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/heartbeats?select=*`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    });
    if (!res.ok) return new Map(); // transient / RLS error → honest empty
    const rows = (await res.json()) as HeartbeatRow[];
    return new Map(rows.map((r) => [r.project_slug, r]));
  } catch {
    return new Map(); // offline at build → honest empty
  }
}

/**
 * Map one row into the heartbeat fields `getHeartbeat()` / `metricsWithValues()`
 * consume. No row → the awaiting state (`last_report: null`, empty values), so a
 * project that has never reported renders "awaiting first report" exactly as
 * today. Never fabricates a metric value.
 */
export function heartbeatForProject(
  slug: string,
  rows: Map<string, HeartbeatRow>,
): HeartbeatFields {
  const r = rows.get(slug);
  if (!r) {
    return { last_report: null, last_activity: null, metric_values: {} };
  }
  return {
    last_report: r.last_report,
    last_activity: r.last_activity,
    metric_values: r.metric_values ?? {},
  };
}

/**
 * Convenience: a manifest with its heartbeat fields merged in, ready to hand to
 * the existing `getHeartbeat()` / `metricsWithValues()`. Manifest `status` (the
 * badge authority) is preserved; only telemetry freshness + values are merged.
 */
export function withHeartbeat(project: Manifest, rows: Map<string, HeartbeatRow>): Manifest {
  return { ...project, ...heartbeatForProject(project.slug, rows) };
}
