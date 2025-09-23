import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const { token } = req.nextauth;
        const { pathname } = req.nextUrl;

        // Redirigir desde la página principal si el usuario ya ha iniciado sesión
        if (pathname === '/' && token) {
            if (token.role === 'ADMIN') {
                return NextResponse.redirect(new URL('/admin', req.url));
            }
            if (token.role === 'COMERCIO') {
                return NextResponse.redirect(new URL('/comercio', req.url));
            }
        }

        // Redirigir a los usuarios con el rol incorrecto
        // Esta lógica solo se ejecuta si el usuario está autenticado (ver `authorized` callback)
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
            // Si esto devuelve `false`, el usuario es redirigido a la página de inicio de sesión.
            // Esto maneja el caso de cierre de sesión de forma automática y segura.
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: [
        '/',
        '/admin/:path*',
        '/comercio/:path*',
    ],
};
