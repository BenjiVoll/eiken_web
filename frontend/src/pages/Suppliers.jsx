import React, { useState, useEffect } from 'react';
import { suppliersAPI } from '../services/apiService';
import { Briefcase, Search } from 'lucide-react';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Briefcase className="h-8 w-8 mr-3 text-purple-600" />
          Proveedores
        </h1>
        <p className="mt-2 text-gray-600">Lista de proveedores de materiales</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
            <p className="text-sm text-gray-600 mt-2">Contacto: {supplier.contactPerson}</p>
            <p className="text-sm text-gray-600">Teléfono: {supplier.phone}</p>
            <p className="text-sm text-gray-600">Email: {supplier.email}</p>
            <p className="text-sm text-gray-600 mt-2">{supplier.address}</p>
            <p className="text-sm text-gray-500 mt-2">RUT: {supplier.rut}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suppliers;
