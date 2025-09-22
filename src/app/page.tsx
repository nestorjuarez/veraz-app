import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './api/auth/[...nextauth]/route';
import Link from 'next/link';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    if (session.user.role === 'ADMIN') {
      redirect('/admin');
    } else if (session.user.role === 'COMERCIO') {
      redirect('/comercio');
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Bienvenido a Veraz</h1>
        <p className="mb-8 text-gray-600">Por favor, inicia sesión para continuar.</p>
        <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
          
            Ir a Iniciar Sesión
          
        </Link>
      </div>
    </div>
  );
}
