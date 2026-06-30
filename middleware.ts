import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { canAccessPath } from "@/lib/permissions";

export default withAuth(
  function middleware(request) {
    const role = request.nextauth.token?.role as Role | undefined;
    const pathname = request.nextUrl.pathname;

    if (role && !canAccessPath(role, pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) return true;
        return Boolean(token);
      }
    }
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
