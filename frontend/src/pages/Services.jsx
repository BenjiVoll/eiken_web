import React, { useState, useEffect } from 'react';
import ServicesHeader from '@/components/services/ServicesHeader';
import ServicesSearchBar from '@/components/services/ServicesSearchBar';
import ServicesTable from '@/components/services/ServicesTable';
import { showSuccessAlert, showErrorAlert, confirmAlert } from '@/helpers/sweetAlert';
import ImageModal from '@/components/forms/ImageModal';
import { useAuth } from '@/context/AuthContext';
import { servicesAPI, categoriesAPI, divisionsAPI } from '@/services/apiService';
import { Plus, Edit, Trash2, Search, Settings, DollarSign } from 'lucide-react';
import { getImageUrl } from '@/helpers/getImageUrl';
import ServiceModal from '@/components/forms/ServiceModal';

const Services = () => {

  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState('');
  const { isManager, isAdmin } = useAuth();
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
    String(service.division || "").toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
      <ServicesHeader isManager={isManager} isAdmin={isAdmin} onCreate={() => { setEditingService(null); setShowModal(true); }} />
      <ServicesSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ServicesTable
        services={filteredServices}
        categories={categories}
        divisions={divisions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        getDivisionColor={getDivisionColor}
        formatPrice={formatPrice}
        isManager={isManager}
        setModalImageUrl={setModalImageUrl}
        setShowImageModal={setShowImageModal}
        getImageUrl={getImageUrl}
        showImageModal={showImageModal}
        modalImageUrl={modalImageUrl}
      />
      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Settings className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron servicios</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'Comienza creando un nuevo servicio.'}
          </p>
        </div>
      )}
      <ServiceModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveService}
        service={editingService}
        loading={modalLoading}
      />
      <ImageModal
        isOpen={showImageModal}
        imageUrl={modalImageUrl}
        onClose={() => setShowImageModal(false)}
      />
    </div>
  );
};

export default Services;
