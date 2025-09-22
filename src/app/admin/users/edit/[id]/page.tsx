'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const userId = params.id;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'COMERCIO',
    cuit: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  useEffect(() => {
    if (userId) {
      setLoadingInitialData(true);
      fetch(`/api/users/${userId}`)
        .then(res => {
          if (!res.ok) throw new Error('No se pudo cargar la información del usuario.');
          return res.json();
        })
        .then(data => {
          setFormData({
            name: data.name,
            email: data.email,
            role: data.role,
            cuit: data.cuit || '',
            password: '',
          });
        })
        .catch(err => setError(err.message))
        .finally(() => setLoadingInitialData(false));
    }
  }, [userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const dataToUpdate: any = { ...formData };
    if (!dataToUpdate.password) {
      delete dataToUpdate.password;
    }

    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate),
      });

      if (!res.ok) {
        const { error: errorMessage } = await res.json();
        throw new Error(errorMessage || 'No se pudo actualizar el usuario.');
      }

      router.push('/admin/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingInitialData) return <div className="p-8 text-center">Cargando datos del usuario...</div>;

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Editar Usuario</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="name">Nombre</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg"/>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg"/>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="password">Nueva Contraseña (dejar en blanco para no cambiar)</label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="role">Rol</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg bg-white">
            <option value="COMERCIO">COMERCIO</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2" htmlFor="cuit">CUIT (Opcional)</label>
          <input type="text" id="cuit" name="cuit" value={formData.cuit} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg"/>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/users" className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
            Cancelar
          </Link>
          <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-green-300">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
