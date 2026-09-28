import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/lib/auth.config';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

function getAuthSecret() {
  const configuredSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;

  if (configuredSecret && configuredSecret.length >= 32) {
    return configuredSecret;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('AUTH_SECRET/NEXTAUTH_SECRET is required in production and must be at least 32 characters long.');
  }

  return randomBytes(32).toString('hex');
}

if (process.env.NODE_ENV === 'production') {
  delete process.env.NEXTAUTH_URL;
  delete process.env.AUTH_URL;
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  secret: getAuthSecret(),
  trustHost: true,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) return null;

          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);

          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.fullName,
              image: user.avatarUrl
            };
          }
        }
        return null;
      },
    }),
  ],
});
