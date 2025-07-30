import { useState, useEffect } from 'react';
import { getImageUrl } from '../../helpers/getImageUrl';
import { showErrorAlert } from '../../helpers/sweetAlert';

const ServiceModal = ({ isOpen, onClose, onSave, service, loading }) => {
  const [imageToDelete, setImageToDelete] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    division: 'design',
    price: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [categories, setCategories] = useState([]);
  const [divisions, setDivisions] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    if (service && categories.length > 0) {
      let categoryId = '';
      if (service.category && typeof service.category === 'object' && service.category.id) {
        categoryId = service.category.id;
      } else if (typeof service.category === 'number') {
      categoryId = service.category;
    }
      setFormData({
        name: service.name || '',
        description: service.description || '',
        categoryId,
        division: service.division || '',
        price: service.price ? service.price.toString() : ''
      });
      setImagePreview(service.image ? getImageUrl(service.image) : null);
      setImageToDelete(false);
    } else if (!service) {
      setFormData({
        name: '',
        description: '',
        categoryId: '',
        division: '',
        price: ''
      });
      setImageFile(null);
      setImageError('');
      setImagePreview(null);
      setImageToDelete(false);
    }
  }, [service, isOpen, categories]);

  useEffect(() => {
    const loadApisAndData = async () => {
      const { categoriesAPI, divisionsAPI } = await import('../../services/apiService');
      try {
        const catData = await categoriesAPI.getAll();
        setCategories(catData.data || catData || []);
      } catch {
        setCategories([]);
      }
      try {
        const divData = await divisionsAPI.getAll();
        setDivisions(divData.data || divData || []);
      } catch {
        setDivisions([]);
      }
    };
    loadApisAndData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    setImageError('');
    if (e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
      // Si hay imagen previa y es edición, marcar para eliminar
      if (service && service.image) {
        setImageToDelete(true);
      }
    }
  };

  // Eliminar imagen del servicio
  const handleDeleteImage = async () => {
    setImageToDelete(true);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.division || !formData.price) {
      setImageError('Completa todos los campos obligatorios');
      return;
    }
    if (imageToDelete && service && service.id) {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/services/${service.id}/image`, {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const result = await response.json();
        if (!response.ok) {
          showErrorAlert('Error', result.error || 'No se pudo eliminar la imagen');
        }
      } catch {
        showErrorAlert('Error', 'No se pudo eliminar la imagen');
      }
    }
    await onSave(formData, imageFile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <select
                name="categoryId"
                required
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">División *</label>
              <select
                name="division"
                required
                value={formData.division}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Selecciona una división</option>
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (CLP) *</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Servicio</label>
              {imagePreview && !imageToDelete && (
                <div className="mb-2 flex items-center space-x-2">
                  <img src={imagePreview} alt="Preview" className="h-20 rounded shadow" />
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                    disabled={loading}
                  >
                    Eliminar imagen
                  </button>
                </div>
              )}
              <input
                type="file"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {imageError && <p className="text-red-600 text-sm mt-1">{imageError}</p>}
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={loading}
              >
                {service ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
