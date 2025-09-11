import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login"];
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
    const response = NextResponse.redirect(
      new URL("/maintenance", request.url)
    );

    // Add no-cache headers
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  }

  if (publicRoutes.includes(pathname)) {
    if (authToken) {
      const response = NextResponse.redirect(
        new URL("/attendance", request.url)
      );

      // Prevent caching of this redirect
      response.headers.set("Cache-Control", "no-store, must-revalidate");
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");

      return response;
    }
    return NextResponse.next();
  }

  if (protectedRoutes.includes(pathname) && !authToken) {
    const response = NextResponse.redirect(new URL("/login", request.url));

    // Prevent caching of this redirect
    response.headers.set("Cache-Control", "no-store, must-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
