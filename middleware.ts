import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Use the edge-safe config (no Credentials provider / bcrypt) for middleware.
export default NextAuth(authConfig).auth;

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
