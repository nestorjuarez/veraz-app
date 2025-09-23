'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'COMERCIO',
    cuit: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const { error: errorMessage } = await res.json();
        throw new Error(errorMessage || 'No se pudo crear el usuario.');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="container mx-auto max-w-lg">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center">Crear Nuevo Usuario</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-center text-sm">{error}</p>}

            <div>
              <label className="block text-gray-400 font-bold mb-2" htmlFor="name">Nombre</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-2" htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-2" htmlFor="password">Contraseña</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-2" htmlFor="role">Rol</label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="COMERCIO">COMERCIO</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 font-bold mb-2" htmlFor="cuit">CUIT (Opcional)</label>
              <input type="text" id="cuit" name="cuit" value={formData.cuit} onChange={handleChange} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Link href="/admin" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Cancelar
              </Link>
              <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors">
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
