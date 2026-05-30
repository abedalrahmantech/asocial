import { AuthConfig } from "convex/server";

if (!process.env.CLERK_JWT_ISSUER_DOMAIN) {
  throw new Error(
    "CLERK_JWT_ISSUER_DOMAIN is not set. Add your Clerk Frontend API URL " +
      "(e.g. https://your-app.clerk.accounts.dev) to .env.local and the Convex dashboard.",
  );
}

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
