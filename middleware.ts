import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(request: Request & { nextUrl: URL }) {
  const token = await getToken({
    req: request as any,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
  });

  if (!token) {
    const loginUrl = new URL("/login", request.nextUrl);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/clients/:path*",
    "/vendors/:path*",
    "/workers/:path*",
    "/reports/:path*",
    "/ai-assistant/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/admin/:path*",
    "/schedule/:path*",
    "/tasks/:path*",
    "/boq/:path*",
    "/daily-progress/:path*",
    "/labour/:path*",
    "/materials/:path*",
    "/equipment/:path*",
    "/measurements/:path*",
    "/bills/:path*",
    "/payments/:path*",
    "/expenses/:path*",
    "/site-photos/:path*",
    "/documents/:path*",
    "/calendar/:path*",
    "/notifications/:path*"
  ]
};
