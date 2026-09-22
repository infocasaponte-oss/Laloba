import { randomBytes } from "node:crypto";
import { betterAuth } from "better-auth";
import { env } from "../env.server";
import { emailAndPasswordEnabled } from "./email-password";
import { GROK_PROVIDERS } from "./providers";
import { PREVIEW_CLIENT_ID,PREVIEW_CLIENT_SECRET,previewOAuthConfigured } from "./preview";

const secret=env("BETTER_AUTH_SECRET");
const baseURL=env("BETTER_AUTH_URL");
if(Boolean(secret)!==Boolean(baseURL))throw new Error("BETTER_AUTH_SECRET and BETTER_AUTH_URL must be configured together");

export const authConfigured=Boolean(secret&&baseURL);

// Better Auth requires a server secret even when auth is intentionally disabled.
// Use an unpredictable process-local value instead of a committed fallback.
// It never represents a configured authentication boundary and changes on restart.
const runtimeSecret=secret??randomBytes(32).toString("hex");

const socialProviders=previewOAuthConfigured()
 ?Object.fromEntries(GROK_PROVIDERS.map((provider)=>[provider.idp,{clientId:PREVIEW_CLIENT_ID!,clientSecret:PREVIEW_CLIENT_SECRET!}]))
 :{};

export const auth=betterAuth({
 secret:runtimeSecret,
 baseURL,
 emailAndPassword:{enabled:emailAndPasswordEnabled},
 socialProviders,
 advanced:{useSecureCookies:process.env.NODE_ENV==="production"},
});
