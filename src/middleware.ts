import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const { token } = req.nextauth;
        const { pathname } = req.nextUrl;

        if (pathname.startsWith('/admin') && token?.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/comercio', req.url));
        }

        if (pathname.startsWith('/comercio') && token?.role !== 'COMERCIO') {
            return NextResponse.redirect(new URL('/admin', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        '/admin/:path*',
        '/comercio/:path*',
    ],
};
