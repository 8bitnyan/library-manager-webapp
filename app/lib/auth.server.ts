import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import { db } from '~/lib/db.server';
import { getBetterAuthTrustedOrigins } from '~/lib/trusted-origins.server';

export const auth = betterAuth({
  trustedOrigins: getBetterAuthTrustedOrigins(),
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env.BETTER_AUTH_GITHUB_CLIENT_ID &&
  process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET
    ? {
        socialProviders: {
          github: {
            clientId: process.env.BETTER_AUTH_GITHUB_CLIENT_ID,
            clientSecret: process.env.BETTER_AUTH_GITHUB_CLIENT_SECRET,
          },
        },
      }
    : {}),
});

export type Session = typeof auth.$Infer.Session;
