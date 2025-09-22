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
    fetch('/api/users')
      .then((res) => {
        if (!res.ok) {
          throw new Error('No tienes permiso para ver esta página.');
        }
        return res.json();
      })
      .then((data) => {
        setUsers(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDelete = async (userId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
        if (!res.ok) {
          throw new Error('No se pudo eliminar el usuario.');
        }
        setUsers(users.filter((user) => user.id !== userId));
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administrador</h1>
          <p className="text-gray-600">Bienvenido, {session?.user?.name}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/new" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-center">
            Crear Usuario
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                CUIT
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                  {user.name}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                  {user.email}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                  <span
                    className={`px-2 py-1 font-semibold leading-tight rounded-full ${
                      user.role === 'ADMIN'
                        ? 'text-red-900 bg-red-200'
                        : 'text-green-900 bg-green-200'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-4 border-b border-gray-200 text-sm">
                  {user.cuit || 'N/A'}
                </td>
                <td className="px-5 py-4 border-b border-gray-200 text-sm flex items-center gap-4">
                  <Link href={`/admin/edit/${user.id}`} className="text-indigo-600 hover:text-indigo-900">
                    <Image src="/pencil.svg" alt="Editar" width={20} height={20} />
                  </Link>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Image src="/trash.svg" alt="Eliminar" width={20} height={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
