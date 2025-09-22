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
  comercio?: { name: string };
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
  
  // Estados para la búsqueda
  const [searchDni, setSearchDni] = useState('');
  const [searchResult, setSearchResult] = useState<Client | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');

  const fetchClients = () => {
    setLoading(true);
    fetch('/api/clients')
      .then((res) => {
        if (!res.ok) throw new Error('No se pudieron cargar los clientes.');
        return res.json();
      })
      .then((data) => setClients(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, []);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchDni) return;

    setSearchLoading(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const res = await fetch(`/api/clients/${searchDni}`);
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || 'Error en la búsqueda');
      }
      const data = await res.json();
      setSearchResult(data);
    } catch (err: any) {
      setSearchError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    fetchClients();
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

        {/* --- Sección de Búsqueda --- */}
        <div className="mb-8 p-6 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Consultar Deudor por DNI</h2>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchDni}
              onChange={(e) => setSearchDni(e.target.value)}
              placeholder="Ingrese DNI del cliente"
              className="flex-grow p-2 border rounded"
            />
            <button type="submit" disabled={searchLoading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-green-300">
              {searchLoading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
          {searchError && <p className="text-red-500 mt-4">{searchError}</p>}
          {searchResult && (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="text-xl font-semibold">{searchResult.firstName} {searchResult.lastName}</h3>
              <p><strong>DNI:</strong> {searchResult.dni}</p>
              <p><strong>Email:</strong> {searchResult.email || 'N/A'}</p>
              <h4 className="text-lg font-semibold mt-4 mb-2">Historial de Deudas:</h4>
              <ul className="list-disc pl-5">
                {searchResult.debts.length > 0 ? (
                  searchResult.debts.map(debt => (
                    <li key={debt.id}>
                      <strong>Comercio:</strong> {debt.comercio?.name} - <strong>Monto:</strong> ${debt.amount.toFixed(2)} - <strong>Estado:</strong> {debt.status}
                    </li>
                  ))
                ) : (
                  <p>Este cliente no tiene deudas registradas.</p>
                )}
              </ul>
            </div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold mb-4">Mis Clientes Deudores</h2>
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
