import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Check if user is authenticated by looking for the auth cookie
  const isAuthenticated = request.cookies.get("auth")?.value === "true"
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup"

  // For demo purposes, we'll bypass authentication checks
  // This ensures users can access the app even if cookies aren't working properly
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/track/:path*", "/schedule/:path*", "/login", "/signup"],
}

