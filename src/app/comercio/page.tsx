'use client';

import { useEffect, useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import AddDebtModal from '@/app/components/AddDebtModal';

interface Debt {
    id: number;
    amount: number;
    description: string;
    status: 'PENDING' | 'PAID' | 'PARTIAL';
    createdAt: string;
    comercioId: number;
    comercio: {
       name: string;
    };
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

interface ClientWithDebts extends Client {
    totalDebt: number;
    activeDebts: number;
}

const statusMap: { [key in 'PENDING' | 'PAID' | 'PARTIAL']: string } = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    PARTIAL: 'Parcial',
};

const statusColors: { [key in 'PENDING' | 'PAID' | 'PARTIAL']: string } = {
    PENDING: 'bg-red-500/20 text-red-300',
    PAID: 'bg-green-500/20 text-green-300',
    PARTIAL: 'bg-yellow-500/20 text-yellow-300',
};


export default function ComercioPage() {
    const { data: session } = useSession();
    const [clients, setClients] = useState<ClientWithDebts[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Search states
    const [searchDni, setSearchDni] = useState('');
    const [searchedClient, setSearchedClient] = useState<ClientWithDebts | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Update states
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);

    const fetchClients = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/clients');
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'No se pudieron cargar los clientes.');
            }
            const data = await res.json();
            setClients(data);
            setError(null);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const searchClientByDni = async (dni: string) => {
        if (!dni.trim()) return;

        setSearchLoading(true);
        setSearchError(null);
        setSearchedClient(null);

        try {
            const res = await fetch(`/api/clients/${dni.trim()}`);
            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || 'Cliente no encontrado');
            }
            const data = await res.json();
            setSearchedClient(data);
        } catch (err: any) {
            setSearchError(err.message);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        searchClientByDni(searchDni);
    };

    const handleViewHistory = (dni: string) => {
        setSearchDni(dni);
        searchClientByDni(dni);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleUpdateDebtStatus = async (debtId: number, status: 'PAID' | 'PARTIAL' | 'PENDING') => {
        setUpdateLoading(true);
        setUpdateError(null);
        try {
            const res = await fetch(`/api/debts/${debtId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Error al actualizar el estado de la deuda');
            }

            await fetchClients();

            if (searchedClient) {
                const res = await fetch(`/api/clients/${searchedClient.dni}`);
                const data = await res.json();
                setSearchedClient(data);
            }

        } catch (err: any) {
            setUpdateError(err.message);
        } finally {
            setUpdateLoading(false);
        }
    };
    
    if (loading && clients.length === 0) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Cargando clientes...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-500">{error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <div className="container mx-auto p-4 sm:p-6 lg:p-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Panel de Comercio</h1>
                        <p className="text-gray-400">Bienvenido, {session?.user?.name || 'Comerciante'}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            + Registrar Deuda
                        </button>
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </header>

                <main>
                    <div className="mb-8 p-6 bg-gray-800 shadow-xl rounded-2xl">
                        <h2 className="text-xl font-bold mb-4">Consultar Deudor por DNI</h2>
                        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-4">
                            <input
                                type="text"
                                value={searchDni}
                                onChange={(e) => setSearchDni(e.target.value)}
                                placeholder="Ingrese DNI del cliente para ver su historial"
                                className="flex-grow p-3 border border-gray-700 bg-gray-900 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" disabled={searchLoading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50 transition-colors">
                                {searchLoading ? 'Buscando...' : 'Buscar'}
                            </button>
                        </form>
                        {searchError && <p className="text-red-400 mt-4 text-center">{searchError}</p>}
                        {updateError && <p className="text-red-400 mt-4 text-center">{updateError}</p>}
                    </div>

                    {searchedClient && (
                        <div className="mb-8 bg-gray-800 p-4 sm:p-6 rounded-2xl shadow-xl">
                            <h3 className="text-2xl font-semibold">{searchedClient.firstName} {searchedClient.lastName}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 mb-4 text-gray-400">
                                <p><strong>DNI:</strong> {searchedClient.dni}</p>
                                <p><strong>Email:</strong> {searchedClient.email || 'N/A'}</p>
                                <p><strong>Teléfono:</strong> {searchedClient.phone || 'N/A'}</p>
                            </div>
                            <h4 className="text-xl font-semibold mt-6 mb-4">Historial de Deudas</h4>
                            {searchedClient.debts.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full leading-normal">
                                        <thead>
                                            <tr>
                                                <th className="py-3 px-4 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-l-lg">Monto</th>
                                                <th className="py-3 px-4 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Descripción</th>
                                                <th className="py-3 px-4 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Comercio</th>
                                                <th className="py-3 px-4 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Estado</th>
                                                <th className="py-3 px-4 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-r-lg">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700/50">
                                            {searchedClient.debts.map(debt => (
                                                <tr key={debt.id}>
                                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-white">${debt.amount.toFixed(2)}</td>
                                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">{debt.description}</td>
                                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">{debt.comercio.name}</td>
                                                    <td className="py-4 px-4 whitespace-nowrap text-sm">
                                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[debt.status]}`}>
                                                            {statusMap[debt.status]}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-300">{new Date(debt.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="mt-4 text-center text-gray-400">Este cliente no tiene deudas registradas.</p>
                            )}
                        </div>
                    )}

                    <div className="overflow-x-auto mt-8 bg-gray-800 shadow-xl rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-4">Mis Clientes Deudores</h2>
                        <div className="inline-block min-w-full overflow-hidden">
                            <table className="min-w-full leading-normal">
                                <thead>
                                    <tr>
                                        <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-l-lg">Nombre</th>
                                        <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">DNI</th>
                                        <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Deuda Total</th>
                                        <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Deudas Activas</th>
                                        <th className="py-3 px-5 bg-gray-700/50 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider rounded-r-lg">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50">
                                    {clients.map(client => (
                                        <tr key={client.id} className="hover:bg-gray-700/50">
                                            <td className="py-4 px-5">
                                                <p className="text-white whitespace-no-wrap">{client.firstName} {client.lastName}</p>
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="text-gray-300 whitespace-no-wrap">{client.dni}</p>
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="text-red-400 font-semibold whitespace-no-wrap">${(client.totalDebt || 0).toFixed(2)}</p>
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="text-gray-300 whitespace-no-wrap">{client.activeDebts}</p>
                                            </td>
                                            <td className="py-4 px-5 text-center">
                                                <button
                                                    onClick={() => handleViewHistory(client.dni)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors"
                                                >
                                                    Ver Historial
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            
            <AddDebtModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchClients} />
        </div>
    );
}
