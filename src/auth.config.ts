import type { NextAuthConfig } from "next-auth";

// Edge-safe Auth.js config. No database or bcrypt here so it can run in the
// middleware (edge runtime). The Credentials provider is added in auth.ts,
// which runs in the Node runtime.
export const authConfig = {
  // Trust the host header. Required when self-hosting / running `next start`
  // behind a proxy; Vercel sets this automatically but it's harmless there.
  trustHost: true,
  pages: {
    signIn: "/sign-in",
  },
  session: { strategy: "jwt" },
  callbacks: {
    // Gate access to protected routes. Returning false redirects to signIn.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) return isLoggedIn;

      // Signed-in users hitting auth pages get bounced to the dashboard.
      const isOnAuthPage =
        nextUrl.pathname === "/sign-in" || nextUrl.pathname === "/sign-up";
      if (isLoggedIn && isOnAuthPage) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // added in auth.ts
} satisfies NextAuthConfig;
