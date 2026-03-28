import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const refreshToken = req.cookies.get("refreshToken")?.value;
    const { pathname } = req.nextUrl;

    const isPublic = PUBLIC_ROUTES.some((r) => pathname.startsWith(r));

    if (!token && !isPublic && !refreshToken) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && isPublic && refreshToken) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    if (!token && refreshToken) {
        try {
            // refresh token
            const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/refresh-token`, {
                method: "POST",
                headers: {
                    Cookie: `refreshToken=${refreshToken}`,
                },
            });

            if (response.ok) {
                const res = NextResponse.redirect(new URL(pathname, req.url));

                // Forward Set-Cookie headers to the browser
                const setCookies = response.headers.getSetCookie?.();
                if (setCookies && setCookies.length > 0) {
                    setCookies.forEach((cookie) => {
                        res.headers.append("Set-Cookie", cookie);
                    });
                }
                return res;
            }
        } catch (error) {
            console.error("Auth refresh failed in middleware:", error);
        }

        // If refresh fails or returns error, redirect to login
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
