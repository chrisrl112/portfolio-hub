// Interest-capture config (ph-39 / ph-28=D Hybrid). The footer surfaces three
// low-friction ways to stay in touch — follow links, one email box, a mailto —
// all cookieless with no PII beyond a deliberately-submitted email. Edit ONLY
// this file to wire the real values; the footer renders each piece only when
// its value is present, so an unset field never ships a dead link.

export interface SocialLink {
  /** Short label shown in the footer (e.g. "GitHub"). */
  label: string;
  /** Full profile URL. */
  href: string;
}

/**
 * Public social profiles to link from the footer. Fill with real profile URLs.
 * Leave empty to hide the follow row entirely (no dead links).
 */
export const SOCIAL_LINKS: SocialLink[] = [
  // { label: 'GitHub', href: 'https://github.com/<handle>' },
  // { label: 'LinkedIn', href: 'https://www.linkedin.com/in/<handle>' },
  // { label: 'X', href: 'https://x.com/<handle>' },
];

/**
 * Buttondown embed-form POST target, e.g.
 * "https://buttondown.com/api/emails/embed-subscribe/<username>".
 * Cookieless plain-HTML form — no JS, no tracker. null hides the email box.
 */
export const BUTTONDOWN_ACTION_URL: string | null = null;

/** Public contact address for the footer mailto. */
export const CONTACT_EMAIL = 'liquincr@gmail.com';
