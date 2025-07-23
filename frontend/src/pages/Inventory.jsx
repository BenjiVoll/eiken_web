import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI } from '../services/apiService';
import { Plus, Edit, Trash2, Search, Package, AlertTriangle } from 'lucide-react';

const Inventory = () => {
  const { isManager } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll();
      setInventory(response.data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const getStockStatus = (item) => {
    if (item.quantity <= item.minStock) {
      return { status: 'low', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (item.quantity <= item.minStock * 2) {
      return { status: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    }
    return { status: 'good', color: 'text-green-600', bg: 'bg-green-100' };
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="h-8 w-8 mr-3 text-green-600" />
              Inventario
            </h1>
            <p className="mt-2 text-gray-600">
              Gestión de materiales y suministros
            </p>
          </div>
          {isManager && (
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Material
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar en inventario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredInventory.map((item) => {
            const stockStatus = getStockStatus(item);
            
            return (
              <li key={item.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.type} • {item.brand} • {item.code}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          {stockStatus.status === 'low' && (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Color: {item.color} • Ancho: {item.width}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <div className="flex items-center space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                              {item.quantity} {item.unit}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {formatPrice(item.unitCost)} / {item.unit}
                            </span>
                            {isManager && (
                              <div className="flex space-x-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-800">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron materiales</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'El inventario está vacío.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Inventory;
