import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { suppliersAPI } from '../services/apiService';
import { Briefcase, Search, Plus, Edit, Trash2, Globe, Phone, Mail, MapPin } from 'lucide-react';
import SupplierModal from '../components/forms/SupplierModal';
import { deleteDataAlert, showSuccessAlert, showErrorAlert } from '../helpers/sweetAlert';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const { isManager, isAdmin } = useAuth();

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
      showErrorAlert('Error', 'No se pudieron cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDeleteSupplier = async (supplier) => {
    const result = await deleteDataAlert();
    if (result.isConfirmed) {
      try {
        await suppliersAPI.delete(supplier.id);
        showSuccessAlert('¡Eliminado!', 'El proveedor ha sido eliminado correctamente');
        loadSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
        showErrorAlert('Error', 'No se pudo eliminar el proveedor');
      }
    }
  };

  const handleSaveSupplier = async (formData) => {
    try {
      setModalLoading(true);
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, formData);
        showSuccessAlert('¡Actualizado!', 'El proveedor ha sido actualizado correctamente');
      } else {
        await suppliersAPI.create(formData);
        showSuccessAlert('¡Creado!', 'El proveedor ha sido creado correctamente');
      }
      setIsModalOpen(false);
      loadSuppliers();
    } catch (error) {
      let errorMsg = 'No se pudo guardar el proveedor.';
      if (error.response) {
        // Mensaje amigable para RUT duplicado
        if (error.response.data?.message?.toLowerCase().includes('rut')) {
          if (error.response.data?.message?.toLowerCase().includes('existe')) {
            errorMsg = 'Ya existe un proveedor registrado con ese RUT. Por favor verifica el dato.';
          } else {
            errorMsg = 'El RUT ingresado no es válido o ya está registrado.';
          }
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        }
        // Si hay detalles de validación, los mostramos también
        if (error.response.data?.details && Array.isArray(error.response.data.details)) {
          errorMsg += '\n' + error.response.data.details.map(d => d.message).join('\n');
        }
      }
      showErrorAlert('Error', errorMsg);
    } finally {
      setModalLoading(false);
    }
  };

  const filteredSuppliers = Array.isArray(suppliers) ? suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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
              <Briefcase className="h-8 w-8 mr-3 text-purple-600" />
              Proveedores
            </h1>
            <p className="mt-2 text-gray-600">Gestiona los proveedores de materiales</p>
          </div>
          {(isManager || isAdmin) && (
            <button
              onClick={handleCreateSupplier}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proveedor
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
            placeholder="Buscar proveedores por nombre, contacto o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con un término de búsqueda diferente' : 'Comienza creando un nuevo proveedor'}
          </p>
          {!searchTerm && (isManager || isAdmin) && (
            <div className="mt-6">
              <button
                onClick={handleCreateSupplier}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {supplier.name}
                  </h3>
                  {(isManager || isAdmin) && (
                    <div className="flex space-x-2 ml-2">
                      <button
                        onClick={() => handleEditSupplier(supplier)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Editar proveedor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Eliminar proveedor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {supplier.contactPerson && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Contacto:</span>
                      <span className="ml-2">{supplier.contactPerson}</span>
                    </div>
                  )}

                  {supplier.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}

                  {supplier.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a 
                        href={`mailto:${supplier.email}`}
                        className="text-blue-600 hover:text-blue-800 truncate"
                      >
                        {supplier.email}
                      </a>
                    </div>
                  )}

                  {supplier.website && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Globe className="h-4 w-4 mr-2 text-gray-400" />
                      <a 
                        href={supplier.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 truncate"
                      >
                        Sitio web
                      </a>
                    </div>
                  )}

                  {supplier.address && (
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{supplier.address}</span>
                    </div>
                  )}

                  {supplier.rut && (
                    <div className="text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <span className="font-medium">RUT:</span> {supplier.rut}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SupplierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSupplier}
        supplier={editingSupplier}
        loading={modalLoading}
      />
    </div>
  );
};

export default Suppliers;
