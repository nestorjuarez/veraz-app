'use client';

import { useState } from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const initialState = {
  dni: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  amount: '',
  description: '',
};

export default function AddDebtModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState(initialState);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const { error: errorMessage } = await res.json();
        throw new Error(errorMessage || 'No se pudo registrar la deuda.');
      }
      onSuccess();
      setFormData(initialState); // Limpiar el formulario
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Registrar Nueva Deuda</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg text-center text-sm mb-4">{error}</p>}
          
          <div className="space-y-4">
            <div>
              <h3 className="col-span-full font-semibold text-lg mb-3 text-gray-300 border-b border-gray-700 pb-2">Datos del Cliente</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="dni" value={formData.dni} onChange={handleChange} placeholder="DNI *" required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nombre *" required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apellido *" required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email (Opcional)" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono (Opcional)" className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 md:col-span-2" />
              </div>
            </div>

            <div>
              <h3 className="col-span-full font-semibold text-lg mt-4 mb-3 text-gray-300 border-b border-gray-700 pb-2">Datos de la Deuda</h3>
              <div className="grid grid-cols-1 gap-4">
                <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Monto *" required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción *" required className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-8">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 transition-colors">
              {loading ? 'Registrando...' : 'Registrar Deuda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
