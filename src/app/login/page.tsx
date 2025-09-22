'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });
    
    setLoading(false);
    if (result?.error) {
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    } else if (result?.ok) {
        router.push('/');
        router.refresh();
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-slate-50 p-4">
      <div className="p-8 sm:p-10 bg-white shadow-xl rounded-2xl w-full max-w-md">
        <div className="flex justify-center mb-4">
            <Image src="/deudores.png" alt="Logo Deudores" width={100} height={100} />
        </div>
        <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-red-100 text-red-700 p-3 mb-4 rounded-md text-sm">{error}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border rounded-md w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-4 focus:ring-slate-300 w-full disabled:bg-slate-400"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
