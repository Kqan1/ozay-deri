import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { checkRateLimit, getIpFromRequest } from "@/lib/rate-limit";

export default withAuth(
    function middleware(req) {
        // --- 1. RATE LIMITING ---
        const ip = getIpFromRequest(req);
        const path = req.nextUrl.pathname;

        // Login & Register & Auth API Limit (Dakikada 5 İstek)
        if (path.startsWith("/login") || path.startsWith("/register") || path.startsWith("/api/auth")) {
            const isAllowed = checkRateLimit(`auth-${ip}`, 5, 60 * 1000); // 60 saniye
            if (!isAllowed) {
                return new NextResponse("Too Many Requests: Lütfen daha sonra tekrar deneyin.", { status: 429 });
            }
        }

        // Search Limit (Dakikada 30 İstek)
        if (path.startsWith("/search")) {
            const isAllowed = checkRateLimit(`search-${ip}`, 30, 60 * 1000); // 60 saniye
            if (!isAllowed) {
                // Next.js sayfalarında 429'u daha düzgün göstermek için rewrite/redirect yapılabilir
                // Ancak basit bir 429 status response'u botları engellemek için idealdir.
                return new NextResponse("Too Many Requests: Çok fazla arama yaptınız. Lütfen biraz bekleyin.", { status: 429 });
            }
        }

        // --- 2. AUTH & ROUTING LOGIC ---
        const token = req.nextauth.token;
        const isAccountDeletedPage = path === "/account-deleted";

        // If the token is marked as deleted/invalid from the database check, redirect to error page
        if (token && token.error === "UserDeleted") {
            if (!isAccountDeletedPage) {
                return NextResponse.redirect(new URL("/account-deleted", req.url));
            }
            return NextResponse.next();
        }

        const isAuthPage = path.startsWith("/login") || path.startsWith("/register");
        const isAdminPage = path.startsWith("/admin");

        if (isAdminPage) {
            if (!token) {
                // If not logged in, redirect to login
                return NextResponse.redirect(new URL("/login", req.url));
            }
            if (token.role !== "ADMIN") {
                // If logged in but not admin, redirect to home page
                return NextResponse.redirect(new URL("/", req.url));
            }
        }

        if (isAuthPage && token) {
            // If already logged in, redirect away from login/register to home page
            return NextResponse.redirect(new URL("/", req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            // Always return true here so the middleware function above is always called and handles the redirects.
            authorized: () => true,
        },
    },
);

export const config = {
    matcher: [
        "/admin/:path*", 
        "/login", 
        "/register", 
        "/account-deleted", 
        "/search", 
        "/api/auth/:path*"
    ],
};
