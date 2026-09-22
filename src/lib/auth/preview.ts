/**
 * Live-preview authentication configuration.
 *
 * Preview OAuth credentials are deployment secrets. They must never be committed
 * to the generated application or exposed through Vite's client environment.
 */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;

function secret(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export const PREVIEW_CLIENT_ID = secret("GROK_PREVIEW_CLIENT_ID");
export const PREVIEW_CLIENT_SECRET = secret("GROK_PREVIEW_CLIENT_SECRET");

export function previewOAuthConfigured(): boolean {
  return Boolean(PREVIEW_CLIENT_ID && PREVIEW_CLIENT_SECRET);
}
