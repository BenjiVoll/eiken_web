import React, { useState, useEffect } from 'react';
import { categoriesAPI, divisionsAPI } from '@/services/apiService';
import { getImageUrl } from '@/helpers/getImageUrl';
import { showErrorAlert, showSuccessAlert } from '@/helpers/sweetAlert';
import {
  X,
  Briefcase,
  User,
  Layers,
  FolderKanban,
  Activity,
  Flag,
  DollarSign,
  Star,
  FileText,
  Clipboard,
  Image as ImageIcon,
  Trash2,
  Save
} from 'lucide-react';

const ProjectModal = ({ isOpen, onClose, onSave, project = null, loading = false, clients = [], onImageUpload, noClientsMessage }) => {
  const [imageToDelete, setImageToDelete] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    clientName: '',
    categoryId: '',
    division: '',
    status: 'Pendiente',
    priority: 'Bajo',
    budgetAmount: '',
    notes: '',
    quoteId: null,
    isFeatured: false
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
        budgetAmount: project.budgetAmount ? Math.floor(Number(project.budgetAmount)).toString() : '',
        notes: project.notes || '',
        quoteId: project.quoteId || null,
        isFeatured: project.isFeatured || false
      });
      setImagePreview(project.image ? getImageUrl(project.image) : null);
      setImageToDelete(false);
    } else {
      setFormData({
        title: '',
        description: '',
        clientId: '',
        clientName: '',
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
    // Ahora acepta clientId O clientName (para crear nuevo cliente)
    if (!project && !formData.clientId && !formData.clientName?.trim()) {
      newErrors.clientId = 'Debe seleccionar o ingresar un cliente';
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
      clientId: formData.clientId && formData.clientId !== '' ? parseInt(formData.clientId, 10) : undefined,
      categoryId: formData.categoryId && formData.categoryId !== '' ? parseInt(formData.categoryId, 10) : undefined,
      division: formData.division && formData.division !== '' ? parseInt(formData.division, 10) : undefined,
      budgetAmount: formData.budgetAmount && formData.budgetAmount !== '' ? parseFloat(formData.budgetAmount) : null
    };
    // Limpiar campos undefined para que no se envíen
    Object.keys(submitData).forEach(key => submitData[key] === undefined && delete submitData[key]);
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
        } else {
          showSuccessAlert('Imagen eliminada correctamente');
          setImagePreview(null);
          setImageToDelete(false);
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
    // Recargar datos del proyecto actualizado
    if (savedProject && savedProject.id) {
      try {
        const baseUrl = import.meta.env.VITE_BASE_URL;
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/projects/${savedProject.id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const updated = await response.json();
        setImagePreview(updated.image ? getImageUrl(updated.image) : null);
        setImageToDelete(false);
      } catch {
        // Si falla, no actualiza el preview
      }
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
      [name]: type === 'checkbox' ? e.target.checked : value
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">

          {/* Header */}
          <div className="relative bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  {project ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h3>
                <p className="mt-1 text-orange-100 text-sm opacity-90">
                  {project
                    ? 'Gestiona el estado y los detalles de este proyecto.'
                    : 'Inicia un nuevo proyecto asignado a un cliente.'}
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

              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título del Proyecto *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                    placeholder="Ej: Reforma de Oficinas Centrales"
                    required
                  />
                </div>
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {project ? 'Cliente Asignado' : 'Cliente *'}
                </label>
                {noClientsMessage && (
                  <div className="mb-2 p-2 bg-amber-50 text-amber-800 rounded-lg text-sm border border-amber-200 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {noClientsMessage}
                  </div>
                )}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  {project ? (
                    // Modo edición - mostrar cliente actual con opción de cambiar
                    <div>
                      <div className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                        {clients.find(c => c.id == formData.clientId)?.name || 'Cliente no encontrado'}
                      </div>
                      <details className="mt-2 text-sm">
                        <summary className="cursor-pointer text-orange-600 hover:text-orange-700 font-medium">
                          Cambiar cliente
                        </summary>
                        <select
                          name="clientId"
                          value={formData.clientId}
                          onChange={handleChange}
                          className="block w-full mt-2 pl-3 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          disabled={loading || clients.length === 0}
                        >
                          <option value="">Seleccionar nuevo cliente</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                          ))}
                        </select>
                      </details>
                    </div>
                  ) : (
                    // Modo creación - campo híbrido: escribir o seleccionar
                    <div>
                      <input
                        type="text"
                        name="clientName"
                        value={formData.clientName || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Buscar si coincide con un cliente existente
                          const matchingClient = clients.find(c =>
                            c.name.toLowerCase() === value.toLowerCase()
                          );
                          setFormData(prev => ({
                            ...prev,
                            clientName: value,
                            clientId: matchingClient ? matchingClient.id : ''
                          }));
                          if (errors.clientId) {
                            setErrors(prev => ({ ...prev, clientId: '' }));
                          }
                        }}
                        list="client-suggestions"
                        className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all ${errors.clientId ? 'border-red-500' : 'border-gray-200'}`}
                        disabled={loading}
                        placeholder="Escribir nombre o seleccionar de la lista"
                        required
                        autoComplete="off"
                      />
                      <datalist id="client-suggestions">
                        {clients.map(client => (
                          <option key={client.id} value={client.name} />
                        ))}
                      </datalist>
                      {formData.clientName && !formData.clientId && (
                        <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          Se creará un nuevo cliente con este nombre
                        </p>
                      )}
                      {formData.clientId && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          Cliente existente seleccionado
                        </p>
                      )}
                    </div>
                  )}
                </div>
                {errors.clientId && <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>}
              </div>

              {/* Presupuesto */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Presupuesto (CLP)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="budgetAmount"
                    value={formData.budgetAmount}
                    onChange={handleChange}
                    placeholder="0"
                    className={`block w-full pl-10 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all font-medium ${errors.budgetAmount ? 'border-red-500' : 'border-gray-200'}`}
                    disabled={loading}
                  />
                </div>
                {errors.budgetAmount && <p className="text-red-500 text-xs mt-1">{errors.budgetAmount}</p>}
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoría
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Layers className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
                    disabled={loading}
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* División */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  División
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FolderKanban className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
                    disabled={loading}
                    required
                  >
                    <option value="">Seleccionar división</option>
                    {divisions.map(div => (
                      <option key={div.id} value={div.id}>{div.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estado del Proyecto
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prioridad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Flag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all appearance-none cursor-pointer"
                    disabled={loading}
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>{priority.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destacado (solo si completado) */}
              {formData.status === 'Completado' && (
                <div className="md:col-span-2">
                  <label className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-xl cursor-pointer hover:bg-orange-100 transition-colors">
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      disabled={loading}
                      className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 flex items-center font-medium text-orange-900">
                      <Star className="h-5 w-5 text-orange-500 mr-2 fill-orange-500" />
                      Destacar en Portafolio (visible en el sitio público)
                    </span>
                  </label>
                </div>
              )}

              {/* Descripción */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
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
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all"
                    disabled={loading}
                    placeholder="Detalles sobre el alcance del proyecto..."
                  />
                </div>
              </div>

              {/* Notas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notas Adicionales
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <Clipboard className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={2}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 transition-all"
                    disabled={loading}
                    placeholder="Información interna relevante..."
                  />
                </div>
              </div>

              {/* Imagen */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Imagen de Portada
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-orange-400 transition-colors bg-gray-50 text-center">
                  {imagePreview && !imageToDelete ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="h-48 rounded-lg shadow-md object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageToDelete(true);
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 shadow-sm transition-transform hover:scale-110"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="bg-orange-100 p-3 rounded-full mb-3">
                        <ImageIcon className="h-8 w-8 text-orange-500" />
                      </div>
                      <label className="cursor-pointer">
                        <span className="text-orange-600 font-semibold hover:text-orange-700 hover:underline">Sube una imagen</span>
                        <span className="text-gray-500"> o arrastra y suelta aquí</span>
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleChange}
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
                className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 font-medium shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <Save className="h-5 w-5" />
                <span>{loading ? 'Guardando...' : (project ? 'Guardar Cambios' : 'Crear Proyecto')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
