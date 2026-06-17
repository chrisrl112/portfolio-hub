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
