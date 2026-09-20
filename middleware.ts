import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PREFIXED_LOCALES = new Set(["zh", "ko"]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const first = pathname.split("/")[1];

  if (first === "en") {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/en" ? "/" : pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (first && PREFIXED_LOCALES.has(first)) {
    const response = NextResponse.next();
    response.headers.set("x-locale", first);
    return response;
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/en" : `/en${pathname}`;
  const response = NextResponse.rewrite(url);
  response.headers.set("x-locale", "en");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|llms.txt).*)"],
};
