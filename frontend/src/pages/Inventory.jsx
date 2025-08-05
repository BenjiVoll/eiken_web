import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI, suppliersAPI } from '../services/apiService';
import { Plus, Edit, Trash2, Search, Package, AlertTriangle, X } from 'lucide-react';
import { 
  deleteDataAlert, 
  showSuccessAlert, 
  showErrorAlert,
  createDataAlert,
  updateDataAlert 
} from '../helpers';

const Inventory = () => {
  const { isManager, isAdmin } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
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
    minStock: 5,
    supplierId: ''
  });

  useEffect(() => {
    loadInventory();
    loadSuppliers();
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

  const loadSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Confirmar la acción
      const confirmed = editingItem 
        ? await updateDataAlert('material')
        : await createDataAlert('material');
      
      if (!confirmed.isConfirmed) return;

      const inventoryData = {
        ...formData,
        unit: 'metros',
        quantity: parseInt(formData.quantity),
        minStock: parseInt(formData.minStock),
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : null
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
      showErrorAlert('Error', 'No se pudo guardar el material. Inténtalo de nuevo.');
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
      minStock: item.minStock,
      supplierId: item.supplierId ? item.supplierId.toString() : ''
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
      showErrorAlert('Error', 'No se pudo eliminar el material. Inténtalo de nuevo.');
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
      minStock: 5,
      supplierId: ''
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
                  <p className="text-sm text-gray-500 mb-1">{item.type} • {item.brand} • {item.code}</p>
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
    {showModal && (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editingItem ? 'Editar Material' : 'Agregar Nuevo Material'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Vinilo Adhesivo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color *
                </label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: 3M, Avery Dennison"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: Scotchcal, T-7500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad
                </label>
                <input
                  type="text"
                  value="metros"
                  readOnly
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Seleccionar proveedor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                {editingItem ? 'Actualizar' : 'Crear'} Material
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default Inventory;
