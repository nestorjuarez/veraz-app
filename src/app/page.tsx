import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link";
import Image from "next/image";
import styles from './home.module.css';
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user?.role === 'ADMIN') {
    redirect('/admin')
  } else if (session?.user?.role === 'COMERCIO') {
    redirect('/comercio')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="text-center flex flex-col items-center">
        <Image src="/deudores.png" alt="Veraz Logo" width={180} height={180} className="mb-8" />
        <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${styles.textShadow}`}>Bienvenido a Veraz Cruz del Eje</h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
          La plataforma para la gestión eficiente de deudas comerciales. Inicia sesión para acceder a tu panel.
        </p>
        <Link 
          href="/login" 
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full text-lg font-bold transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          Iniciar Sesión
        </Link>
      </div>
    </main>
  );
}
