/**
 * OG card template for the link-preview raster (ph-37).
 *
 * Returns a Satori element tree (no JSX — a tiny `h()` hyperscript keeps this a
 * plain .ts file). Two variants share one frame:
 *   - umbrella  -> the home / "Compound Interests" card
 *   - project   -> a manifest-driven capsule (name / tagline / status + accent)
 *
 * Palette is the LIGHT canonical look that is live on prod (warm paper +
 * ci-bronze), pulled verbatim from the Light-Locked home reference. Cards carry
 * only public manifest fields — name, tagline, status, accent_hex — so an OG
 * card can never display a stale or invented metric (DoD / §9.4).
 */

import type { Manifest, ManifestStatus } from './manifests';

// --- Light canonical tokens (verbatim from the Light-Locked home) ------------
const C = {
  canvas: '#F2F0EA',
  hairline: '#E0DCD0',
  bronze: '#8A6F3C', // accent — ci-bronze
  ink: '#1A1916', // headline / name
  secondary: '#6E6A60', // tagline
  body: '#4A4640', // sub copy
  muted: '#8C857A', // footer / muted mono
  markSm: '#B5AE9E', // mark bottom-left (held constant)
  markMd: '#3A352B', // mark middle (held constant)
};

const SANS = 'Inter';
const DISPLAY = 'Space Grotesk';
const MONO = 'JetBrains Mono';

// --- minimal hyperscript: Satori consumes React-element-shaped nodes ---------
type Node = { type: string; props: Record<string, unknown> };
function h(
  type: string,
  props: Record<string, unknown> = {},
  children?: unknown,
): Node {
  return { type, props: { ...props, ...(children !== undefined ? { children } : {}) } };
}

/** Readable text color on a filled accent chip, by relative luminance. */
function onAccent(hex: string): string {
  const c = hex.replace('#', '');
  if (c.length !== 6) return '#FBFAF6';
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return lum > 0.5 ? '#1A1916' : '#FBFAF6';
}

const STATUS_LABEL: Record<ManifestStatus, string> = {
  live: 'LIVE',
  beta: 'BETA',
  concept: 'CONCEPT',
  dormant: 'DORMANT',
  retired: 'RETIRED',
};

/** The Compounding Mark — locked 64×64 geometry, light fills, top square tinted. */
function mark(topFill: string, size = 132): Node {
  return h('svg', { width: size, height: size, viewBox: '0 0 64 64' }, [
    h('rect', { x: 4, y: 42, width: 16, height: 16, rx: 2, fill: C.markSm }),
    h('rect', { x: 22, y: 25, width: 18, height: 18, rx: 2, fill: C.markMd }),
    h('rect', { x: 42, y: 6, width: 20, height: 20, rx: 2, fill: topFill }),
  ]);
}

/** Shared 1200×630 frame: warm canvas, bronze top rule, mark in the top-right. */
function frame(accent: string, markTop: string, content: Node, footer: Node): Node {
  return h(
    'div',
    {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: C.canvas,
        fontFamily: SANS,
      },
    },
    [
      // bronze/accent top rule
      h('div', {
        style: { width: '1200px', height: '10px', backgroundColor: accent, display: 'flex' },
      }),
      // mark, top-right
      h(
        'div',
        {
          style: { position: 'absolute', top: '64px', right: '72px', display: 'flex' },
        },
        mark(markTop),
      ),
      // body column
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            padding: '70px 72px 0 72px',
          },
        },
        content,
      ),
      // footer
      h(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 72px 56px 72px',
          },
        },
        footer,
      ),
    ],
  );
}

function footerStamp(left: string, right?: string): Node {
  const stamp = (text: string, color: string) =>
    h(
      'div',
      {
        style: {
          fontFamily: MONO,
          fontSize: '22px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color,
          display: 'flex',
        },
      },
      text,
    );
  return h('div', { style: { display: 'flex', width: '100%', justifyContent: 'space-between' } }, [
    stamp(left, C.bronze),
    right ? stamp(right, C.muted) : h('div', { style: { display: 'flex' } }, ''),
  ]);
}

function eyebrow(text: string): Node {
  return h(
    'div',
    {
      style: {
        fontFamily: MONO,
        fontSize: '24px',
        fontWeight: 600,
        letterSpacing: '3px',
        textTransform: 'uppercase',
        color: C.bronze,
        display: 'flex',
      },
    },
    text,
  );
}

function statusPill(status: ManifestStatus, accent: string): Node {
  const label = STATUS_LABEL[status] ?? String(status).toUpperCase();
  const filled = status === 'live';
  return h(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        height: '46px',
        padding: '0 22px',
        borderRadius: '999px',
        border: `2px solid ${accent}`,
        backgroundColor: filled ? accent : 'transparent',
        color: filled ? onAccent(accent) : accent,
        fontFamily: MONO,
        fontSize: '22px',
        fontWeight: 600,
        letterSpacing: '2px',
      },
    },
    label,
  );
}

// --- variants ----------------------------------------------------------------

function umbrellaCard(): Node {
  const content = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', maxWidth: '880px' } },
    [
      eyebrow('Compound Interests · Systems that compound'),
      h(
        'div',
        {
          style: {
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: '104px',
            lineHeight: 1.02,
            color: C.ink,
            marginTop: '34px',
            display: 'flex',
          },
        },
        'Systems that compound',
      ),
      h(
        'div',
        {
          style: {
            fontFamily: SANS,
            fontStyle: 'italic',
            fontSize: '34px',
            lineHeight: 1.35,
            color: C.body,
            marginTop: '30px',
            display: 'flex',
          },
        },
        'I design, build, and run multi-agent AI systems — in the open.',
      ),
    ],
  );
  return frame(C.bronze, C.bronze, content, footerStamp('chrisliquin.com'));
}

function projectCard(m: Manifest): Node {
  const accent = m.accent_hex;
  const content = h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', maxWidth: '880px' } },
    [
      eyebrow('A Compound Interests System'),
      h(
        'div',
        {
          style: {
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: '80px',
            lineHeight: 1.04,
            color: C.ink,
            marginTop: '28px',
            display: 'flex',
          },
        },
        m.name,
      ),
      h(
        'div',
        {
          style: {
            fontFamily: SANS,
            fontSize: '34px',
            lineHeight: 1.34,
            color: C.secondary,
            marginTop: '26px',
            // wrap long taglines to multiple lines, never truncate
            display: 'flex',
          },
        },
        m.tagline,
      ),
      h(
        'div',
        { style: { display: 'flex', marginTop: '34px' } },
        statusPill(m.status, accent),
      ),
    ],
  );
  return frame(accent, accent, content, footerStamp('chrisliquin.com', `/projects/${m.slug}`));
}

/** Build the Satori tree for a slug ("home" -> umbrella, else a manifest). */
export function ogTemplate(data: { home: true } | Manifest): Node {
  if ('home' in data && data.home) return umbrellaCard();
  return projectCard(data as Manifest);
}
