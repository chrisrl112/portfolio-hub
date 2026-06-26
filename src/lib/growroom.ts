/**
 * Growroom "living window" config (ph-43).
 *
 * This is the hub-side render of the Growroom case-study §7 LIVE block: a
 * sandboxed live Twitch player as the centerpiece + a heartbeat-fed telemetry
 * strip. It CONSUMES the stream (already live) and the ph-5/ph-23 heartbeat; it
 * never broadcasts, polls the house, or carries a secret.
 *
 * Honest by construction: the Twitch player self-reports its own live/offline
 * state (so it's never a false "live" claim), and the telemetry strip is driven
 * by the heartbeat baked at build time — every unbound metric renders `—`. There
 * is NO client secret and NO Twitch-API live detection.
 */

/** The Growroom project slug (matches its manifest + directory). */
export const GROWROOM_SLUG = 'speakeasy-growroom';

/**
 * Twitch channel handle for the player (ph-46 input). Empty string ⇒ unconfigured
 * ⇒ State C (the existing placeholder), so the surface is dormant-by-default.
 */
export const GROWROOM_CHANNEL = 'chrisliquin';

/**
 * Every domain the player is embedded on. Twitch BLOCKS the embed unless every
 * parent origin is listed, so we carry both the apex and www (canonical is
 * www.chrisliquin.com; the apex 301s but the iframe must still allow it).
 */
export const PARENT_HOSTS = ['chrisliquin.com', 'www.chrisliquin.com'] as const;

/** The canonical public stream (linked as "open on Twitch"). */
export const GROWROOM_TWITCH_URL = `https://www.twitch.tv/${GROWROOM_CHANNEL}`;

/**
 * Build the exact sandboxed Twitch player src. `muted=true` is required for
 * reliable autoplay (a visitor can unmute in-player); every parent host is
 * appended so Twitch never refuses the embed.
 *
 * Twitch refuses to render on any host not listed in `parent=`. Prod is the two
 * chrisliquin.com origins; pass `extraParents` (e.g. ['localhost']) from a dev
 * build so the player also renders during local preview.
 */
export function growroomPlayerSrc(
  channel: string = GROWROOM_CHANNEL,
  extraParents: string[] = [],
): string {
  const parents = [...PARENT_HOSTS, ...extraParents]
    .map((h) => `parent=${encodeURIComponent(h)}`)
    .join('&');
  return `https://player.twitch.tv/?channel=${encodeURIComponent(channel)}&${parents}&muted=true&autoplay=true`;
}
