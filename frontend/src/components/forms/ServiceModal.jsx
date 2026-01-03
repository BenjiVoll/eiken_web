import { useState, useEffect } from 'react';
import { categoriesAPI, divisionsAPI } from '@/services/apiService';
import { getImageUrl } from '@/helpers/getImageUrl';
import { showErrorAlert } from '@/helpers/sweetAlert';
import {
  X,
  Briefcase,
  FileText,
  Layers,
  DollarSign,
  Image as ImageIcon,
  Trash2,
  Save,
  FolderKanban
} from 'lucide-react';

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
  const [errors, setErrors] = useState({});
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
        price: service.price ? Math.floor(Number(service.price)).toString() : ''
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
    setErrors({});
  }, [service, isOpen, categories]);

  useEffect(() => {
    const loadApisAndData = async () => {
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
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    setImageError('');
    if (e.target.files[0]) {
      setImagePreview(URL.createObjectURL(e.target.files[0]));
      if (service && service.image) {
        setImageToDelete(true);
      }
    }
  };

  const handleDeleteImage = async () => {
    setImageToDelete(true);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Por favor ingresa el nombre del servicio.';
    }
    if (!formData.description || !formData.description.trim()) {
      newErrors.description = 'Por favor ingresa una descripción.';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Por favor selecciona una categoría.';
    }
    if (!formData.division) {
      newErrors.division = 'Por favor selecciona una división.';
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) < 0 || !Number.isInteger(Number(formData.price))) {
      newErrors.price = 'Por favor ingresa un precio válido.';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">

          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  {service ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h3>
                <p className="mt-1 text-blue-100 text-sm opacity-90">
                  {service
                    ? 'Actualiza la información del servicio.'
                    : 'Añade un nuevo servicio al catálogo.'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-white/20 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Nombre del Servicio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del Servicio *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                    placeholder="Ej: Diseño de Logo Corporativo"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción *
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all ${errors.description ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                    placeholder="Describe los detalles del servicio..."
                  />
                </div>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Layers className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer ${errors.categoryId ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
              </div>

              {/* División */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  División *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FolderKanban className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-10 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer ${errors.division ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                  >
                    <option value="">Selecciona una división</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.name}>{div.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.division && <p className="text-red-500 text-xs mt-1">{errors.division}</p>}
              </div>

              {/* Precio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Precio Base (CLP) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="1"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all font-bold text-gray-900 ${errors.price ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                  />
                </div>
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>

              {/* Imagen */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagen del Servicio
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors bg-gray-50 text-center">
                  {imagePreview && !imageToDelete ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="h-48 rounded-lg shadow-md object-cover" />
                      <button
                        type="button"
                        onClick={handleDeleteImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm transition-transform hover:scale-110"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="bg-blue-100 p-3 rounded-full mb-3">
                        <ImageIcon className="h-8 w-8 text-blue-500" />
                      </div>
                      <label className="cursor-pointer">
                        <span className="text-blue-600 font-semibold hover:text-blue-700 hover:underline">Sube una imagen</span>
                        <span className="text-gray-500"> o arrastra y suelta aquí</span>
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          disabled={loading}
                        />
                      </label>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG, WEB (Max. 5MB)</p>
                    </div>
                  )}
                </div>
                {imageError && <p className="text-red-500 text-xs mt-1">{imageError}</p>}
              </div>

            </div>

            {/* Footer */}
            <div className="mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-medium shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <Save className="h-5 w-5" />
                <span>{service ? 'Guardar Cambios' : 'Crear Servicio'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
