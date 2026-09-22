function normalizedOrigin(value: string): string | null {
  try { return new URL(value).origin; } catch { return null; }
}

function configuredPublicOrigin(): string | null {
  const configured=process.env.APP_ORIGIN || process.env.BETTER_AUTH_URL;
  return configured ? normalizedOrigin(configured) : null;
}

function trustProxy(): boolean {
  return process.env.TRUST_PROXY === "true";
}

export function isTrustedMutationOrigin(request: Request): boolean {
  const originHeader=request.headers.get("origin");
  if(!originHeader)return true;
  const origin=normalizedOrigin(originHeader);
  if(!origin)return false;

  const publicOrigin=configuredPublicOrigin();
  if(publicOrigin)return origin===publicOrigin;

  const requestOrigin=normalizedOrigin(request.url);
  if(requestOrigin&&origin===requestOrigin)return true;

  // Forwarded headers are attacker-controlled unless the deployment explicitly
  // declares that a trusted proxy strips and rewrites them.
  if(!trustProxy())return false;
  const forwardedHost=request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto=request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if(!forwardedHost||!forwardedProto)return false;
  return origin===normalizedOrigin(`${forwardedProto}://${forwardedHost}`);
}
