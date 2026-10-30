import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Lightweight edge-safe guard: redirect to /login when no Auth.js session cookie is present.
// Full session + role checks still happen server-side in each page via auth().
export function middleware(req: NextRequest) {
  const hasSession =
    req.cookies.has("authjs.session-token") || req.cookies.has("__Secure-authjs.session-token");
  if (!hasSession) {
    const url = new URL("/login", req.url);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
