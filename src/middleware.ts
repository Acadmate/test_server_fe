import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value || "";
  const { pathname, origin } = req.nextUrl;

  if (!token) {
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", origin));
    }
    return NextResponse.next();
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const checkAuthUrl = `${apiUrl}/checkAuth`;

    // Log for debugging
    // console.log("Calling checkAuth at:", checkAuthUrl, "with token:", token);

    const response = await fetch(checkAuthUrl, {
      headers: {
        Cookie: `token=${token}`,
      },
    });

    if (response.status !== 200) {
      console.log("Non-200 response:", response.status);
      if (pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", origin));
      }
    } else {
      const data = await response.json();

      if (!data.success) {
        console.log("Auth failed:", data);
        if (pathname !== "/login") {
          return NextResponse.redirect(new URL("/login", origin));
        }
      } else if (pathname === "/login") {
        return NextResponse.redirect(new URL("/attendance", origin));
      }
    }
  } catch (error) {
    console.error("Auth check failed:", error);
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/supadocs/:path",
    "/messmenu/:path",
    "/gpacalc/:path",
    "/timetable/:path",
    "/calender/:path",
    "/attendance/:path*",
    "/login",
    "/",
  ],
};
