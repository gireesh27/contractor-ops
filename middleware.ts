import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: false,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      request.nextUrl.pathname + request.nextUrl.search
    );

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
  ],
};