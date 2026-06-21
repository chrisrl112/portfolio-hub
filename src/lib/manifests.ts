import Ajv from 'ajv';
import schema from '../../schema/manifest.schema.json';

/**
 * Manifest loading + build-time validation.
 *
 * Every project's manifest.json is validated against schema/manifest.schema.json
 * here, at module load. Because pages import this module, a typo'd or
 * non-conforming manifest FAILS THE BUILD rather than rendering a broken tile
 * (BUILD_BRIEF §3.3, CLAUDE.md conventions).
 */

export type ManifestStatus = 'live' | 'beta' | 'concept' | 'dormant' | 'retired';
export type LoopAutomation = 'full' | 'human-approve' | 'manual';
export type DemoType = 'embed' | 'launch' | 'video' | 'watch-only';
export type MetricSource = 'heartbeat' | 'changelog' | 'manifest';

export interface Loop {
  cadence: string;
  name: string;
  automation: LoopAutomation;
}

export interface Demo {
  type: DemoType;
  url?: string;
  fallback?: string;
}

export interface Metric {
  label: string;
  source: MetricSource;
  key: string;
}

export interface Manifest {
  schema_version: '1.0';
  slug: string;
  name: string;
  tagline: string;
  status: ManifestStatus;
  maturity: number;
  started: string;
  /**
   * ISO-8601 timestamp of the project's last sign of life. Populated by the P2
   * heartbeat layer; absent until then. Drives the StatusBadge staleness note
   * and the dormant invariant guard below (ph-15, §3.3 / §9.4).
   */
  last_heartbeat?: string;
  accent?: string;
  accent_hex?: string;
  visibility: { public: boolean };
  stack: string[];
  ai_roles: string[];
  loops: Loop[];
  demo: Demo;
  links: { live?: string; repo?: string; page: string };
  metrics: Metric[];
  patterns: string[];
}

/**
 * Days without a heartbeat after which a project is considered dormant
 * (BUILD_BRIEF §3.3 / §9.4). The status auto-flip to "dormant" is an upstream
 * (P2) concern; here the constant powers the staleness note and the build-time
 * invariant guard.
 */
export const DORMANT_DAYS = 14;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Whole days elapsed since `lastActivity`, or null if no/invalid timestamp.
 */
function daysSince(lastActivity?: string | null, now: Date = new Date()): number | null {
  if (!lastActivity) return null;
  const then = new Date(lastActivity).getTime();
  if (Number.isNaN(then)) return null;
  return Math.floor((now.getTime() - then) / MS_PER_DAY);
}

/**
 * The staleness-honesty note for the StatusBadge `staleNote` slot (§3.3 / §9.4).
 * Returns "No heartbeat in Nd" once a day has elapsed, or "" when the project is
 * fresh or has no recorded heartbeat (→ badge renders unchanged). The note only
 * SURFACES the gap; the dormant status flip itself happens upstream.
 */
export function computeStaleNote(lastActivity?: string | null, now: Date = new Date()): string {
  const d = daysSince(lastActivity, now);
  return d !== null && d >= 1 ? `No heartbeat in ${d}d` : '';
}

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

// Eagerly load every project manifest at build time.
const modules = import.meta.glob<{ default: unknown }>('/projects/*/manifest.json', {
  eager: true,
});

function loadManifests(): Manifest[] {
  const out: Manifest[] = [];

  for (const [path, mod] of Object.entries(modules)) {
    const data = mod.default;

    if (!validate(data)) {
      const errors = (validate.errors ?? [])
        .map((e) => `  - ${e.instancePath || '(root)'} ${e.message}`)
        .join('\n');
      throw new Error(
        `Invalid manifest: ${path}\n${errors}\n\n` +
          `Manifests must satisfy schema/manifest.schema.json (BUILD_BRIEF §3.3).`,
      );
    }

    const manifest = data as Manifest;

    // The directory name is the canonical slug; catch drift early.
    const dirSlug = path.split('/').slice(-2, -1)[0];
    if (dirSlug !== manifest.slug) {
      throw new Error(
        `Manifest slug "${manifest.slug}" does not match its directory "${dirSlug}" (${path}).`,
      );
    }
    if (manifest.links.page !== `/projects/${manifest.slug}`) {
      throw new Error(
        `Manifest links.page "${manifest.links.page}" must be "/projects/${manifest.slug}" (${path}).`,
      );
    }

    // Invariant (§9.4): a project stale past the dormant threshold can never
    // read "live". The flip to "dormant" is upstream (P2); enforce it here so a
    // badge can never silently lie. Inert until last_heartbeat is populated.
    const stale = daysSince(manifest.last_heartbeat);
    if (stale !== null && stale >= DORMANT_DAYS && manifest.status === 'live') {
      throw new Error(
        `Manifest "${manifest.slug}" is "live" but has had no heartbeat in ${stale}d ` +
          `(>= ${DORMANT_DAYS}d dormant threshold, §9.4). Flip status to "dormant" upstream (${path}).`,
      );
    }

    out.push(manifest);
  }

  return out;
}

const STATUS_ORDER: Record<ManifestStatus, number> = {
  live: 0,
  beta: 1,
  concept: 2,
  dormant: 3,
  retired: 4,
};

/** All projects, ordered live-first then by maturity (desc) then name. */
export function getProjects(): Manifest[] {
  return loadManifests().sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    if (b.maturity !== a.maturity) return b.maturity - a.maturity;
    return a.name.localeCompare(b.name);
  });
}

export function getProject(slug: string): Manifest | undefined {
  return getProjects().find((p) => p.slug === slug);
}
