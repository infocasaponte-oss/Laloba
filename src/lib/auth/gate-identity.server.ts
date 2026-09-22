import { createRemoteJWKSet, jwtVerify } from "jose";
import { env } from "../env.server";
import { GROK_ISSUER_DEFAULT } from "./preview";

const issuer = env("GROK_IDENTITY_ISSUER") ?? GROK_ISSUER_DEFAULT;
const audience = env("GROK_IDENTITY_AUDIENCE");
const jwksUrl = new URL(env("GROK_IDENTITY_JWKS_URL") ?? new URL("/.well-known/jwks.json", issuer).toString());
const jwks = createRemoteJWKSet(jwksUrl);

export function gateIdentityEnabled(): boolean {
  return Boolean(audience);
}

export type GateIdentity = {
  subject: string;
  email: string | null;
};

export async function verifyGateIdentity(token: string): Promise<GateIdentity | null> {
  if (!audience || !token) return null;
  try {
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      audience,
      algorithms: ["EdDSA", "RS256", "ES256"],
    });
    if (!payload.sub) return null;
    return {
      subject: payload.sub,
      email: typeof payload.email === "string" ? payload.email : null,
    };
  } catch {
    return null;
  }
}
