import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (username === process.env.APP_USERNAME &&
            password === process.env.APP_PASSWORD) {
            // Create session that lasts for 1 month
            const session = {
                username,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            };

            const response = NextResponse.json({ success: true });
            response.cookies.set('chat_session', JSON.stringify(session), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 // 30 days
            });

            return response;
        }

        return NextResponse.json(
            { error: 'Invalid credentials' },
            { status: 401 }
        );
    } catch {
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.delete('chat_session');
    return response;
} 