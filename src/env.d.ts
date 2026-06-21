/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Supabase project URL — anon, read-only RLS. Build-time heartbeat read (ph-5). */
  readonly PUBLIC_SUPABASE_URL?: string;
  /** Supabase anon key — public-safe ONLY because RLS denies all anon writes. */
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
