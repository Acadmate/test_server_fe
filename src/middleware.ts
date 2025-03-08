import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/", "/login"];
  const protectedRoutes = [
    "/attendance",
    "/timetable",
    "/calender",
    "/supadocs",
    "/gpacalc",
    "/logs",
    "/messmenu",
  ];
  const maintenance = process.env.NEXT_PUBLIC_API_MAINTENANCE;

  if (maintenance === "true") {
    return NextResponse.redirect(new URL("/maintenance", request.url));
  }
  if (publicRoutes.includes(pathname)) {
    if (authToken) {
      return NextResponse.redirect(new URL("/attendance", request.url));
    }
    return NextResponse.next();
  }

  if (protectedRoutes.includes(pathname) && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/attendance",
    "/timetable",
    "/calender",
    "/supadocs",
    "/gpacalc",
    "/logs",
    "/messmenu",
  ],
};
