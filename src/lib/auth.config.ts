import type { NextAuthConfig } from 'next-auth';
import { randomBytes } from 'node:crypto';

const PUBLIC_ROUTES = ['/login', '/register', '/verify-otp', '/forgot-password', '/reset-password'];
const DEFAULT_LOGIN_REDIRECT = '/';

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

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  secret: getAuthSecret(),
  trustHost: true,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = PUBLIC_ROUTES.some(route =>
        nextUrl.pathname.startsWith(route)
      );

      // Nếu đang ở auth route mà đã đăng nhập → redirect về dashboard
      if (isPublicRoute) {
        if (isLoggedIn) {
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
        }
        return true; // Cho phép vào trang login/register
      }

      // Mọi route còn lại đều cần đăng nhập
      return isLoggedIn;
      // NextAuth tự động redirect về pages.signIn nếu return false
    },
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  providers: [],
} satisfies NextAuthConfig;