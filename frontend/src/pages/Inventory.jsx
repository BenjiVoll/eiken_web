import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { inventoryAPI } from '@/services/apiService';
import { Plus, Edit, Trash2, Search, Package, AlertTriangle, X } from 'lucide-react';
import {
  deleteDataAlert,
  showSuccessAlert,
  showErrorAlert,
  createDataAlert,
  updateDataAlert
} from '@/helpers';
import { getErrorMessage } from '@/helpers/errorHelper';
import InventoryModal from '@/components/forms/InventoryModal';

const Inventory = () => {
  const { isManager, isAdmin } = useAuth();
  const [inventory, setInventory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    color: '',
    brand: '',
    model: '',
    unit: 'metros',
    quantity: 0,
    minStock: 5
  });

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

  const handleSubmit = async (formDataFromModal) => {

    try {
      // Confirmar la acción
      const confirmed = editingItem
        ? await updateDataAlert('material')
        : await createDataAlert('material');

      if (!confirmed.isConfirmed) return;

      const inventoryData = {
        ...formDataFromModal,
        unit: 'metros',
        quantity: parseInt(formDataFromModal.quantity),
        minStock: parseInt(formDataFromModal.minStock)
      };

      if (editingItem) {
        await inventoryAPI.update(editingItem.id, inventoryData);
        showSuccessAlert('¡Material actualizado!', 'El material se ha actualizado correctamente');
      } else {
        await inventoryAPI.create(inventoryData);
        showSuccessAlert('¡Material creado!', 'El material se ha creado correctamente');
      }

      await loadInventory();
      resetForm();
    } catch (error) {
      console.error('Error saving inventory item:', error);
      const msg = getErrorMessage(error, 'No se pudo guardar el material. Inténtalo de nuevo.');
      showErrorAlert('Error', msg);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      color: item.color,
      brand: item.brand || '',
      model: item.model || '',
      unit: 'metros',
      quantity: item.quantity,
      minStock: item.minStock
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const result = await deleteDataAlert();

      if (result.isConfirmed) {
        await inventoryAPI.delete(id);
        await loadInventory();
        showSuccessAlert('¡Material eliminado!', 'El material se ha eliminado correctamente');
      }
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      const msg = getErrorMessage(error, 'No se pudo eliminar el material. Inténtalo de nuevo.');
      showErrorAlert('Error', msg);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      color: '',
      brand: '',
      model: '',
      unit: 'metros',
      quantity: 0,
      minStock: 5
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const filteredInventory = Array.isArray(inventory) ? inventory.filter(item =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];


  const getStockStatus = (item) => {
    const quantity = parseFloat(item.quantity);
    const minStock = parseFloat(item.minStock);

    if (quantity <= minStock) {
      return { status: 'low', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (quantity <= minStock * 2) {
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
    <>
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
            {(isManager || isAdmin) && (
              <button
                onClick={() => setShowModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
              >
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item);
              return (
                <div key={item.id} className="bg-white border rounded-lg shadow p-4 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-indigo-700 truncate">{item.name}</h2>
                      {stockStatus.status === 'low' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{item.type} • {item.brand}</p>
                    <p className="text-sm text-gray-500 mb-1">Color: {item.color}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${stockStatus.bg} ${stockStatus.color} mb-2`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  {(isManager || isAdmin) && (
                    <div className="flex justify-end space-x-2 mt-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Editar"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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

      {/* Modal para crear/editar material */}
      <InventoryModal
        isOpen={showModal}
        onClose={resetForm}
        onSave={handleSubmit}
        editingItem={editingItem}
      />
    </>
  );
};

export default Inventory;
