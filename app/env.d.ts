interface ImportMetaEnv {
  /** When the site was built (ISO 8601), set in vite.config.ts. */
  readonly BUILD_TIME: string;
  /** Cloudflare Web Analytics site token. Analytics are off when unset. */
  readonly VITE_CF_ANALYTICS_TOKEN?: string;
}
