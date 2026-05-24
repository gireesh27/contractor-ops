import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { isSuperAdminEmail } from "@/lib/env";

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    secureCookie: request.nextUrl.protocol === "https:"
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const superAdmin = Boolean(token.isSuperAdmin || token.role === "Super Admin" || isSuperAdminEmail(token.email));
    if (!superAdmin) return NextResponse.redirect(new URL("/unauthorized", request.url));
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
    "/profile/:path*",
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
