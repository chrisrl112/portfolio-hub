// Provider-agnostic analytics shim (ph-27) — cookieless, no PII, no consent
// banner. Call sites import ONLY these helpers, never the provider directly, so
// swapping providers is a ≤2-file change: the <Analytics /> tag in BaseLayout
// (§3.1) and the bodies below (§3.4). Events carry only manifest-derived,
// non-personal props (slug, demo_type) — never free-text or user input.
import { track } from '@vercel/analytics';

export type DemoType = 'embed' | 'launch' | 'video' | 'watch-only';

/** Capsule (homepage tile) click → project page. */
export function trackCapsuleClick(slug: string): void {
  track('capsule_click', { slug });
}

/** Demo engagement on a project page (fires once per page). */
export function trackDemoStart(slug: string, demo_type: DemoType): void {
  track('demo_start', { slug, demo_type });
}
