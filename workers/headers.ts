/**
 * Response headers for every page and file. Cloudflare applies
 * `build/client/_headers` (generated from this list at build time; see
 * vite.config.ts) only to static assets, so the Worker sets the same headers
 * on the responses it renders.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  // 'unsafe-inline': React Router's hydration scripts are inline.
  // Cloudflare Web Analytics loads its beacon from static.cloudflareinsights.com.
  "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com",
  "style-src 'self'",
  "font-src 'self'",
  "img-src 'self' data:",
  "connect-src 'self' https://cloudflareinsights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CONTENT_SECURITY_POLICY,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/** The `_headers` file Cloudflare reads from the static assets directory. */
export function headersFile() {
  const lines = (headers: Record<string, string>) =>
    Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`);
  return [
    '/*',
    ...lines(SECURITY_HEADERS),
    // Fingerprinted build output never changes.
    '/assets/*',
    ...lines({ 'Cache-Control': 'public, max-age=31536000, immutable' }),
    '',
  ].join('\n');
}

/** Adds the security headers to a response the Worker rendered. */
export function withSecurityHeaders(response: Response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS))
    if (!headers.has(name)) headers.set(name, value);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
