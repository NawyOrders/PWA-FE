import { NextResponse, type NextRequest } from "next/server";

const locales = ["ar", "en"] as const;
const defaultLocale = "ar";

function hasLocale(pathname: string) {
  return locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (hasLocale(pathname) || pathname.startsWith("/api/") || pathname === "/api") {
    return NextResponse.next();
  }
  if (/\.[^/]+$/.test(pathname) || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }

  const cookieLocale = request.cookies.get("locale")?.value;
  const locale = locales.find((candidate) => candidate === cookieLocale) ?? defaultLocale;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
