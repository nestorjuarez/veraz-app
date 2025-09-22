'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminPage() {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
            <div className="p-8 bg-white shadow-md rounded-lg text-center">
                <h1 className="text-2xl font-bold mb-4 text-gray-800">Panel de Administrador</h1>
                <p className="mb-6 text-gray-600">
                    Bienvenido, <span className="font-semibold">{session?.user?.name}</span>.
                </p>
                <div className="flex flex-col gap-4">
                    <Link href="/admin/users" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                        Gestionar Usuarios
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
