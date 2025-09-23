'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
      } else if (result?.ok) {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError('Ha ocurrido un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
            <Image src="/deudores.png" alt="Deudores Logo" width={120} height={120} />
        </div>
        
        <div className="bg-gray-800 shadow-xl rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-center text-white mb-6">Iniciar Sesión</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <p className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-center text-sm">{error}</p>}
            
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
