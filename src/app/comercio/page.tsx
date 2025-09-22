'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import AddDebtModal from '@/app/components/AddDebtModal';

interface Debt {
  id: number;
  amount: number;
  description: string;
  status: 'PENDING' | 'PAID';
  createdAt: string;
}

interface Client {
  id: number;
  dni: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  debts: Debt[];
}

export default function ComercioPage() {
  const { data: session } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchClients = () => {
    setLoading(true);
    fetch('/api/clients')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar los clientes.');
        return res.json();
      })
      .then((data) => {
        setClients(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchClients(); // Recargar la lista de clientes
  };

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <>
      <AddDebtModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
      <div className="container mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Panel de Comercio</h1>
            <p className="text-gray-600">Bienvenido, {session?.user?.name}</p>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              Registrar Deuda
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">Cargando clientes...</div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full leading-normal">
              <thead>
                <tr>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cliente</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">DNI</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Adeudado</th>
                  <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Deudas Activas</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const pendingDebts = client.debts.filter(d => d.status === 'PENDING');
                  const totalDebt = pendingDebts.reduce((acc, debt) => acc + debt.amount, 0);
                  
                  return (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 border-b border-gray-200 text-sm">{client.firstName} {client.lastName}</td>
                      <td className="px-5 py-4 border-b border-gray-200 text-sm">{client.dni}</td>
                      <td className="px-5 py-4 border-b border-gray-200 text-sm font-semibold">${totalDebt.toFixed(2)}</td>
                      <td className="px-5 py-4 border-b border-gray-200 text-sm">{pendingDebts.length}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
