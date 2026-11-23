import { NextResponse } from "next/server";

import { auth } from "@/auth";

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const user = request.auth?.user;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/emprendimientos");

  if (isAdminLogin) {
    if (user?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  if (isAdminRoute) {
    if (!user) {
      return NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/dashboard", request.url),
      );
    }
  }

  if (isDashboardRoute) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(
      new URL(
        user.role === "ADMIN" ? "/admin" : "/dashboard",
        request.url,
      ),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/dashboard/:path*",
    "/emprendimientos/:path*",
  ],
};
