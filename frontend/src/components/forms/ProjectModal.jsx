import React, { useState, useEffect } from 'react';
import { categoriesAPI, divisionsAPI } from '../../services/apiService';
import { getImageUrl } from '../../helpers/getImageUrl';
import { showErrorAlert } from '../../helpers/sweetAlert';
import { X } from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, onSave, project = null, loading = false, clients = [], onImageUpload }) => {
  const [imageToDelete, setImageToDelete] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    categoryId: '',
    division: '',
    status: 'Pendiente',
    priority: 'Bajo',
    budgetAmount: '',
    notes: '',
    quoteId: null
  });
  const [categories, setCategories] = useState([]);
  const [divisions, setDivisions] = useState([]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        clientId: project.clientId || '',
        categoryId: project.category?.id || '',
        division: project.division?.id || '',
        status: project.status || 'Pendiente',
        priority: project.priority || 'Bajo',
        budgetAmount: project.budgetAmount || '',
        notes: project.notes || '',
        quoteId: project.quoteId || null
      });
      setImagePreview(project.image ? getImageUrl(project.image) : null);
      setImageToDelete(false);
    } else {
      setFormData({
        title: '',
        description: '',
        clientId: '',
        categoryId: '',
        division: '',
        status: 'Pendiente',
        priority: 'Bajo',
        budgetAmount: '',
        notes: '',
        quoteId: null
      });
      setImagePreview(null);
      setImageToDelete(false);
    }
    // Cargar categorías y divisiones dinámicamente (siempre)
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getAll();
        setCategories(res.data || []);
      } catch {
        setCategories([]);
      }
    };
    const fetchDivisions = async () => {
      try {
        const res = await divisionsAPI.getAll();
        setDivisions(res.data || []);
      } catch {
        setDivisions([]);
      }
    };
    fetchCategories();
    fetchDivisions();
    setErrors({});
  }, [project, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    // Solo validar clientId si estamos creando un nuevo proyecto
    if (!project && !formData.clientId) {
      newErrors.clientId = 'Debe seleccionar un cliente';
    }

    if (formData.budgetAmount && isNaN(formData.budgetAmount)) {
      newErrors.budgetAmount = 'El presupuesto debe ser un número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Estado para la imagen
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const submitData = {
      ...formData,
      budgetAmount: formData.budgetAmount ? parseFloat(formData.budgetAmount) : null
    };
    // Eliminar imagen si está marcada para borrar y existe el proyecto
    if (imageToDelete && project && project.id) {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/projects/${project.id}/image`, {
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
    // Guardar proyecto
    const savedProject = await onSave(submitData);
    // Subir imagen si corresponde
    if (imageFile && savedProject && savedProject.id && typeof onImageUpload === 'function') {
      await onImageUpload(savedProject.id, imageFile);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setImageFile(files[0]);
      setImageError('');
      if (files[0]) {
        setImagePreview(URL.createObjectURL(files[0]));
        setImageToDelete(false);
      }
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (!isOpen) return null;



  const statusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'En Proceso', label: 'En Proceso' },
    { value: 'Aprobado', label: 'Aprobado' },
    { value: 'Completado', label: 'Completado' },
    { value: 'Cancelado', label: 'Cancelado' }
  ];

  const priorityOptions = [
    { value: 'Bajo', label: 'Bajo' },
    { value: 'Medio', label: 'Medio' },
    { value: 'Alto', label: 'Alto' },
    { value: 'Urgente', label: 'Urgente' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título del Proyecto *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
                required
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {project ? 'Cliente' : 'Cliente *'}
              </label>
              {project ? (
                // Modo edición: mostrar cliente actual con opción de cambiar
                <div className="space-y-2">
                  <div className="bg-gray-50 border border-gray-300 rounded-md px-3 py-2">
                    <span className="text-gray-700">
                      {clients.find(c => c.id == formData.clientId)?.name || 'Cliente no encontrado'}
                    </span>
                  </div>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Cambiar cliente
                    </summary>
                    <select
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    >
                      <option value="">Seleccionar nuevo cliente</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </details>
                </div>
              ) : (
                // Modo creación: select normal obligatorio
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.clientId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={loading}
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.clientId && <p className="text-red-600 text-sm mt-1">{errors.clientId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                required
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                División
              </label>
              <select
                name="division"
                value={formData.division}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
                required
              >
                <option value="">Seleccionar división</option>
                {divisions.map(div => (
                  <option key={div.id} value={div.id}>{div.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prioridad
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                {priorityOptions.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Presupuesto (CLP)
              </label>
              <input
                type="number"
                name="budgetAmount"
                value={formData.budgetAmount}
                onChange={handleChange}
                placeholder="0"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.budgetAmount ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.budgetAmount && <p className="text-red-600 text-sm mt-1">{errors.budgetAmount}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-y"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Proyecto</label>
            {imagePreview && !imageToDelete && (
              <div className="mb-2 flex items-center space-x-2">
                <img src={imagePreview} alt="Preview" className="h-20 rounded shadow" />
                <button
                  type="button"
                  onClick={() => { setImageToDelete(true); setImagePreview(null); }}
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
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={loading}
            />
            {imageError && <p className="text-red-600 text-sm mt-1">{imageError}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (project ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
