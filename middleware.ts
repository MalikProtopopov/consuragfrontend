import { NextResponse, type NextRequest } from "next/server";

/**
 * Protected routes that require authentication
 */
const PROTECTED_PREFIXES = ["/projects", "/admin", "/settings", "/dashboard"];

/**
 * Admin-only routes (require SAAS_ADMIN role)
 */
const ADMIN_PREFIXES = ["/admin"];

/**
 * Auth routes (redirect to /projects if authenticated)
 */
const AUTH_ROUTES = ["/login", "/register"];

/**
 * Check if path matches any prefix
 */
function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * Middleware for route protection
 * - Checks for access_token cookie
 * - Redirects unauthenticated users to login
 * - Redirects non-admins from /admin routes
 * - Redirects authenticated users away from auth pages
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Get access token from cookies
  const accessToken = request.cookies.get("access_token")?.value;

  // Check if user is authenticated
  const isAuthenticated = !!accessToken;

  // Protected routes - require authentication
  if (matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin routes - require SAAS_ADMIN role
    if (matchesPrefix(pathname, ADMIN_PREFIXES)) {
      // We need to verify the token and check the role
      // Since we can't make async API calls reliably in Edge middleware,
      // we'll decode the JWT to check the role
      try {
        const payload = parseJwtPayload(accessToken);
        if (payload?.role !== "saas_admin") {
          return NextResponse.redirect(new URL("/projects", request.url));
        }
      } catch {
        // If token parsing fails, redirect to login
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Auth routes - redirect authenticated users to projects
  if (AUTH_ROUTES.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  return NextResponse.next();
}

/**
 * Parse JWT payload without verification (for client-side role check)
 * Server-side verification happens on API calls
 */
function parseJwtPayload(token: string): { role?: string; sub?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    if (!payload) return null;

    // Base64 decode
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded) as { role?: string; sub?: string };
  } catch {
    return null;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes
     * - _next (static files)
     * - favicon.ico
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

