import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.startsWith('/api') &&
        !request.nextUrl.pathname.startsWith('/api/auth')) {

        const token = request.cookies.get('session')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await verifySession(token);
        if (!session) {
            return NextResponse.json({ error: 'Invalid Session' }, { status: 401 });
        }

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-user-id', session.userId as string);

        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/:path*',
};
