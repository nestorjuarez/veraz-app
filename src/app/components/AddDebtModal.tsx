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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Registrar Nueva Deuda</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <h3 className="col-span-full font-semibold text-lg mb-2">Datos del Cliente</h3>
            <input name="dni" value={formData.dni} onChange={handleChange} placeholder="DNI *" required className="p-2 border rounded"/>
            <input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Nombre *" required className="p-2 border rounded"/>
            <input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Apellido *" required className="p-2 border rounded"/>
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email (Opcional)" className="p-2 border rounded"/>
            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Teléfono (Opcional)" className="p-2 border rounded col-span-full"/>
            
            <h3 className="col-span-full font-semibold text-lg mt-4 mb-2">Datos de la Deuda</h3>
            <input name="amount" type="number" value={formData.amount} onChange={handleChange} placeholder="Monto *" required className="p-2 border rounded"/>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descripción *" required className="p-2 border rounded col-span-full h-24"/>
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-300">
              {loading ? 'Registrando...' : 'Registrar Deuda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
