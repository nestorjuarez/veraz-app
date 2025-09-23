'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  cuit: string | null;
}

export default function AdminPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (!res.ok) {
          throw new Error('No se pudieron cargar los usuarios');
        }
        const data = await res.json();
        setUsers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (userId: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          throw new Error('No se pudo eliminar el usuario');
        }
        setUsers(users.filter(user => user.id !== userId));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold">Panel de Administrador</h1>
                <p className="text-gray-400">Bienvenido, {session?.user?.name || 'Administrador'}</p>
            </div>
            <div className="flex items-center gap-4">
                <Link href="/admin/new" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    + Crear Usuario
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: '/login' })}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Cerrar Sesión
                </button>
            </div>
        </header>
        
        <main>
            <div className="overflow-x-auto bg-gray-800 shadow-xl rounded-2xl p-6">
                {error && <p className="text-red-400 mb-4">{error}</p>}
                {loading ? (
                    <p>Cargando usuarios...</p>
                ) : (
                    <div className="inline-block min-w-full overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-l-lg">Nombre</th>
                                    <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Email</th>
                                    <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Rol</th>
                                    <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">CUIT</th>
                                    <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-r-lg">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-700/50">
                                        <td className="py-4 px-5">{user.name}</td>
                                        <td className="py-4 px-5">{user.email}</td>
                                        <td className="py-4 px-5">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                user.role === 'ADMIN' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">{user.cuit || 'N/A'}</td>
                                        <td className="py-4 px-5">
                                            <div className="flex items-center space-x-4">
                                                <Link href={`/admin/edit/${user.id}`}>
                                                    <Image src="/pencil.svg" alt="Editar" width={20} height={20} className="cursor-pointer hover:opacity-75" />
                                                </Link>
                                                <button onClick={() => handleDelete(user.id)}>
                                                    <Image src="/trash.svg" alt="Eliminar" width={20} height={20} className="cursor-pointer hover:opacity-75" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
}
