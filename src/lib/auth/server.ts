import { betterAuth } from "better-auth";
import { env } from "../env.server";
import { emailAndPasswordEnabled } from "./email-password";
import { GROK_PROVIDERS } from "./providers";
import { PREVIEW_CLIENT_ID, PREVIEW_CLIENT_SECRET, previewOAuthConfigured } from "./preview";

const secret = env("BETTER_AUTH_SECRET");
const baseURL = env("BETTER_AUTH_URL");

export const authConfigured = Boolean(secret && baseURL);

const socialProviders = previewOAuthConfigured()
  ? Object.fromEntries(
      GROK_PROVIDERS.map((provider) => [
        provider.idp,
        {
          clientId: PREVIEW_CLIENT_ID!,
          clientSecret: PREVIEW_CLIENT_SECRET!,
        },
      ]),
    )
  : {};

export const auth = betterAuth({
  secret: secret ?? "laloba-development-only-not-for-production",
  baseURL,
  emailAndPassword: { enabled: emailAndPasswordEnabled },
  socialProviders,
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
  },
});
