import React, { useState, useEffect } from 'react';
import { showSuccessAlert, showErrorAlert, confirmAlert } from '../helpers/sweetAlert';
import ImageModal from '../components/forms/ImageModal';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, categoriesAPI, divisionsAPI } from '../services/apiService';
import { Plus, Edit, Trash2, Search, Settings, DollarSign } from 'lucide-react';
import { getImageUrl } from '../helpers/getImageUrl';
import ServiceModal from '../components/forms/ServiceModal';

const Services = () => {
  // Estado para el modal de imagen
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const { isManager } = useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadServices();
    loadCategories();
    loadDivisions();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll();
      setServices(response.data || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch {
      setCategories([]);
    }
  };

  const loadDivisions = async () => {
    try {
      const response = await divisionsAPI.getAll();
      setDivisions(response.data || []);
    } catch {
      setDivisions([]);
    }
  };

  // Guardar servicio y subir imagen
  const handleSaveService = async (formData, imageFile) => {
    try {
      setModalLoading(true);
      const serviceData = {
        ...formData,
        price: parseFloat(formData.price),
        category: formData.categoryId,
        division: formData.division
      };
      // Eliminar posibles campos extra
      delete serviceData.categoryId;
      let savedService;
      if (editingService) {
        const response = await servicesAPI.update(editingService.id, serviceData);
        savedService = response.data;
        showSuccessAlert('¡Actualizado!', 'El servicio ha sido actualizado correctamente');
      } else {
        const response = await servicesAPI.create(serviceData);
        savedService = response.data;
        showSuccessAlert('¡Creado!', 'El servicio ha sido creado correctamente');
      }
      // Subir imagen si existe y el servicio se guardó correctamente
      if (imageFile && savedService && savedService.id) {
        const formDataImg = new FormData();
        formDataImg.append('image', imageFile);
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const token = localStorage.getItem('token');
        await fetch(`${baseUrl}/services/${savedService.id}/image`, {
          method: 'POST',
          body: formDataImg,
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Solo mostrar la alerta si se está editando un servicio existente
        if (editingService) {
          showSuccessAlert('¡Imagen subida!', 'La imagen del servicio se ha subido correctamente');
        }
      }
      await loadServices();
      setShowModal(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      let errorMessage = 'Error al guardar el servicio';
      if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
        const validationErrors = error.response.data.details.map(detail => detail.message || detail).join(', ');
        errorMessage = `Errores de validación: ${validationErrors}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showErrorAlert('Error', errorMessage);
    } finally {
      setModalLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const result = await confirmAlert('¿Estás seguro de que quieres eliminar este servicio?', 'Esta acción no se puede deshacer');
    if (result.isConfirmed) {
      try {
        await servicesAPI.delete(id);
        await loadServices();
        showSuccessAlert('¡Eliminado!', 'El servicio ha sido eliminado correctamente');
      } catch {
        showErrorAlert('Error', 'No se pudo eliminar el servicio');
      }
    }
  };

  const handleCloseModal = () => {
    setEditingService(null);
    setShowModal(false);
  };

  const filteredServices = Array.isArray(services) ? services.filter(service =>
    service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (service.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    service.division?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price);
  };

  const getDivisionColor = (division) => {
    switch (division) {
      case 'design':
        return 'bg-blue-100 text-blue-800';
      case 'truck-design':
        return 'bg-green-100 text-green-800';
      case 'racing-design':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Settings className="h-8 w-8 mr-3 text-blue-600" />
              Servicios
            </h1>
            <p className="mt-2 text-gray-600">
              Gestiona los servicios ofrecidos por Eiken Design
            </p>
          </div>
          {isManager && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar servicios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center" style={{ borderBottom: '1px solid #eee' }}>
              {service.image ? (
                <img
                  src={getImageUrl(service.image)}
                  alt={service.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => {
                    setModalImageUrl(getImageUrl(service.image));
                    setShowImageModal(true);
                  }}
                />
              ) : (
                <span className="text-gray-400 text-sm">Sin imagen</span>
              )}
            </div>
            <ImageModal
              isOpen={showImageModal}
              imageUrl={modalImageUrl}
              onClose={() => setShowImageModal(false)}
            />
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                {isManager && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {service.description}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">División:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDivisionColor(service.division)}`}>
                    {divisions.find(d => d.id === service.division)?.name || 'Sin división'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Categoría:</span>
                  <span className="text-sm text-gray-900">{categories.find(c => c.id === service.category)?.name || 'Sin categoría'}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-500 flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Precio:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron servicios</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando un nuevo servicio.'}
          </p>
        </div>
      )}

      {/* Modal */}
      <ServiceModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveService}
        service={editingService}
        loading={modalLoading}
      />
    </div>
  );
};

export default Services;
