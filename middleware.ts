import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register");
        const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
        
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
    }
);

export const config = {
    matcher: ["/admin/:path*", "/login", "/register"],
};
