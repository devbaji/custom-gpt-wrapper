import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if authentication is required
    const requiresAuth = process.env.APP_USERNAME && process.env.APP_PASSWORD;

    // Allow access to login page without authentication
    if (request.nextUrl.pathname === '/login') {
        return NextResponse.next();
    }

    // If authentication is not required, allow all access
    if (!requiresAuth) {
        return NextResponse.next();
    }

    // Check for session cookie
    const session = request.cookies.get('chat_session');

    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
        const sessionData = JSON.parse(session.value);
        const expires = new Date(sessionData.expires);

        // Check if session is expired
        if (expires < new Date()) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    } catch {
        // Invalid session data
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 